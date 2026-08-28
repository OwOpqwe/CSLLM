```javascript
// ============================================================
// CSLLM BACKEND
// api/chat.js
// ============================================================

const MODEL = "openai/gpt-oss-20b";

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
    // PREFLIGHT
    // --------------------------------------------------------

    if (req.method === "OPTIONS") {

        return res.status(200).end();

    }


    // --------------------------------------------------------
    // ONLY POST
    // --------------------------------------------------------

    if (req.method !== "POST") {

        return res.status(405).json({
            error: "Method not allowed"
        });

    }


    try {

        // ----------------------------------------------------
        // CHECK API KEY
        // ----------------------------------------------------

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


        // ----------------------------------------------------
        // GET REQUEST BODY
        // ----------------------------------------------------

        const body =
            req.body || {};

        let messages =
            body.messages;


        // ----------------------------------------------------
        // VALIDATE MESSAGES
        // ----------------------------------------------------

        if (!Array.isArray(messages)) {

            return res.status(400).json({
                error:
                    "Request must contain a messages array."
            });

        }


        // ----------------------------------------------------
        // CLEAN MESSAGES
        // ----------------------------------------------------

        messages =
            messages
                .filter(
                    message =>
                        message &&
                        typeof message.content ===
                            "string" &&
                        (
                            message.role ===
                                "user" ||
                            message.role ===
                                "assistant" ||
                            message.role ===
                                "system"
                        )
                )
                .map(
                    message => ({
                        role:
                            message.role,

                        content:
                            message.content
                    })
                );


        if (messages.length === 0) {

            return res.status(400).json({
                error:
                    "No valid messages were provided."
            });

        }


        // ----------------------------------------------------
        // OPTIONAL SYSTEM MESSAGE
        // ----------------------------------------------------

        const systemMessage = {
            role: "system",

            content:
                "You are CSLLM, a helpful AI assistant. " +
                "Answer clearly, accurately, and naturally."
        };


        messages = [
            systemMessage,
            ...messages
        ];


        // ----------------------------------------------------
        // CALL GROQ
        // ----------------------------------------------------

        console.log(
            "Calling Groq with model:",
            MODEL
        );


        const groqResponse =
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

                    body:
                        JSON.stringify({

                            model:
                                MODEL,

                            messages:
                                messages,

                            temperature:
                                0.7,

                            max_completion_tokens:
                                2048

                        })
                }
            );


        // ----------------------------------------------------
        // READ GROQ RESPONSE
        // ----------------------------------------------------

        const raw =
            await groqResponse.text();


        let data;

        try {

            data =
                JSON.parse(raw);

        } catch {

            data = {
                error: raw
            };

        }


        // ----------------------------------------------------
        // GROQ ERROR
        // ----------------------------------------------------

        if (!groqResponse.ok) {

            console.error(
                "Groq API error:",
                groqResponse.status,
                data
            );


            return res.status(
                groqResponse.status
            ).json({

                error:
                    data?.error?.message ||
                    data?.error ||
                    "Groq API request failed.",

                provider_status:
                    groqResponse.status

            });

        }


        // ----------------------------------------------------
        // EXTRACT AI RESPONSE
        // ----------------------------------------------------

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
                    "Groq returned an empty response."
            });

        }


        // ----------------------------------------------------
        // RETURN RESPONSE TO FRONTEND
        // ----------------------------------------------------

        return res.status(200).json({

            reply:
                reply

        });


    } catch (error) {

        // ----------------------------------------------------
        // UNEXPECTED SERVER ERROR
        // ----------------------------------------------------

        console.error(
            "CSLLM backend error:",
            error
        );


        return res.status(500).json({

            error:
                error?.message ||
                "Internal server error."

        });

    }

}
```
