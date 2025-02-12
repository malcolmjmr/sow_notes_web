<script>
    import { onMount, onDestroy } from 'svelte';
    import { tick } from 'svelte';

    import BlockDetails from './block/BlockDetails.svelte';
    import { documents, activeBlockId, activeDocumentId } from '../store';
    import { v4 as uuidv4 } from 'uuid';
    import { Editor } from '@tiptap/core';

    import StarterKit from '@tiptap/starter-kit';
    import Block from './block/Block.js';
    import { Suggestion } from './block/Suggestion.js';
    import LLMService from '../services/llm.js';
  import DocumentDetails from './details/DocumentDetails.svelte';

    let loaded = false;
    let view = 'document';
    let lastViewUpdate = Date.now();

    let document = {};
    let activeBlock = {};
    let editor;
    let editorElement;
    let suggestedText = null;
    let autocompleteStartingText = null;

    let showDetails = true;

    documents.subscribe((value) => {
        if (document?.id && value[document.id]) {
            document = value[document.id];
        }
    });

    function blocksToTipTapContent(blocks) {
        return {
            type: 'doc',
            content: blocks.map(block => ({
                type: 'block',
                attrs: {
                    id: block.id,
                    tabCount: block.tabCount,
                },
                content: [{
                    type: 'paragraph',
                    content: block.content ? [{
                        type: 'text',
                        text: block.content
                    }] : []
                }]
            }))
        };
    }

    function tipTapToBlocks(editorContent) {

        return editorContent.content.map((node) => {
            let content = node.content[0]?.content
            content = content ? content[0]?.text : '';

            return {
                id: node.attrs.id,
                content: content,
                tabCount: node.attrs.tabCount,
                documentId: document.id,
                lastAccessed: Date.now(),
                updated: Date.now()
            };
        });
    }

    // Add state variables
    let isAutocompleteActive = false;
    let autocompleteScope = 'word'; // word, sentence, paragraph
    let suggestions = [];
    let filteredSuggestions = [];
    let filterText = '';
    let llmService = new LLMService();

    function initEditor() {
        if (!editorElement || !document) return;
        
        editor = new Editor({
            element: editorElement,
            extensions: [
                // StarterKit.configure({
                //     paragraph: {
                //         keepMarks: true
                //     }
                // }),
                StarterKit,
                Block,
                Suggestion
            ],
            content: blocksToTipTapContent(document.blocks),
            editable: true,
            onSelectionUpdate: ({ editor }) => {
                // Get current cursor position
                let pos = editor.state.selection.$anchor.pos;
                pos = editor.state.doc.resolve(pos);
                
                // Walk up the tree to find block node
                for (let depth = pos.depth; depth > 0; depth--) {
                    const node = pos.node(depth);
                    if (node.type.name === 'block') {

                        if (node.attrs.id === $activeBlockId) return;
                        activeBlockId.set(node.attrs.id);
                        activeBlock = document.blocks.find(block => block.id === node.attrs.id);
                        window.activeBlockId = node.attrs.id;
                        console.log('activeBlockId', node.attrs.id);
                    
                        break;
                    }
                }
            },

            onUpdate: async ({ editor, transaction }) => {
                let pos = editor.state.selection.$anchor.pos;
                pos = editor.state.doc.resolve(pos);
                const currentNode = pos.node();
                let text = currentNode.textContent;


                cursorPositionX = editor.view.coordsAtPos(pos.pos - 1).left + 5;
                cursorPositionY = editor.view.coordsAtPos(pos.pos - 1).top;

                
                
                // Handle autocomplete trigger
                if (text.endsWith('/')) {
                    text = text.slice(0, -1); // Remove the '/' trigger
                    // Remove the '/' trigger
                    editor.commands.deleteRange({ 
                        from: pos.pos - 1,
                        to: pos.pos 
                    });
                    // add a space if text is not empty and text does not end with a space
                    if (text !== '' && !text.endsWith(' ')) {
                        text += ' ';
                        editor.commands.insertContent(' ');
                    }
                    if (isAutocompleteActive) {

                        isAutocompleteActive = false;
                    } else {
                        isAutocompleteActive = true;
                        autocompleteStartingText = text;
                        filterText = '';
                        
                        // Get initial suggestions
                        suggestions = await generateSuggestions();
                        filteredSuggestions = [...suggestions];

                        
                    }
                    

                    


                    

                } else if (isAutocompleteActive) {
                    // Handle scope cycling with Shift
                    
                    if (!autocompleteStartingText) {
                        autocompleteStartingText = text;
                    }

                    filterText = text.replace(autocompleteStartingText, ''); 
                    

                        // filteredSuggestions = suggestions.filter(s => 
                        //     filterText == '' || s.toLowerCase().includes(filterText.toLowerCase())
                        // );
                    
                }

                const blocks = tipTapToBlocks(editor.getJSON());
                updateDocument({ ...document, blocks });
            }
        });
        
    }

    async function generateSuggestions() {

        let text = autocompleteStartingText;
        let scope = autocompleteScope;
        let prompt = `You are embedded in a document editing application. You are tasked with suggesting text that the user can incorporate into their document.

DOCUMENT TITLE: ${document.title}
${ document.outline ? `DOCUMENT OUTLINE: \n${document.outline}` : '' }
${text != '' ? `TEXT: \n${text}` : ''}

${
    scope === 'word' ? 
        text !== '' 
            ? `Provide 5 suggestions for words to continue the text.`
            : `Provide 5 suggestions for words to start a sentence.` 
    : scope === 'sentence' ? 
        text !== '' 
            ? `Provide 5 suggested sentences to continue the text.`
            : `Provide 5 suggested sentences to start the text.` 
    : scope === 'paragraph' ? 
        text !== '' 
            ? `Provide 5 suggested paragraphs to continue the text.`
            : `Provide 5 suggested paragraphs to start the text.`
    : `Provide 5 autocomplete suggestions.`
}

Separate each suggestion with "|". Do not provide any additional text.
`;

        console.log('prompt:');
        console.log(prompt);

        
        const suggestions = await llmService.chat({
            message: prompt,
            history: [],
            temperature: 0.7
        });

        console.log('suggestion:');
        console.log(suggestions);
        
        return suggestions.split('|');
    }

    onMount(async () => {
        document = $documents[$activeDocumentId];
        loaded = true;
        await tick(); // Wait for DOM update
        initEditor();
    });

    onDestroy(() => {
        if (editor) editor.destroy();
    });

    function updateDocument(newDocument) {
        document = { ...newDocument };
        $documents[document.id] = document;
    }


    let cursorPositionX = 0;
    let cursorPositionY = 0;

    async function onKeyDown(event) {
        if (event.key === 'Shift') {

            if (!isAutocompleteActive) return;

            console.log('shift key');
            let text = 
            autocompleteScope = autocompleteScope === 'word' ? 
                'sentence' : autocompleteScope === 'sentence' ? 
                'paragraph' : 'word';
            suggestions = await generateSuggestions();
            filteredSuggestions = [...suggestions];
            event.preventDefault();
        }

        // Handle Enter to select suggestion
        if (event.key === 'Enter') {
            event.preventDefault();
            const pos = editor.state.selection.$from.pos;
                const currentNode = editor.state.doc.nodeAt(pos);
            if (isAutocompleteActive && filteredSuggestions.length > 0) {

                const textToInsert = filteredSuggestions[0] + ' ';
                editor.commands.deleteRange({ 
                    from: pos - filterText.length,
                    to: pos 
                });
                autocompleteStartingText = null;
                editor.commands.insertContent(textToInsert);
                suggestions = await generateSuggestions();
                filteredSuggestions = [...suggestions];

            } else {

                
                
                // Create new block with default attributes
                editor.chain()
                    .insertContentAt(pos, {
                        type: 'block',
                        attrs: {
                            id: uuidv4(),
                            tabCount: currentNode?.attrs?.tabCount || 0
                        },
                        content: [{
                            type: 'paragraph',
                            content: []
                        }]
                    })
                    .focus()
                    .run();

            }
            
            

            
        }

        // Handle Tab to regenerate
        if (event.key === 'Tab') {
            if (!isAutocompleteActive) return;
            event.preventDefault();
            console.log('tab key');
            suggestions = await generateSuggestions();
            filteredSuggestions = [...suggestions];
            
        }
    }

