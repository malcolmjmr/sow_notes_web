import { persisted } from 'svelte-local-storage-store';


// Initial document structure
const initialDocuments = {
  'doc1': {
    id: 'doc1',
    title: 'My First Document',
    blocks: [
      {
        id: 'block1',
        type: 'paragraph',
        content: 'This is the first paragraph.',
        metadata: { objectives: [], clipboard: [], ai_suggestions: [] }
      }
    ]
  }
};

export const documents = persisted('documents', initialDocuments);
export const workspaces = persisted('workspaces', {});
export const activeWorkspaceId = persisted('activeWorkspaceId', null);
export const activeDocumentId = persisted('activeDocumentId','doc1'); // Start with the first document selected
export const activeBlockId = persisted('activeBlockId', 'block1'); // Start with the first block selected
export const selectedText = persisted('selectedText','');