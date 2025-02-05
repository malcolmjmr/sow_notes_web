<script>
    export let block;
</script>

<div class="objectives">
    <div class="objectives-list">
        {#each (block.objectives ?? []) as objective}
            <div class="objective">{objective}</div>
        {/each}
    </div>
</div>

<style>
    .objectives {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
        padding: 0px;
    }

    h2 {
        font-size: 1.2em;
        margin-bottom: 8px;
    }

    .objectives-list {
        display: flex;
        flex-direction: column;
        flex: 1;
        overflow-y: auto;
    }

    .objective {
        padding: 10px;
        color: #999;
        margin: 8px;
        border-radius: 15px;
    }

    .objective:hover {
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