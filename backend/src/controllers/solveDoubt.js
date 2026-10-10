const { GoogleGenAI } = require('@google/genai');

const MAX_MESSAGES = 12;
const MAX_MESSAGE_CHARS = 4000;
const MAX_CONTEXT_CHARS = 8000;

const clip = (value, max) => String(value ?? '').slice(0, max);

const sanitizeMessages = (messages) => {
    if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
        return null;
    }

    const cleaned = [];
    for (const message of messages) {
        const role = message?.role === 'model' ? 'model' : message?.role === 'user' ? 'user' : null;
        const text = message?.parts?.[0]?.text;
        if (!role || typeof text !== 'string' || !text.trim() || text.length > MAX_MESSAGE_CHARS) {
            return null;
        }
        cleaned.push({ role, parts: [{ text: text.trim() }] });
    }
    return cleaned;
};

const solveDoubt = async (req, res) => {
    try {
        if (!process.env.GEMINI_KEY) {
            return res.status(503).json({ message: 'AI assistance is not configured' });
        }

        const messages = sanitizeMessages(req.body?.messages);
        if (!messages) {
            return res.status(400).json({ message: 'Send between 1 and 12 chat messages' });
        }

        const { title, description, testCases, startCode } = req.body;
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY });

        const response = await ai.models.generateContent({
            model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
            contents: messages,
            config: {
                systemInstruction: `
You are an expert Data Structures and Algorithms (DSA) tutor. Help only with the current problem.

## CURRENT PROBLEM CONTEXT:
[PROBLEM_TITLE]: ${clip(title, 200)}
[PROBLEM_DESCRIPTION]: ${clip(description, MAX_CONTEXT_CHARS)}
[EXAMPLES]: ${clip(typeof testCases === 'string' ? testCases : JSON.stringify(testCases || ''), MAX_CONTEXT_CHARS)}
[startCode]: ${clip(typeof startCode === 'string' ? startCode : JSON.stringify(startCode || ''), MAX_CONTEXT_CHARS)}

Give hints before full solutions. Explain complexity. Refuse anything that is not about this problem.
Respond in the language the student is using.
`,
            },
        });

        res.status(200).json({
            message: response.text || 'I could not produce a hint. Try rephrasing the question.',
        });
    } catch (err) {
        console.error('AI chat error:', err.message);
        res.status(502).json({ message: 'AI assistance is temporarily unavailable' });
    }
};

module.exports = solveDoubt;
