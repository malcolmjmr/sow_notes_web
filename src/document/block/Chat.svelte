<script>
    import { onMount } from 'svelte';

    export let document;
    export let block;

    let input = '';

    async function sendMessage() {
        if (input.trim() === '') return;
        if (!block.chat) {
            block.chat = { messages: [] };
        }
        block.chat.messages = [...block.chat.messages, { content: input, role: 'user' }];
        input = '';
        // Simulate AI response
        let llm = LLMService();
        let response = await llm.chat({ 
            message: input, 
            history: block.chat.messages,
            systemMessage: createSystemMessage(),
        });
        let { suggestions, replyMessage } = parseResponseFromLLM(response);
        if (suggestions) {
            block.objectives = [...block.objectives, ...(suggestions.objectives ?? [])];
            block.clipboard = [...block.clipboard, ...(suggestions.snippets ?? [])];
        }
        block.chat.messages = [...block.chat.messages, { content: replyMessage, role: 'assistant' }];

    }

    function parseResponseFromLLM(response) {
        let suggestions = [];
        let replyMessage = '';

        if (response.includes('<suggestions>')) {
            const startIndex = response.indexOf('<suggestions>'); 
            const endIndex = response.indexOf('</suggestions>');
            if (startIndex > 0) {
                replyMessage = response.substring(0, startIndex);
            }

            let suggestionSection = response.substring(startIndex + '<suggestions>'.length, endIndex);
            
            if (endIndex + '</suggestions>'.length < response.length) {
                replyMessage += response.substring(endIndex + '</suggestions>'.length);
            }

            suggestions = JSON.parse(suggestionSection);

        } else {
            replyMessage = response;
        }
        return { suggestions, replyMessage };
    }

    function getDocumentText() {
        return document.blocks.map(block => block.content).join('\n\n');
    }

    function createSystemMessage() {
        let prompt = `
            You are embedded in a document editing application. Your role is to assist the user in thinking through and writing specific section of text.
            Each text has clipboard with saved snippets of text that can be incorporated into the text, as well as a list of objectives that the text should achieve.
            You can suggest additional snippets and objectives to the user. You suggestions should be wrapped in <suggestion></suggestion> tags. 
            
            Example suggestion ouptut: 
            <suggestions>
                {
                    "objectives": [
                        "Persuade the reader to take action",
                        "Highlight the benefits of the product"
                    ],
                    "snippets": [
                        "This product has been proven to increase productivity by 30%",
                    ]
                }
            </suggestions>


            Here is the text that the user has written so far:
            ${block.content}

            Here is the full document:
            ${getDocumentText()}

            Here are the objectives that the user has for this text:
            ${block.objectives.map(objective => `- ${objective}`).join('\n')}

        `;

        return prompt;
    }
</script>

<div class="chat-container">
    <div class="messages">
        {#each (block.chat?.messages ?? []) as { text, role }}
            <div class="message {role}">
                {text}
            </div>
        {/each}
    </div>
    <div class="input-container">
        <input type="text" bind:value={input} on:keydown={(e) => e.key === 'Enter' && sendMessage()} />
        <button on:click={sendMessage}>Send</button>
    </div>
</div>

<style>
    .chat-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        border: 1px solid #ccc;
        padding: 10px;
    }
    .messages {
        flex: 1;
        overflow-y: auto;
        margin-bottom: 10px;
    }
    .message {
        padding: 5px;
        margin: 5px 0;
    }
    .user {
        text-align: right;
        background-color: #e1ffc7;
    }
    .ai {
        text-align: left;
        background-color: #f1f1f1;
    }
    .input-container {
        display: flex;
    }
    input {
        flex: 1;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 4px;
    }
    button {
        padding: 10px;
        border: none;
        background-color: #007bff;
        color: white;
        cursor: pointer;
        border-radius: 4px;
        margin-left: 5px;
    }
</style>

