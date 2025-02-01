<script>
    import { onMount } from "svelte";
    import BlockDetailsSection from "./BlockDetailsSection.svelte";

    
    export let document;
    export let activeBlockId;

    let view = 'chat';
    let pinnedViews = [];

    onMount(() => {
        load(); 
    });

    let block;
    let loaded;

    function load() {
        block = document.blocks.find(block => block.id === activeBlockId);
        loaded = true;
    }

    /*
        List of views
        
    */

</script>

{#if loaded}
<div class="block-details">
    {#each  pinnedViews as pinnedView}
        <BlockDetailsSection showTitle={true} view={pinnedView} {document} bind:block />
    {/each}
    <div class="view-options">
        <div class="view-option" on:onmousedown={() => view = 'chat'}>Chat</div>
        <div class="view-option" on:onmousedown={() => view = 'clipboard'}>Clipboard</div>
        <div class="view-option" on:onmousedown={() => view = 'objectives'}>Objectives</div>
    </div>
    <div class="views">
       <BlockDetailsSection {view} {document} bind:block />
    </div>
</div>
{/if}
