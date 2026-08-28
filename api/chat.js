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
    // PREFLIGHT REQUEST
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

        // ========================================
        // CHECK API KEY
        // ========================================

        const apiKey =
            process.env.GROQ_API_KEY;

        if (!apiKey) {

            console.error(
                "GROQ_API_KEY is missing."
            );

            return res.status(500).json({
                error:
                    "GROQ_API_KEY is not configured in Vercel."
            });

        }


        // ========================================
        // GET USER MESSAGE
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
        // LIMIT MESSAGE SIZE
        // ========================================

        if (message.length > 12000) {

            return res.status(400).json({
                error:
                    "Message is too long."
            });

        }


        // ========================================
        // ABORT CONTROLLER
        // ========================================

        const controller =
            new AbortController();


        const timeout =
            setTimeout(() => {

                controller.abort();

            }, 25000);


        let groqResponse;


        try {

            // ========================================
            // GROQ REQUEST
            // ========================================

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

                                // CURRENT MODEL
                                model:
                                    "openai/gpt-oss-20b",

                                messages: [

                                    {
                                        role:
                                            "system",

                                        content:
                                            "You are CSLLM, a helpful, friendly AI assistant. Answer questions clearly and accurately. Keep answers reasonably concise unless the user asks for detail."
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
                                    1024

                            })

                    }
                );

        } finally {

            clearTimeout(timeout);

        }


        // ========================================
        // READ RESPONSE
        // ========================================

        const responseText =
            await groqResponse.text();


        console.log(
            "Groq HTTP status:",
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

                // Not JSON

            }


            const groqError =
                errorData?.error;


            return res.status(
                groqResponse.status
            ).json({

                error:
                    groqError?.message ||
                    "Groq API returned an error.",

                type:
                    groqError?.type ||
                    null,

                code:
                    groqError?.code ||
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
        // GET AI RESPONSE
        // ========================================

        const reply =
            data?.choices?.[0]?.message?.content;


        if (
            !reply ||
            typeof reply !== "string"
        ) {

            console.error(
                "Unexpected Groq response:",
                data
            );

            return res.status(500).json({

                error:
                    "The AI returned an empty response."

            });

        }


        // ========================================
        // SEND RESPONSE TO WEBSITE
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
                    "The AI service took too long to respond. Please try again."

            });

        }


        // ========================================
        // GENERAL ERROR
        // ========================================

        return res.status(500).json({

            error:
                error.message ||
                "Internal server error."

        });

    }

}
