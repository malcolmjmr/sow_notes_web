import { config } from "./config";

class LLMService {
    constructor() {

    }

    async chat({ message, history, systemMessage, model, temperature }) {
        const prompt = {
            model,
            messages: [
                ...(systemMessage ? [{ role: 'system', content: systemMessage }] : []),
                ...history.map(([role, content]) => ({ role, content })),
                { role: 'user', content: message },
            ],
            temperature,
        };

        return await this.geminiChatCompletion(prompt);
         
    }

    async geminiChatCompletion(prompt) {
        
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateMessage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKeys.gemini}`,
            },
            body: JSON.stringify(prompt),
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.candidates[0].content;
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