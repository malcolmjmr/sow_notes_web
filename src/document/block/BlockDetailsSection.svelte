<script>
    import Chat from './Chat.svelte';
    import Clipboard from './Clipboard.svelte';
    import Objectives from './Objectives.svelte';

    export let document;
    export let block;
    export let view = null;
    export let showTitle = false;

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