<script>
    import { createEventDispatcher, onMount } from 'svelte';
    import { activeBlockId } from '../../store';

    export let isActive = false;

    export let block;

    let dispatch = createEventDispatcher();

    onMount(() => {
        console.log('loading block');
        console.log(block);    
    });


    function onKeyDown(event) {
        /*
            need to handle enter, tab, etc.
        */

        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            // check if there is text to the right of the cursor
            dispatch('createBlock', { block });
        } else if (event.key === 'Tab' && !event.shiftKey) {
            event.preventDefault();
            dispatch('tabBlock', { block,  });
            if (block.suggestedText) {
                block.content = block.suggestedText;
                block.suggestedText = null;
                block = { ...block };
                dispatch('updated', { block });
            }

        } else if (event.key === 'Tab' && event.shiftKey) {
            event.preventDefault();
            dispatch('tabBlock', { block, shiftKey: event.shiftKey });
        } else if (event.key === 'Backspace' && (block.content === '' || block.content === '<br>')) {
            event.preventDefault();
            console.log('backspace');
            dispatch('removeBlock', { block });
        } else if (event.key === 'ArrowUp') {

            dispatch('arrowUp', { block });
        } else if (event.key === 'ArrowDown') {
            dispatch('arrowDown', { block });
        } 
        
    }

    function onClicked(event) {
        if ($activeBlockId === block.id) {
            return;
        }
        dispatch('click', { block });
    }
    function onBlur(event) {
        dispatch('updated', { block });
    }


</script>

<div class="block">
  
    <div contenteditable="true" autofocus={isActive ? "true" : "false"}
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