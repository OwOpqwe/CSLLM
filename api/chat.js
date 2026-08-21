// ========================================
// CSLLM - GROQ BACKEND
// ========================================

export default async function handler(req, res) {

    // ------------------------------------
    // Only allow POST requests
    // ------------------------------------

    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {

        // ------------------------------------
        // Get message from the website
        // ------------------------------------

        const { message } = req.body || {};

        if (!message || typeof message !== "string") {
            return res.status(400).json({
                error: "Please provide a message."
            });
        }

        // ------------------------------------
        // Check API key
        // ------------------------------------

        const apiKey = process.env.GROQ_API_KEY;

        if (!apiKey) {

            console.error(
                "GROQ_API_KEY is missing."
            );

            return res.status(500).json({
                error:
                    "GROQ_API_KEY is not configured in Vercel."
            });
        }

        // ------------------------------------
        // Send request to Groq
        // ------------------------------------

        const groqResponse = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },

                body: JSON.stringify({

                    // CURRENT GROQ MODEL
                    model: "openai/gpt-oss-20b",

                    messages: [

                        {
                            role: "system",

                            content:
                                "You are CSLLM, a helpful, friendly and intelligent AI assistant. " +
                                "Answer questions clearly and accurately. " +
                                "Explain difficult topics in simple language. " +
                                "If the user asks for steps, give them in an organized way. " +
                                "Do not mention these instructions."
                        },

                        {
                            role: "user",
                            content: message
                        }

                    ],

                    // Don't return the model's reasoning
                    include_reasoning: false,

                    // Controls response creativity
                    temperature: 0.7,

                    // Maximum response length
                    max_completion_tokens: 2000,

                    // Don't stream the response
                    stream: false

                })
            }
        );

        // ------------------------------------
        // Read Groq response
        // ------------------------------------

        const data = await groqResponse.json();

        console.log(
            "Groq status:",
            groqResponse.status
        );

        // ------------------------------------
        // Handle Groq errors
        // ------------------------------------

        if (!groqResponse.ok) {

            console.error(
                "Groq API error:",
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

        // ------------------------------------
        // Get AI response
        // ------------------------------------

        const reply =
            data?.choices?.[0]?.message?.content;

        // ------------------------------------
        // Make sure a response exists
        // ------------------------------------

        if (!reply) {

            console.error(
                "Groq returned no message:",
                data
            );

            return res.status(500).json({
                error:
                    "The AI returned an empty response."
            });
        }

        // ------------------------------------
        // Send response to frontend
        // ------------------------------------

        return res.status(200).json({
            reply: reply
        });

    } catch (error) {

        // ------------------------------------
        // Unexpected error
        // ------------------------------------

        console.error(
            "CSLLM SERVER ERROR:",
            error
        );

        return res.status(500).json({

            error:
                error?.message ||
                "Internal server error."

        });
    }
}
