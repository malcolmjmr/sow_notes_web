<script>

    import { createEventDispatcher } from 'svelte';

    import createNoteIcon from '../icons/create-box-filled.svg';
    import createFolderIcon from '../icons/create-folder-filled.svg';

    export let workspace;
    export let folderCount;
    export let noteCount;


    let dispatch = createEventDispatcher();

    function createNote() {
        dispatch('createNote');
    }

    function createFolder() {
        dispatch('createWorkspace');
    }
</script>

<div class="footer">
    <div class="left">
        <img class="button" src={createFolderIcon} on:mousedown={createFolder} alt="Create Folder"/>
    </div>
    <div class="center">
        <span>{#if folderCount > 0} {folderCount} Folders : {/if} {noteCount} Note{noteCount > 1 ? 's' : ''}</span>
    </div>
    <div class="right">
        <img class="button" src={createNoteIcon} on:mousedown={createNote} alt="" />
    </div>
</div>

<style>
    .footer {
        display: flex;
        justify-content: space-between;
        padding: 8px 16px 10px 10px;
        background-color: black;
        color: #555;
        border-top: 1px solid #333;
    }

    .footer .left,
    .footer .center,
    .footer .right {
        display: flex;
        align-items: center;
    }

    .footer .center {
        flex-grow: 1;
        justify-content: center;
        font-size: 14px;
    }

    .footer .button:hover {
        cursor: pointer;
    }
</style>

