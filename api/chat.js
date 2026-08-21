// ========================================
// CSLLM - GROQ BACKEND
// Supports Vercel + GitHub Pages
// ========================================

export default async function handler(req, res) {

    // ------------------------------------
    // CORS
    // ------------------------------------

    const allowedOrigins = [
        "https://csllm.vercel.app",
        "https://owopqwe.github.io"
    ];

    const origin = req.headers.origin;

    if (allowedOrigins.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
    }

    res.setHeader(
        "Access-Control-Allow-Methods",
        "POST, OPTIONS"
    );

    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type"
    );


    // ------------------------------------
    // Handle browser CORS check
    // ------------------------------------

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }


    // ------------------------------------
    // Only allow POST
    // ------------------------------------

    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }


    try {

        // --------------------------------
        // Get message
        // --------------------------------

        const { message } = req.body || {};

        if (
            !message ||
            typeof message !== "string"
        ) {
            return res.status(400).json({
                error: "Please provide a message."
            });
        }


        // --------------------------------
        // Get Groq API key
        // --------------------------------

        const apiKey =
            process.env.GROQ_API_KEY;


        if (!apiKey) {

            console.error(
                "GROQ_API_KEY is missing."
            );

            return res.status(500).json({
                error:
                    "GROQ_API_KEY is not configured."
            });
        }


        // --------------------------------
        // Send request to Groq
        // --------------------------------

        const groqResponse = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",

                    "Authorization":
                        `Bearer ${apiKey}`
                },

                body: JSON.stringify({

                    model:
                        "openai/gpt-oss-20b",

                    messages: [

                        {
                            role: "system",

                            content:
                                `You are CSLLM,
a helpful, friendly and intelligent
AI assistant.

Answer questions clearly and accurately.

Explain difficult topics in simple language.

If the user asks for steps,
give them in an organized way.

Be friendly and helpful.`
                        },

                        {
                            role: "user",
                            content: message
                        }

                    ],

                    temperature: 0.7,

                    max_completion_tokens: 2000,

                    stream: false,

                    include_reasoning: false
                })
            }
        );


        // --------------------------------
        // Read Groq response
        // --------------------------------

        const data =
            await groqResponse.json();


        // --------------------------------
        // Handle Groq error
        // --------------------------------

        if (!groqResponse.ok) {

            console.error(
                "Groq error:",
                data
            );

            return res.status(
                groqResponse.status
            ).json({

                error:
                    data?.error?.message ||
                    "Groq API request failed.",

                type:
                    data?.error?.type ||
                    "unknown",

                code:
                    data?.error?.code ||
                    "unknown"
            });
        }


        // --------------------------------
        // Get AI response
        // --------------------------------

        const reply =
            data?.choices?.[0]?.message?.content;


        if (!reply) {

            return res.status(500).json({
                error:
                    "The AI returned an empty response."
            });
        }


        // --------------------------------
        // Send response to website
        // --------------------------------

        return res.status(200).json({
            reply: reply
        });


    } catch (error) {

        console.error(
            "CSLLM server error:",
            error
        );

        return res.status(500).json({
            error:
                error?.message ||
                "Internal server error."
        });
    }
}
