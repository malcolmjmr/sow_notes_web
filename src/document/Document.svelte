<script>
    import { onMount } from 'svelte';
    import Block from './block/Block.svelte';
    import BlockDetails from './block/BlockDetails.svelte';
    import { activeDocumentId, documents, activeBlockId } from '../store';

    let document;

    let activeBlock;
    let loaded;
   
    onMount(() => {
        load();
    });

    async function load() {
        const activeDocId = $activeDocumentId;
        console.log('activeDocId', activeDocId);    
        document = $documents[activeDocId];
        console.log('document', document);
        loaded = true;
    }

    function onBlockClicked(event) {
        activeBlockId.set(event.detail.block.id);
        activeBlock = event.detail.block;
    }

    function onBlockUpdated(event) {
        const blockIndex = document.blocks.findIndex((b) => b.id === event.detail.block.id);
        document.blocks[blockIndex] = event.detail.block;
        $documents[document.id] = document;
    }

    function onCreateBlock(event) {
        const index = document.blocks.findIndex((b) => b.id === event.detail.block.id);
        
        document.blocks.splice(index + 1, 0, {
            id: Math.random().toString(36).substring(2, 15),
            content: '',
            lastAccessed: Date.now(),
        });

        document = { ...document };
        $documents[document.id] = document;

        activeBlockId.set(document.blocks[index + 1].id);


    }
    function onRemoveBlock(event) {
        const index = document.blocks.findIndex((b) => b.id === event.detail.block.id);
        document.blocks.splice(index, 1);
        document.blocks[index - 1].lastAccessed = Date.now();
        document = { ...document };
        $documents[document.id] = document;
        activeBlockId.set(document.blocks[index - 1].id);
    }

    function onTabBlock(event) {
        let block = event.detail.block;
        if (!block.tabs) block.tabs = 0;
        if (event.detail.shiftKey) {
            block.tabs = Math.max(0, block.tabs - 1);
        } else {
            block.tabs++;
        }

        const index = document.blocks.findIndex((b) => b.id === block.id);
        document.blocks[index] = block;
        document = { ...document };
        $documents[document.id] = document;
    }

    function onArrowDown(event) {
        const index = document.blocks.findIndex((b) => b.id === event.detail.block.id);
        if (index < document.blocks.length - 1) {
            
            activeBlockId.set(document.blocks[index + 1].id);
        }
    }

    function onArrowUp(event) {
        const index = document.blocks.findIndex((b) => b.id === event.detail.block.id);
        if (index > 0) {
            activeBlockId.set(document.blocks[index - 1].id);
        }
    }

</script>
{#if loaded}
<div class="document">
    <div class="content">

        <div class="blocks">
            {#each (document?.blocks ?? []) as block (block.id + block.lastAccessed)}
                <Block {block} isActive={block.id === $activeBlockId}
                    on:click={onBlockClicked}
                    on:updated={onBlockUpdated}
                    on:createBlock={onCreateBlock}
                    on:removeBlock={onRemoveBlock}
                    on:tabBlock={onTabBlock}
                    on:arrowDown={onArrowDown}
                    on:arrowUp={onArrowUp}
                    
                />
            {/each}
        </div>

    </div>
    {#if $activeBlockId}
        <BlockDetails activeBlockId={$activeBlockId} bind:document/>
    {/if}
</div>
{/if}

<style>
    .document {
        display: flex;
        height: calc(100% - 40px);
        width: 100%;
        margin: 20px 0 20px 0px;
    }

    .content {
        display: flex;
        flex-direction: column;
        flex: 1;
        padding: 1rem;
        overflow-y: auto;
        background-color: #333333;
        border-radius: 20px;
    }

    .header {
        margin-bottom: 1rem;
    }

    .header input {
        width: 100%;
        padding: 0.5rem;
        font-size: 1.5rem;
        border: none;
        border-bottom: 1px solid #ccc;
    }

    .blocks {
        display: flex;
        flex-direction: column;
    }
    
</style>