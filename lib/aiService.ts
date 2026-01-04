import { supabase } from './supabase';

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

const SYSTEM_PROMPT = `
Você é o "EliteBot", um assistente virtual especializado em armamento, tiro esportivo, legislação brasileira de armas (Estatuto do Desarmamento, Decretos do SIGMA/Sinarm) e regras do Clube de Tiro "Elite Shield".
Sua persona é um instrutor tático experiente, porém amigável e preciso. Você usa termos técnicos corretos (calibres, ações, peças).
Você deve ajudar os membros com dúvidas sobre:
- Processos de CAC (Concessão, Renovação, Apostilamento).
- Regras de transporte e guarda de acervo.
- Diferenças entre plataformas (Glock, Imbel, Taurus, Fuzis, etc).
- Regras de segurança em estandes de tiro (regras de ouro de Jeff Cooper).
- Estatuto e regras internas do clube.

Responda de forma concisa, direta e sempre priorize a segurança. Se não souber algo jurídico específico, recomende consultar um advogado ou despachante.
`;

export const sendMessageToAI = async (messages: ChatMessage[]) => {
    try {
        // 1. Fetch Configuration
        const { data: settings } = await supabase.from('system_settings').select('ai_provider, ai_api_key').single();

        if (!settings?.ai_api_key) {
            return {
                role: 'assistant',
                content: 'Erro: Chave de API não configurada no sistema. Por favor, contate o administrador.'
            };
        }

        const provider = settings.ai_provider || 'openai';
        const apiKey = settings.ai_api_key;

        // 2. Prepare Messages (prepend system prompt)
        const conversation = [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages
        ];

        // 3. Call API
        if (provider === 'openai') {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o', // or gpt-3.5-turbo
                    messages: conversation,
                    temperature: 0.7,
                    max_tokens: 500
                })
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error.message);

            return {
                role: 'assistant',
                content: data.choices[0].message.content
            };

        } else if (provider === 'gemini') {
            // Gemini API structure (Google Generative AI)
            // Note: Gemini API format is slightly different.
            // Assuming using the REST API for simplicity without extra SDKs

            // Convert messages to Gemini format
            const geminiContents = messages.map(m => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.content }]
            }));

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: geminiContents,
                    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] }
                })
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error.message);

            return {
                role: 'assistant',
                content: data.candidates[0].content.parts[0].text
            };
        }

    } catch (error: any) {
        console.error('AI Service Error:', error);
        return {
            role: 'assistant',
            content: `Ocorreu um erro ao processar sua pergunta: ${error.message}`
        };
    }
};