</script>

{#if loaded}
<div class="document">
    <div 
        id="editor" 
        class="content" 
        bind:this={editorElement} 
        on:keydown={onKeyDown}
    >
        <!-- TipTap editor will mount here -->
    </div>

    {#if isAutocompleteActive}
        <div class="suggestions {autocompleteScope}"
             style="top: {cursorPositionY}px; left: {cursorPositionX}px;">
            {#each filteredSuggestions as suggestion}
                <div class="suggestion">{suggestion.startsWith(filterText) ? suggestion.replace(filterText,'') : suggestion}</div>
            {/each}
        </div>
    {/if}
    {#if showDetails}
        <DocumentDetails {document} />
    {/if}
</div>
{/if}

<style>
    .document {
        display: flex;
        height: 100%;
        width: calc(100% - 16px);
        margin-right: 16px;
    }

    .content {
        flex: 1;
        overflow-y: auto;
        background-color: #1e1e1e;
        color: white;
        border-radius: 16px;
        margin: 20px 0px;
        padding: 0px 20px;

    }

    :global(.ProseMirror) {
        outline: none;
        min-height: 100px;
        color: white;
    }

    :global(.block) {
        position: relative;
        padding: 0px 0;
        margin: 0px 0;
    }

    :global(.block p) {
        margin: 0;
    }

    :global(.block[data-active="true"]) {
        background-color: rgba(255, 255, 255, 0.1);
    }

    .suggestion {
        padding: 0px 4px;

        color: #444;
        font-size: 16px;
        pointer-events: none;
    }

    .suggestions {
        margin-top: 20px;
        position: absolute;
        border-radius: 4px;
        display: flex;
        flex-direction: column;
        padding: 5px;
        background-color: #111;
    }
    
    .suggestions.word { 
        font-weight: normal;
        font-style: normal;
     }
    .suggestions.sentence { 
        font-style: italic;
    }
    .suggestions.paragraph { 
        font-weight: bold;
     }

    
    .suggestion:hover {
        background: rgba(255, 255, 255, 0.1);
    }
</style>