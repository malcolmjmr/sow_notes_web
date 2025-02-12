<script>
    import { createEventDispatcher, onMount } from 'svelte';
    import { activeBlockId } from '../../store';
    import { v4 as uuidv4 } from 'uuid';

    export let isActive = false;
    export let block;
    export let tabCount = 0;

    onMount(() => {
        console.log('loading block', block);
    });

    let dispatch = createEventDispatcher();

    function handleBlockUpdate(updatedBlock) {
        dispatch('blockUpdate', { block: updatedBlock });
    }
 


    function removeBlock() {
        dispatch('blockRemove', { blockId: block.id });
    }

    function updateTabCount(increment) {
        const newTabCount = increment ? 
            block.tabCount + 1 : 
            Math.max(block.tabCount - 1, 0);
            
        const updatedBlock = {
            ...block,
            tabCount: newTabCount
        };
        handleBlockUpdate(updatedBlock);
    }

    function onKeyDown(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            dispatch('blockCreate');
            
        } else if (event.key === 'Tab') {
            event.preventDefault();
            updateTabCount(!event.shiftKey);
            
            if (block.suggestedText) {
                const updatedBlock = {
                    ...block,
                    content: block.suggestedText,
                    suggestedText: null
                };
                handleBlockUpdate(updatedBlock);
            }
        } else if (event.key === 'Backspace' && 
            (block.content === '' || block.content === '<br>')) {
            event.preventDefault();
            removeBlock();
        } else if (event.key === 'ArrowUp') {
            dispatch('moveCursor', { direction: 'up', blockId: block.id });
        } else if (event.key === 'ArrowDown') {
            dispatch('moveCursor', { direction: 'down', blockId: block.id });
        }
    }

    function onClicked() {
        if ($activeBlockId !== block.id) {
            dispatch('setActive', { blockId: block.id });
        }
    }

    function onBlur() {
        handleBlockUpdate(block);
    }
</script>

<div class="block" style="margin-left: {block.tabCount * 20}px">
    <div 
        contenteditable="true" 
        autofocus={isActive}
        bind:innerHTML={block.content}
        on:mousedown={onClicked}
        on:keydown={onKeyDown}
        on:blur={onBlur}
    >
    </div>
    {#if block.suggestedText}
        <span class="suggested-text">{block.suggestedText}</span>
    {/if}
</div>

<style>
    .block {
        position: relative;
        padding: 2.5px 0px;
        color: white;
    }
    .block div {
        outline: none;
        white-space: pre-wrap;
        word-wrap: break-word;
        background-color: transparent;
        position: relative;
        z-index: 1;
    }
    .block div[contenteditable="true"] {
        caret-color: white;
    }
    .suggested-text {
        position: absolute;
        color: #777;
        z-index: 0;
        top: 2px;
    }
</style>