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
    // PREFLIGHT
    // ========================================

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }


    // ========================================
    // POST ONLY
    // ========================================

    if (req.method !== "POST") {

        return res.status(405).json({
            error: "Method not allowed"
        });

    }


    try {

        // ========================================
        // CHECK API KEY
        // ========================================

        if (!process.env.GROQ_API_KEY) {

            return res.status(500).json({
                error:
                    "GROQ_API_KEY is missing from Vercel."
            });

        }


        // ========================================
        // GET MESSAGE
        // ========================================

        const message =
            req.body?.message;


        if (
            !message ||
            typeof message !== "string"
        ) {

            return res.status(400).json({
                error:
                    "Message is required."
            });

        }


        // ========================================
        // ABORT AFTER 25 SECONDS
        // ========================================

        const controller =
            new AbortController();


        const timeout =
            setTimeout(
                () => controller.abort(),
                25000
            );


        // ========================================
        // CALL GROQ
        // ========================================

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
                                `Bearer ${process.env.GROQ_API_KEY}`

                        },

                        signal:
                            controller.signal,

                        body:
                            JSON.stringify({

                                model:
                                    "llama-3.3-70b-versatile",

                                messages: [

                                    {
                                        role:
                                            "system",

                                        content:
                                            "You are CSLLM, a helpful and friendly AI assistant. Give clear, useful answers."
                                    },

                                    {
                                        role:
                                            "user",

                                        content:
                                            message
                                    }

                                ],

                                temperature:
                                    0.7,

                                max_tokens:
                                    512

                            })

                    }
                );

        } finally {

            clearTimeout(timeout);

        }


        // ========================================
        // READ GROQ RESPONSE
        // ========================================

        const responseText =
            await groqResponse.text();


        console.log(
            "Groq status:",
            groqResponse.status
        );


        console.log(
            "Groq response:",
            responseText
        );


        // ========================================
        // GROQ ERROR
        // ========================================

        if (!groqResponse.ok) {

            let errorData = null;


            try {

                errorData =
                    JSON.parse(
                        responseText
                    );

            } catch {

                // Response wasn't JSON

            }


            return res.status(
                groqResponse.status
            ).json({

                error:
                    errorData?.error?.message ||
                    "Groq API returned an error.",

                type:
                    errorData?.error?.type ||
                    null,

                code:
                    errorData?.error?.code ||
                    null

            });

        }


        // ========================================
        // PARSE SUCCESS
        // ========================================

        let data;


        try {

            data =
                JSON.parse(
                    responseText
                );

        } catch {

            return res.status(500).json({

                error:
                    "Groq returned invalid JSON."

            });

        }


        // ========================================
        // GET AI MESSAGE
        // ========================================

        const reply =
            data?.choices?.[0]?.message?.content;


        if (!reply) {

            return res.status(500).json({

                error:
                    "The AI returned an empty response."

            });

        }


        // ========================================
        // SUCCESS
        // ========================================

        return res.status(200).json({

            reply: reply

        });


    } catch (error) {

        console.error(
            "Backend error:",
            error
        );


        // ========================================
        // TIMEOUT
        // ========================================

        if (
            error.name ===
            "AbortError"
        ) {

            return res.status(504).json({

                error:
                    "Groq took too long to respond. Please try again."

            });

        }


        // ========================================
        // OTHER ERROR
        // ========================================

        return res.status(500).json({

            error:
                error.message ||
                "Internal server error."

        });

    }

}
