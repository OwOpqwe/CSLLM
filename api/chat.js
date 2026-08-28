export default async function handler(req, res) {

    // ================================
    // CORS
    // ================================

    res.setHeader(
        "Access-Control-Allow-Origin",
        "https://owopqwe.github.io"
    );

    res.setHeader(
        "Access-Control-Allow-Methods",
        "POST, OPTIONS"
    );

    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type"
    );

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {

        // ================================
        // API KEY
        // ================================

        const apiKey = process.env.GROQ_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                error: "GROQ_API_KEY is not configured in Vercel."
            });
        }

        // ================================
        // REQUEST DATA
        // ================================

        const body = req.body || {};

        const message = body.message;

        const conversationHistory =
            Array.isArray(body.history)
                ? body.history
                : [];

        if (
            !message ||
            typeof message !== "string"
        ) {
            return res.status(400).json({
                error: "Message is required."
            });
        }

        // ================================
        // LIMIT MESSAGE SIZE
        // ================================

        if (message.length > 12000) {
            return res.status(400).json({
                error: "Message is too long."
            });
        }

        // ================================
        // CLEAN HISTORY
        // ================================

        const cleanedHistory =
            conversationHistory
                .filter(item =>
                    item &&
                    (
                        item.role === "user" ||
                        item.role === "assistant"
                    ) &&
                    typeof item.content === "string"
                )
                .slice(-20);

        // ================================
        // SYSTEM PROMPT
        // ================================

        const systemPrompt = `
You are CSLLM, a custom AI assistant.

You are friendly, intelligent, helpful, and conversational.

You help users with:
- Schoolwork
- Coding
- Mathematics
- Science
- Geography
- Writing
- Research
- Creative projects
- General questions

IMPORTANT RULES:

1. Answer the user's actual question directly.
2. Do not randomly suggest projects unless the user asks for ideas.
3. Do not claim to be ChatGPT.
4. If the user asks what AI you are, say you are CSLLM.
5. Explain difficult concepts clearly.
6. For schoolwork, explain things at an appropriate level.
7. Use Markdown when useful.
8. Avoid unnecessary giant tables.
9. Keep normal answers reasonably concise.
10. Give detailed explanations when the user asks for them.
11. Maintain context from the conversation.
12. Do not repeat information unnecessarily.
13. Be natural and conversational.

You are CSLLM.
`;

        // ================================
        // CREATE MESSAGES
        // ================================

        const messages = [
            {
                role: "system",
                content: systemPrompt
            },

            ...cleanedHistory,

            {
                role: "user",
                content: message
            }
        ];

        // ================================
        // CALL GROQ
        // ================================

        const controller =
            new AbortController();

        const timeout =
            setTimeout(() => {
                controller.abort();
            }, 30000);

        let groqResponse;

        try {

            groqResponse =
                await fetch(
                    "https://api.groq.com/openai/v1/chat/completions",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${apiKey}`
                        },

                        signal:
                            controller.signal,

                        body:
                            JSON.stringify({

                                model:
                                    "openai/gpt-oss-20b",

                                messages:
                                    messages,

                                temperature:
                                    0.7,

                                max_tokens:
                                    1024
                            })
                    }
                );

        } finally {

            clearTimeout(timeout);

        }

        // ================================
        // READ RESPONSE
        // ================================

        const responseText =
            await groqResponse.text();

        console.log(
            "Groq status:",
            groqResponse.status
        );

        // ================================
        // GROQ ERROR
        // ================================

        if (!groqResponse.ok) {

            let errorData;

            try {
                errorData =
                    JSON.parse(responseText);
            } catch {
                errorData = null;
            }

            const groqError =
                errorData?.error;

            console.error(
                "Groq error:",
                responseText
            );

            return res.status(
                groqResponse.status
            ).json({

                error:
                    groqError?.message ||
                    "The AI service returned an error.",

                type:
                    groqError?.type ||
                    null,

                code:
                    groqError?.code ||
                    null
            });
        }

        // ================================
        // PARSE RESPONSE
        // ================================

        let data;

        try {

            data =
                JSON.parse(responseText);

        } catch {

            return res.status(500).json({
                error:
                    "The AI returned invalid data."
            });

        }

        // ================================
        // GET AI MESSAGE
        // ================================

        const reply =
            data?.choices?.[0]?.message?.content;

        if (
            !reply ||
            typeof reply !== "string"
        ) {

            return res.status(500).json({
                error:
                    "The AI returned an empty response."
            });

        }

        // ================================
        // SEND TO FRONTEND
        // ================================

        return res.status(200).json({
            reply: reply
        });

    } catch (error) {

        console.error(
            "Backend error:",
            error
        );

        if (
            error.name === "AbortError"
        ) {

            return res.status(504).json({
                error:
                    "The AI took too long to respond."
            });

        }

        return res.status(500).json({
            error:
                error.message ||
                "Internal server error."
        });
    }
}
