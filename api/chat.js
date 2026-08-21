export default async function handler(req, res) {

    // ========================================
    // CORS
    // ========================================

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


    // ========================================
    // HANDLE PREFLIGHT
    // ========================================

    if (req.method === "OPTIONS") {

        return res.status(200).end();

    }


    // ========================================
    // ONLY ALLOW POST
    // ========================================

    if (req.method !== "POST") {

        return res.status(405).json({
            error: "Method not allowed"
        });

    }


    try {

        const {
            message
        } = req.body;


        if (!message) {

            return res.status(400).json({
                error: "Message is required"
            });

        }


        // ========================================
        // GROQ API
        // ========================================

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

                    model:
                        "llama-3.1-8b-instant",

                    messages: [

                        {
                            role: "system",

                            content:
                                "You are CSLLM, a helpful AI assistant. Give clear, useful and friendly answers."
                        },

                        {
                            role: "user",

                            content: message
                        }

                    ],

                    temperature: 0.7,

                    max_tokens: 1024

                })

            }
        );


        // ========================================
        // GROQ ERROR
        // ========================================

        if (!response.ok) {

            const errorText =
                await response.text();

            console.error(
                "Groq error:",
                errorText
            );


            return res.status(
                response.status
            ).json({

                error:
                    "The AI service returned an error."

            });

        }


        // ========================================
        // READ RESPONSE
        // ========================================

        const data =
            await response.json();


        const reply =
            data?.choices?.[0]?.message?.content;


        if (!reply) {

            return res.status(500).json({

                error:
                    "The AI returned no response."

            });

        }


        // ========================================
        // SEND TO FRONTEND
        // ========================================

        return res.status(200).json({

            reply: reply

        });


    } catch (error) {

        console.error(
            "Server error:",
            error
        );


        return res.status(500).json({

            error:
                "Internal server error."

        });

    }

}
