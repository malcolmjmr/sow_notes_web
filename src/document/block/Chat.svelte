<script>
    import { onMount } from 'svelte';
    import { LLMService } from '../../services/llm.js';
    import sendIcon from '../../icons/arrow-up.svg';

    export let document;
    export let block;

    let input = '';

    onMount(() => {
        load();
    });

    async function load() {
        // const textarea = window.document.getElementById('messageTextarea');

        // textarea.addEventListener('input', function() {
        //     this.style.height = 'auto'; // Reset height to auto
        //     this.style.height = (this.scrollHeight) + 'px'; // Set height to scrollHeight
        // });
    }

    $: {
        if (block?.chat?.messages) getMessageGroups();
    }

    let messageGroups = [];

    function getMessageGroups() {
        console.log('getMessageGroups');
        let groups = [];
        let currentGroup = {};
        for (let i = 0; i < block.chat.messages.length; i++) {
            let message = block.chat.messages[i];
            console.log({ message });
            if (currentGroup[message.role] ) {
                console.log('pushing group');
                groups.push(currentGroup);
                currentGroup = {};
            } 
            currentGroup[message.role] = message;
        }
        if (currentGroup) groups.push(currentGroup);
        messageGroups = groups;
        console.log({ messageGroups });
    }

    async function sendMessage() {
        if (input.trim() === '') return;
        let chat = block.chat ?? { messages: [] };

        
        let llm = new LLMService();
        let response = await llm.chat({ 
            message: input, 
            history: chat.messages ?? [],
            systemMessage: createSystemMessage(),
        });

        chat.messages = [...chat.messages, { content: input, role: 'user' }];
        block.chat = chat;
        input = '';

        let { suggestions, replyMessage } = parseResponseFromLLM(response);
        console.log({ suggestions, replyMessage });
        proccessSuggestions(suggestions);
        block.chat.messages = [...block.chat.messages, { content: replyMessage, role: 'assistant' }];


    }

    

    function proccessSuggestions(suggestions) {
        if (!suggestions) return;

        if (!block.objectives || block.objectives.length === 0) {
            block.objectives = suggestions.objectives ?? [];
        } 
        
        if (!block.clipboard || block.clipboard.length === 0) {
            block.clipboard = suggestions.snippets ?? [];
        }

        if (suggestions.text) {
            block.suggestedText = suggestions.text;
        }   
        
        block = { ...block };
    }

    function parseResponseFromLLM(response) {
        console.log('response');
        console.log(response);
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
            
            Example ouptut: 
            Your reply message to the user goes here.
            <suggestions>
                {
                    "objectives": [
                        "Persuade the reader to take action",
                        "Highlight the benefits of the product"
                    ],
                    "snippets": [
                        "This product has been proven to increase productivity by 30%",
                    ],
                    "text": "Generated text for this section"
                }
            </suggestions>


            Here is the text that the user has written so far:
            ${block.content}

            Here is the full document:
            ${getDocumentText()}
            
            ${block.objectives && block.objectives.length > 0
                ? `Here are the objectives that the user has set for this text: \n ${block.objectives.map((objective) => '- ' + objective).join('\n')}`
                : ''}

        `;

        return prompt;
    }
</script>

<div class="chat-container">
    {#if (block.chat?.messages.length ?? 0) === 0}
        <div class="assistant-message">
            Hi! I'm here to help you write. What would you like to write about?
        </div>
    {/if}
    <div class="messages">
        {#each messageGroups as { user, assistant }}
            <div class="message-group">
                <div class="message user">{user.content}</div>
                {#if assistant}
                    <div class="message ai">{assistant.content}</div>
                {/if}
            </div>
        {/each}

    
        
        <div class="input-container">
            <textarea class="input-field" id="messageTextarea" placeholder="Message" bind:value={input} on:keydown={(e) => e.key === 'Enter' && sendMessage()} />
            <div class="button circle">
                <img src={sendIcon} alt="Send" on:mousedown={sendMessage} />
            </div>
        </div>
    </div>
</div>

<style>
    .chat-container {
        display: flex;
        flex-direction: column;
        height: 100%;

        width: 100%;
    }
    .messages {
        flex: 1;
        overflow-y: auto;
        margin-bottom: 10px;
        
    }
    .message-group {
        
        margin: 10px;
        border-radius: 15px;
        color: white;
        font-weight: 400;
        font-size: 14px;
        line-height: 1.5;
        letter-spacing: 0.5;
    }

    .user {
        background-color: #222;
        padding: 8px;
        margin-bottom: 5px;
        border-radius: 15px 15px 0px 15px;
        font-size: 14px;

    }
    .ai {
        text-align: left;
        padding: 0px 8px;
        background-color: black;


    }
    .input-container {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: row;
        height: calc(100% - 200px);
        padding: 0px 0px 10px 0px;

    }
    .input-field {
        flex: 1;
        padding: 8px 10px;
        background-color: #222;
        border-radius: 20px;
        height: calc(100%);
        border: none;
        margin: 10px;
        color: white;
        outline: none;
        line-height: 1.5;
        text-decoration: none;
        resize: none; /* Prevents manual resizing by the user */
        overflow: hidden; /* Prevents scrollbars from appearing unnecessarily */
        font-family: sans-serif; /* Match font to your site */
        box-sizing: border-box; 
    }
    .button:hover {
        cursor: pointer;
    }

    .button.circle {
        position: absolute;
        bottom: 10px; 
        right: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        margin: 0px 5px 0px 0px;
        border-radius: 50%;
        background-color: #007aff;
    }

    .button.circle img {
        width: 100%;
        height: 100%;
    }

    .assistant-message {
        
        padding: 10px;
        color: white;
        
        
        margin: 10px;
        border-radius: 20px;
    }
</style>

