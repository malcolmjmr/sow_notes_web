<script>
    import { onMount } from "svelte";
    import BlockDetailsSection from "./BlockDetailsSection.svelte";
    import { documents } from "../../store";

    
    export let document;
    export let activeBlockId;
    export let lastViewUpdate;

    export let view = 'chat';
    let pinnedViews = [];

    onMount(() => {
        load(); 
    });

    let block;
    let loaded;

    function load() {
        console.log('loading block details');
        console.log('activeBlockId', activeBlockId);

        block = document.blocks.find(block => block.id === activeBlockId);
        loaded = true;
    }

    /*
        List of views
        
    */
    function addPinnedView(view) {
        pinnedViews = [...pinnedViews, view];
    }
    function setView(value) {
        console.log('setView', value);
        view = value;
    }

    function onChatSelected(e) {
        setView('chat');
    }

    $: {
        if (loaded && block) {
            document.blocks[document.blocks.findIndex(b => b.id === block.id)] = block;
            document = {...document};
            $documents[document.id] = document;
        }

    }

</script>

{#if block && loaded}
<div class="block-details">
    {#each  pinnedViews as pinnedView}
        <BlockDetailsSection showTitle={true} view={pinnedView} {document} bind:block />
    {/each}
    {#if block.clipboard || block.objectives}
    <div class="view-options">
        <div class="container">
            <div class="view-option{view == 'chat' ? ' selected': ''}" on:mousedown={(e) => setView('chat')}>Chat</div>
            <div class="view-option{view == 'clipboard' ? ' selected': ''}" on:mousedown={(e) => setView('clipboard')}>Clipboard</div>
            <div class="view-option{view == 'objectives' ? ' selected': ''}" on:mousedown={(e) => setView('objectives')}>Objectives</div>
        </div>
    </div>
    {/if}
    <div class="views">
        {#key lastViewUpdate}
       <BlockDetailsSection {view} {document} bind:block />
       {/key}
    </div>
</div>
{/if}

<style>
    .block-details {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: calc(20% - 8px);
        min-width: 300px;
        padding: 0px 0px 0px 0px;
    }

    .view-options {
        display: flex;
        width: 100%;
        border-bottom: 1px solid #333;
    }

    .view-options .container {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        width: calc(100% - 8px);
        height: 100%;
        padding: 8px 0px 0px 8px;


    }

    .view-option {
        padding: 8px;
        cursor: pointer;
        
    }

    .view-option:hover {
        
        color: white;
    }

    .view-option.selected {
        color: white;
        border-radius: 15px;
        
    }

    .views {
        flex-grow: 1;
        overflow: auto;

    }

</style>
