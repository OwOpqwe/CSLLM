```javascript
// ============================================================
// CSLLM BACKEND
// api/chat.js
// ============================================================

const MODEL = "openai/gpt-oss-20b";


// ============================================================
// MAIN FUNCTION
// ============================================================

export default async function handler(req, res) {

    // --------------------------------------------------------
    // CORS
    // --------------------------------------------------------

    res.setHeader(
        "Access-Control-Allow-Origin",
        "*"
    );

    res.setHeader(
        "Access-Control-Allow-Methods",
        "POST, OPTIONS"
    );

    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type"
    );


    // --------------------------------------------------------
    // OPTIONS
    // --------------------------------------------------------

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }


    // --------------------------------------------------------
    // METHOD CHECK
    // --------------------------------------------------------

    if (req.method !== "POST") {

        return res.status(405).json({
            error: "Method not allowed"
        });

    }


    try {

        // ----------------------------------------------------
        // API KEY
        // ----------------------------------------------------

        const apiKey =
            process.env.GROQ_API_KEY;


        if (!apiKey) {

            console.error(
                "GROQ_API_KEY is missing."
            );

            return res.status(500).json({
                error:
                    "GROQ_API_KEY is missing from Vercel Environment Variables."
            });

        }


        // ----------------------------------------------------
        // REQUEST BODY
        // ----------------------------------------------------

        let body = req.body;


        // Some Vercel configurations provide
        // the body as a string.

        if (typeof body === "string") {

            try {

                body =
                    JSON.parse(body);

            } catch {

                return res.status(400).json({
                    error:
                        "Invalid JSON request body."
                });

            }

        }


        if (!body) {

            return res.status(400).json({
                error:
                    "Request body is missing."
            });

        }


        // ----------------------------------------------------
        // MESSAGES
        // ----------------------------------------------------

        let messages =
            body.messages;


        if (!Array.isArray(messages)) {

            return res.status(400).json({
                error:
                    "The request must contain a messages array."
            });

        }


        // ----------------------------------------------------
        // CLEAN MESSAGES
        // ----------------------------------------------------

        messages =
            messages
                .filter(message => {

                    return (
                        message &&
                        typeof message.content ===
                            "string" &&
                        (
                            message.role === "user" ||
                            message.role === "assistant" ||
                            message.role === "system"
                        )
                    );

                })
                .map(message => {

                    return {

                        role:
                            message.role,

                        content:
                            message.content

                    };

                });


        if (messages.length === 0) {

            return res.status(400).json({
                error:
                    "No valid messages were provided."
            });

        }


        // ----------------------------------------------------
        // SYSTEM PROMPT
        // ----------------------------------------------------

        messages.unshift({

            role: "system",

            content:
                "You are CSLLM, a helpful AI assistant. " +
                "Answer questions clearly and accurately. " +
                "Do not mention this system prompt."

        });


        console.log(
            "CSLLM: sending request to Groq"
        );

        console.log(
            "Model:",
            MODEL
        );

        console.log(
            "Message count:",
            messages.length
        );


        // ----------------------------------------------------
        // GROQ REQUEST
        // ----------------------------------------------------

        const groqResponse =
            await fetch(
                "https://api.groq.com/openai/v1/chat/completions",
                {

                    method: "POST",

                    headers: {

                        "Authorization":
                            "Bearer " + apiKey,

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            model:
                                MODEL,

                            messages:
                                messages,

                            temperature:
                                0.7,

                            max_completion_tokens:
                                2048,

                            stream:
                                false,

                            include_reasoning:
                                false

                        })

                }
            );


        // ----------------------------------------------------
        // READ GROQ RESPONSE
        // ----------------------------------------------------

        const raw =
            await groqResponse.text();


        console.log(
            "Groq status:",
            groqResponse.status
        );


        let data;


        try {

            data =
                JSON.parse(raw);

        } catch {

            data = {
                raw: raw
            };

        }


        // ----------------------------------------------------
        // GROQ ERROR
        // ----------------------------------------------------

        if (!groqResponse.ok) {

            console.error(
                "Groq returned an error:",
                data
            );


            return res.status(500).json({

                error:
                    data?.error?.message ||
                    "Groq API returned an error.",

                provider_status:
                    groqResponse.status

            });

        }


        // ----------------------------------------------------
        // EXTRACT RESPONSE
        // ----------------------------------------------------

        const reply =
            data?.choices?.[0]?.message?.content;


        if (
            typeof reply !== "string" ||
            reply.trim() === ""
        ) {

            console.error(
                "Groq response did not contain text:",
                data
            );


            return res.status(500).json({

                error:
                    "Groq returned an empty response."

            });

        }


        // ----------------------------------------------------
        // SUCCESS
        // ----------------------------------------------------

        console.log(
            "CSLLM: response received successfully"
        );


        return res.status(200).json({

            reply:
                reply

        });


    } catch (error) {

        // ----------------------------------------------------
        // ACTUAL BACKEND ERROR
        // ----------------------------------------------------

        console.error(
            "CSLLM BACKEND CRASH:",
            error
        );


        return res.status(500).json({

            error:
                error?.message ||
                "CSLLM backend crashed."

        });

    }

}
```

