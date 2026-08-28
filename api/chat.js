"use strict";

// ============================================================
// CSLLM BACKEND
// ============================================================
//
// File location:
//
//     /api/chat.js
//
// IMPORTANT:
// Put your Groq API key in Vercel Environment Variables:
//
//     GROQ_API_KEY
//
// DO NOT put the API key in script.js.
// ============================================================

const GROQ_API_URL =
    "https://api.groq.com/openai/v1/chat/completions";

// Use the Vercel environment variable GROQ_MODEL.
// If you don't create it, this is the default.
//
// IMPORTANT:
// You previously received "model_not_found" for
// llama-3.3-70b-versatile.
// If that happens again, change GROQ_MODEL in Vercel.
const MODEL =
    process.env.GROQ_MODEL ||
    "llama-3.3-70b-versatile";


// ============================================================
// CORS
// ============================================================

function setCorsHeaders(res) {

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
}


// ============================================================
// MAIN API FUNCTION
// ============================================================

module.exports = async function handler(req, res) {

    // --------------------------------------------------------
    // CORS
    // --------------------------------------------------------

    setCorsHeaders(res);


    // --------------------------------------------------------
    // OPTIONS / PREFLIGHT
    // --------------------------------------------------------

    if (req.method === "OPTIONS") {

        return res.status(204).end();

    }


    // --------------------------------------------------------
    // ONLY POST
    // --------------------------------------------------------

    if (req.method !== "POST") {

        return res.status(405).json({
            error: "Method not allowed."
        });

    }


    // --------------------------------------------------------
    // API KEY CHECK
    // --------------------------------------------------------

    const apiKey =
        process.env.GROQ_API_KEY;


    if (!apiKey) {

        console.error(
            "GROQ_API_KEY is missing."
        );

        return res.status(500).json({
            error:
                "The AI backend is not configured. GROQ_API_KEY is missing from Vercel."
        });

    }


    // --------------------------------------------------------
    // READ REQUEST
    // --------------------------------------------------------

    try {

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
                    "Invalid request. 'messages' must be an array."
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
                        typeof message === "object" &&
                        typeof message.role === "string" &&
                        typeof message.content === "string"
                )
                .map(
                    message => {

                        let role =
                            message.role;


                        // Only allow roles supported by
                        // the chat completion API.

                        if (
                            role !== "user" &&
                            role !== "assistant" &&
                            role !== "system"
                        ) {

                            role =
                                "user";

                        }


                        return {

                            role:
                                role,

                            content:
                                message.content.trim()

                        };

                    }
                )
                .filter(
                    message =>
                        message.content.length > 0
                );


        // ----------------------------------------------------
        // LIMIT HISTORY
        // ----------------------------------------------------
        //
        // Prevent enormous requests if someone has a huge chat.
        //
        // Keep the most recent 40 messages.
        //

        if (
            messages.length > 40
        ) {

            messages =
                messages.slice(
                    -40
                );

        }


        if (
            messages.length === 0
        ) {

            return res.status(400).json({
                error:
                    "No messages were provided."
            });

        }


        // ----------------------------------------------------
        // SYSTEM PROMPT
        // ----------------------------------------------------

        const systemMessage = {

            role:
                "system",

            content:
                "You are CSLLM, a helpful AI assistant. " +
                "Answer clearly and naturally. " +
                "Remember the conversation provided in the messages. " +
                "If the user tells you their name, remember it " +
                "and use it when appropriate."

        };


        const finalMessages = [

            systemMessage,

            ...messages

        ];


        // ----------------------------------------------------
        // SEND TO GROQ
        // ----------------------------------------------------

        console.log(
            "Sending request to Groq."
        );

        console.log(
            "Model:",
            MODEL
        );

        console.log(
            "Message count:",
            finalMessages.length
        );


        const groqResponse =
            await fetch(
                GROQ_API_URL,
                {

                    method:
                        "POST",

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
                                finalMessages,

                            temperature:
                                0.7,

                            max_tokens:
                                2048

                        })

                }
            );


        // ----------------------------------------------------
        // READ GROQ RESPONSE
        // ----------------------------------------------------

        const responseText =
            await groqResponse.text();


        let data;


        try {

            data =
                JSON.parse(
                    responseText
                );

        } catch {

            data = null;

        }


        // ----------------------------------------------------
        // GROQ ERROR
        // ----------------------------------------------------

        if (
            !groqResponse.ok
        ) {

            console.error(
                "Groq API error:",
                groqResponse.status,
                responseText
            );


            let errorMessage =
                "The AI provider returned an error.";


            if (
                data &&
                data.error
            ) {

                if (
                    typeof data.error ===
                    "string"
                ) {

                    errorMessage =
                        data.error;

                } else if (
                    data.error.message
                ) {

                    errorMessage =
                        data.error.message;

                }

            }


            return res.status(
                groqResponse.status
            ).json({

                error:
                    errorMessage,

                provider_status:
                    groqResponse.status

            });

        }


        // ----------------------------------------------------
        // EXTRACT AI RESPONSE
        // ----------------------------------------------------

        if (
            !data ||
            !data.choices ||
            !data.choices[0] ||
            !data.choices[0].message
        ) {

            console.error(
                "Unexpected Groq response:",
                data
            );


            return res.status(500).json({
                error:
                    "The AI returned an unexpected response."
            });

        }


        const reply =
            data
                .choices[0]
                .message
                .content;


        if (
            typeof reply !== "string" ||
            !reply.trim()
        ) {

            return res.status(500).json({
                error:
                    "The AI returned an empty response."
            });

        }


        // ----------------------------------------------------
        // SUCCESS
        // ----------------------------------------------------

        return res.status(200).json({

            reply:
                reply.trim()

        });


    } catch (error) {

        // ----------------------------------------------------
        // SERVER ERROR
        // ----------------------------------------------------

        console.error(
            "CSLLM backend error:",
            error
        );


        return res.status(500).json({

            error:
                "The AI backend encountered an unexpected error."

        });

    }

};
