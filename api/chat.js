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

        // --------------------------------
        // Get message from website
        // --------------------------------

        const { message } = req.body;


        if (
            !message ||
            typeof message !== "string"
        ) {

            return res.status(400).json({
                error: "No message provided"
            });

        }


        // --------------------------------
        // Check Groq API key
        // --------------------------------

        if (!process.env.GROQ_API_KEY) {

            console.error(
                "GROQ_API_KEY is missing."
            );

            return res.status(500).json({
                error:
                    "GROQ_API_KEY is not configured in Vercel."
            });

        }


        // --------------------------------
        // Send request to Groq
        // --------------------------------

        const response = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json",

                    "Authorization":
                        `Bearer ${process.env.GROQ_API_KEY}`

                },

                body: JSON.stringify({

                    // Groq model
                    model:
                        "llama-3.1-8b-instant",

                    // AI instructions
                    messages: [

                        {
                            role: "system",

                            content:
                                `You are CSLLM,
a helpful and friendly AI assistant.

Your job is to answer questions clearly,
accurately, and naturally.

Keep answers easy to understand.

If the user asks for an explanation,
explain it step by step.

You are running as the AI behind
the CSLLM website.`
                        },

                        {
                            role: "user",

                            content: message
                        }

                    ],

                    // Controls creativity
                    temperature: 0.7,

                    // Maximum response length
                    max_tokens: 1000

                })

            }
        );


        // --------------------------------
        // Read Groq response
        // --------------------------------

        const data =
            await response.json();


        console.log(
            "Groq status:",
            response.status
        );


        console.log(
            "Groq response:",
            data
        );


        // --------------------------------
        // Handle Groq errors
        // --------------------------------

        if (!response.ok) {

            return res.status(
                response.status
            ).json({

                error:
                    data.error?.message ||
                    "Groq API request failed.",

                type:
                    data.error?.type ||
                    null,

                code:
                    data.error?.code ||
                    null

            });

        }


        // --------------------------------
        // Get AI response
        // --------------------------------

        const reply =
            data.choices?.[0]?.message?.content;


        if (!reply) {

            return res.status(500).json({

                error:
                    "Groq returned an empty response."

            });

        }


        // --------------------------------
        // Send AI response to website
        // --------------------------------

        return res.status(200).json({

            reply: reply

        });


    } catch (error) {

        // --------------------------------
        // Unexpected server error
        // --------------------------------

        console.error(
            "SERVER ERROR:",
            error
        );


        return res.status(500).json({

            error:
                error.message ||
                "Something went wrong on the server."

        });

    }
}
