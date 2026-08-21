export default async function handler(req, res) {

    // Only allow POST requests
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {

        const { message } = req.body;

        // Check for a message
        if (!message || typeof message !== "string") {
            return res.status(400).json({
                error: "No message provided"
            });
        }

        // Check for Groq API key
        if (!process.env.GROQ_API_KEY) {
            return res.status(500).json({
                error: "GROQ_API_KEY is not configured in Vercel."
            });
        }

        // Send request to Groq
        const response = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization":
                        `Bearer ${process.env.GROQ_API_KEY}`
                },

                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",

                    messages: [
                        {
                            role: "system",
                            content:
                                "You are CSLLM, a helpful, friendly AI assistant. Give clear and useful answers."
                        },
                        {
                            role: "user",
                            content: message
                        }
                    ],

                    temperature: 0.7,
                    max_tokens: 1000
                })
            }
        );

        const data = await response.json();

        console.log("Groq status:", response.status);
        console.log("Groq response:", data);

        // Handle Groq errors
        if (!response.ok) {

            return res.status(response.status).json({
                error:
                    data.error?.message ||
                    "Groq API request failed."
            });
        }

        // Get AI response
        const reply =
            data.choices?.[0]?.message?.content;

        if (!reply) {

            return res.status(500).json({
                error: "Groq returned an empty response."
            });
        }

        // Send response back to website
        return res.status(200).json({
            reply: reply
        });

    } catch (error) {

        console.error("Server error:", error);

        return res.status(500).json({
            error: error.message ||
                "Something went wrong."
        });
    }
}
