export default async function handler(req, res) {

    // Only allow POST requests
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {

        const { message } = req.body;

        if (!message || typeof message !== "string") {
            return res.status(400).json({
                error: "No message provided"
            });
        }

        if (!process.env.OPENAI_API_KEY) {
            return res.status(500).json({
                error: "OPENAI_API_KEY is missing from Vercel."
            });
        }

        const response = await fetch(
            "https://api.openai.com/v1/responses",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization":
                        `Bearer ${process.env.OPENAI_API_KEY}`
                },

                body: JSON.stringify({
                    model: "gpt-5.6-luna",
                    input: message
                })
            }
        );

        const data = await response.json();

        console.log("OpenAI status:", response.status);
        console.log("OpenAI response:", data);

        if (!response.ok) {

            return res.status(response.status).json({
                error: data.error?.message || "OpenAI request failed.",
                type: data.error?.type || null,
                code: data.error?.code || null
            });
        }

        return res.status(200).json({
            reply: data.output_text
        });

    } catch (error) {

        console.error("Server error:", error);

        return res.status(500).json({
            error: error.message || "Server error"
        });
    }
}
