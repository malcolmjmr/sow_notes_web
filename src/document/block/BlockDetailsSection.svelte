<script>
  import { onMount } from 'svelte';
    import Chat from './Chat.svelte';
    import Clipboard from './Clipboard.svelte';
    import Objectives from './Objectives.svelte';

    export let document;
    export let block;
    export let view = null;
    export let showTitle = false;

    onMount(() => {
        console.log('loading block details');
        console.log('view', view);
    }); 

</script>

{#if block}
<div class="block-details-section">
    {#if showTitle}
        <h2>{view}</h2>
    {/if}
    <div class="view">
        {#if view === 'chat'}
            <Chat {document} bind:block />
        {:else if view === 'clipboard'}
            <Clipboard {document} bind:block />
        {:else if view === 'objectives'}
            <Objectives {document} bind:block />
        {/if}
    </div>
</div>
{/if}

<style>
    .block-details-section {
        display: flex;
        flex-direction: column;
        height: calc(100%);
        width: calc(100%);
        padding: 0px;
    }

    h2 {
        font-size: 1.2em;
        margin-bottom: 8px;
    }

    .view {
        display: flex;
        height: 100%;
    }
</style>