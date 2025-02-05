<script>
    import { createEventDispatcher } from 'svelte';
    export let block;

    let dispatch = createEventDispatcher();

    function onSnippetClicked(snippet) {
        dispatch('snippetClicked', { snippet });
        navigator.clipboard.writeText(snippet);
    }
</script>

<div class="clipboard">
    <div class="snippets">
    {#each (block.clipboard?.reverse() ?? []) as snippet}
        <div class="snippet" on:mousedown={() => onSnippetClicked(snippet)}>{snippet}</div>
    {/each}
    </div>

</div>

<style>
    .clipboard {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
        padding: 0px;
    }

    .snippets {
        flex: 1;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
    }

    .snippet {
        padding: 10px;
        color: #999;
        margin: 8px;
        border-radius: 15px;
    }

    .snippet:hover {
        background-color: #111;
        color: white;
        cursor: pointer;
    }

    .create {
        padding: 10px;
        border-top: 1px solid #333;
        color: white;
        cursor: pointer;
        height: 75px;
    }
</style>

