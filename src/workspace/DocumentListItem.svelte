<script>

    import { createEventDispatcher, onMount } from 'svelte';
    import { activeDocumentId } from '../store';
    export let document;

    let dispatch = createEventDispatcher();

    let isSelected = false;

    onMount(() => {
       isSelected = document.id === $activeDocumentId;
    });

    function onClick(event) {
        dispatch('click', { document });
    }

</script>
<div class="document-list-item" style="{isSelected ? 'color: white;' : ''}" on:mousedown={onClick}>
    <div class="title">{document.title}</div>
    {#if document.updated}
        <p>{new Date(document.updated).toLocaleString()}</p>
    {/if}
</div>
<style>
    .document-list-item {
        padding: 10px 0;
        border-bottom: 1px solid #333;
        color: #999;
        cursor: pointer;
    }

    .document-list-item .title {
        margin: 0;
        font-size: 16px;
    }

    .document-list-item p {
        margin: 0.5rem 0 0;
        
    }
</style>