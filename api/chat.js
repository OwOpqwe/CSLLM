const MODEL = "openai/gpt-oss-20b";

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {
        const apiKey = process.env.GROQ_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                error: "GROQ_API_KEY is missing from Vercel."
            });
        }

        let body = req.body || {};

        if (typeof body === "string") {
            try {
                body = JSON.parse(body);
            } catch {
                return res.status(400).json({
                    error: "Invalid JSON request body."
                });
            }
        }

        let messages = body.messages;

        if (!Array.isArray(messages)) {
            return res.status(400).json({
                error: "messages must be an array."
            });
        }

        messages = messages
            .filter(message =>
                message &&
                typeof message.content === "string" &&
                (
                    message.role === "user" ||
                    message.role === "assistant" ||
                    message.role === "system"
                )
            )
            .map(message => ({
                role: message.role,
                content: message.content
            }));

        if (messages.length === 0) {
            return res.status(400).json({
                error: "No valid messages were provided."
            });
        }

        messages.unshift({
            role: "system",
            content:
                "You are CSLLM, a helpful AI assistant. " +
                "Answer clearly, accurately, and naturally."
        });

        console.log("CSLLM: calling Groq");
        console.log("Model:", MODEL);
        console.log("Messages:", messages.length);

        const groqResponse = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                method: "POST",

                headers: {
                    "Authorization": "Bearer " + apiKey,
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    model: MODEL,
                    messages: messages,
                    temperature: 0.7,
                    max_completion_tokens: 2048
                })
            }
        );

        const raw = await groqResponse.text();

        let data;

        try {
            data = JSON.parse(raw);
        } catch {
            data = {
                error: raw
            };
        }

        console.log(
            "Groq status:",
            groqResponse.status
        );

        if (!groqResponse.ok) {
            console.error(
                "Groq error:",
                data
            );

            return res.status(500).json({
                error:
                    data?.error?.message ||
                    "Groq API request failed.",
                provider_status:
                    groqResponse.status
            });
        }

        const reply =
            data?.choices?.[0]?.message?.content;

        if (
            typeof reply !== "string" ||
            reply.trim() === ""
        ) {
            console.error(
                "No reply in Groq response:",
                data
            );

            return res.status(500).json({
                error:
                    "Groq returned an empty response."
            });
        }

        return res.status(200).json({
            reply: reply
        });

    } catch (error) {
        console.error(
            "CSLLM BACKEND ERROR:",
            error
        );

        return res.status(500).json({
            error:
                error?.message ||
                "Internal server error."
        });
    }
}
