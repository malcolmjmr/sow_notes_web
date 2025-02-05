<script>

    import { createEventDispatcher, onMount } from 'svelte';
    import { activeDocumentId, documents } from '../store';
    export let document;

    let dispatch = createEventDispatcher();

    let isSelected = false;

    onMount(() => {
       isSelected = document.id === $activeDocumentId;
    });

    function onClick(event) {
        dispatch('click', { document });
    }

    function updateDocument(event) {
        document.updated = Date.now();
        $documents[document.id] = document;
    }

</script>
<div class="document-list-item{isSelected ? ' selected' : ''}" on:mousedown={onClick}>
    {#if isSelected}
        <input type="text" class="title" bind:value={document.title} on:blur={updateDocument}/>
    {:else}
    <div class="title">{document.title}</div>
    {/if}
    {#if document.updated}
        <p class="update-time">{new Date(document.updated).toLocaleString()}</p>
    {/if}
</div>
<style>

    .document-list-item {
        padding: 5px 10px;
        
        color: #999;
        cursor: pointer;
        margin: 0px 0px 5px 0px;
    }

    .document-list-item .title {
        margin: 0;
        padding: 0px;
        background-color: transparent;
        border: none;
        outline: none;
        color: #999;
        font-size: 16px;
        width: 100%;
    }

    .document-list-item .update-time {
        margin: 0px;
        font-size: 12px;
        color: #777;
    }

    .document-list-item.selected{
        border-bottom: 1px solid #333333;
        color: white;
    }

    .document-list-item.selected .title {
        color: white;
    }
</style>