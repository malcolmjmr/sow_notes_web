<script>
    import { onMount } from 'svelte';
    import { documents, workspaces } from '../store.js';
    import DocumentListItem from './DocumentListItem.svelte';
    import WorkspaceFooter from './WorkspaceFooter.svelte';

    export let workspace = null;

    onMount(() => {
        load();
    });

    let recentDocuments = [];

    async function load() {
        recentDocuments = Object.values($documents)
            .filter(doc => workspace == null || doc.workspaceId === workspace.id);    
        recentDocuments.sort((a, b) => b.updated - a.updated);
    }

    function openDocument(event) {
        const document = event.detail.document;
        activeDocumentId.set(document.id);
    }

    function createWorkspace(event) {
        /*
            Create the workspace and then change active workspace
        */
       let newWorkspace = {
            id: Math.random().toString(36).substring(2, 15),
            name: 'New Workspace',
            created: Date.now(),
            updated: Date.now(),
            parentId: workspace ? workspace.id : null,
        };

        // add the workspace to the store
        workspaces.update((workspaces) => {
            workspaces[newWorkspace.id] = newWorkspace;
            return workspaces;
        });

        // set the active workspace
        activeWorkspaceId.set(newWorkspace.id);
    }
    function createNote(event) {
        console.log('create note');
    }

    function navigateToParentWorkspace(event) {
        if (workspace && workspace.parentId) {
            activeWorkspaceId.set(workspace.parentId);
        } else {
            // navigate to root workspace
            activeWorkspaceId.set(null);
        }
    }

</script>

<div class="workspace">
    {#if workspace}
        <div class="header">
            <button on:click={navigateToParentWorkspace}>Back</button>
            <h1>{workspace.name}</h1>
        </div>
    {/if}
    <div class="recent-documents">
        {#each recentDocuments as document}
            <DocumentListItem {document} on:click={openDocument} />
        {/each}
    </div>
    <WorkspaceFooter 
        {workspace} 
        folderCount={0} 
        noteCount={recentDocuments.length}
        on:createWorkspace={createWorkspace}
        on:createNote={createNote}
    />

</div>

<style>
    .workspace {
        display: flex;
        flex-direction: column;
        width: 20%;
        min-width: 100px;
        max-width: 400px;
        height: 100vh;
        background-color: black;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }

    .header {
        display: flex;
        flex-direction: row;
        align-items: center;

        background-color: #ffffff;
        border-bottom: 1px solid #333333;
    }

    .header button {
        background: none;
        border: none;
        color: #007aff;
        font-size: 1rem;
        cursor: pointer;
        margin-right: 1rem;
    }

    .header h1 {
        font-size: 1.5rem;
        font-weight: 600;
        margin: 0;
    }

    .recent-documents {
        flex: 1;
        overflow-y: auto;
        padding: 1rem;
        display: flex;
        flex-direction: column;
    }

    .recent-documents::-webkit-scrollbar {
        width: 0.5rem;
    }

    .recent-documents::-webkit-scrollbar-thumb {
        background-color: rgba(0, 0, 0, 0.2);
        border-radius: 0.25rem;
    }

    .recent-documents::-webkit-scrollbar-track {
        background-color: #f5f5f5;
    }
</style>