<script>
	import Workspace from './workspace/Workspace.svelte';
	import Document from './document/Document.svelte';
    import { onMount } from 'svelte';
    import { activeBlockId, activeDocumentId, documents } from './store';

	// need to listen to the selected workspace
	onMount(() => {
		load();
	});

	let docIdUpdated;
	function load() {
		console.log($documents);
		console.log($activeDocumentId);
		if (!$activeDocumentId) {
			activeDocumentId.set(Object.values($documents)[0].id);
		}

		activeDocumentId.subscribe((value) => {
			docIdUpdated = value;
			$activeBlockId = Object.values($documents[value].blocks)[0].id;
		});
	}

  </script>
  
  <main>
	{#key docIdUpdated}
		<Workspace/>
		<Document/>
	{/key}
  </main>
  
  <style>
	:global(html, body) {
	  height: 100%;
	  margin: 0px;
	  background-color: black;
	  padding: 0px;
	  font-family: 'Roboto', sans-serif;
	  font-weight: 400;
	  line-height: 1.2;
	  letter-spacing: .5;
	}

	main {
	  display: flex;
	  height: 100vh;
	}
  
  </style>