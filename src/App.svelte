<script>
	import Workspace from './workspace/Workspace.svelte';
	import Document from './document/Document.svelte';
    import { onMount } from 'svelte';
    import { activeDocumentId, documents } from './store';

	// need to listen to the selected workspace
	onMount(() => {
		load();
	});

	function load() {
		console.log($documents);
		console.log($activeDocumentId);
		if (!$activeDocumentId) {
			activeDocumentId.set(Object.values($documents)[0].id);
		}
	}

  </script>
  
  <main>
	  <Workspace/>
	  <Document/>
  </main>
  
  <style>
	:global(html, body) {
	  height: 100%;
	  margin: 0;
	  background-color: black;
	}
	main {
	  display: flex;
	  height: 100vh;
	}
  
  </style>