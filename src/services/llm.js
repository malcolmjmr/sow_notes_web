import { config } from "./config";

export class LLMService {
    constructor() {

    }

    async chat(prompt) {
        console.log('chat');
        console.log('history');
        console.log(history);

        return await this.geminiChatCompletion(prompt);
         
    }

    async geminiChatCompletion({ message, history, systemMessage, model, temperature }) {

        let body = {
            contents: [
                ...history.map((m) => { 
                    return {
                        role: m.role == 'user' ? 'user' : 'model',
                        parts: [{
                            text: m.content
                        }]
                    }
                }),
                {
                    role: 'user',
                    parts: [{
                        text: message
                    }]
                }
            ],
        };

        if (systemMessage) {

            body.systemInstruction = {
                role: 'user',
                parts: [{
                    text: systemMessage
                }]
            };

        }

        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-exp-1206:generateContent?key=${config.apiKeys.gemini}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
            
    
        if (!response.ok) {
            console.log('response');
            console.log(await response.json());
            return;
            throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    }

    async openaiChatCompletion(prompt) {
        prompt.model = 'gpt-4o';
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKeys.openai}`,
            },
            body: JSON.stringify(prompt),
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    async anthropicChatCompletion(prompt) {
        prompt.model = 'claude-3-5-sonnet-20240229-v1';

        const response = await fetch('https://api.anthropic.com/v1/complete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKeys.anthropic}`,
            },
            body: JSON.stringify(prompt),
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.completion;
    }

   
}

export default LLMService;