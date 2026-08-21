export default async function handler(req, res) {

    // Only allow POST requests
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {

        // Get the user's message
        const { message } = req.body;

        // Make sure there is a message
        if (!message || typeof message !== "string") {
            return res.status(400).json({
                error: "No message provided"
            });
        }

        // Make sure the API key exists
        if (!process.env.OPENAI_API_KEY) {
            console.error("OPENAI_API_KEY is missing");

            return res.status(500).json({
                error: "OpenAI API key is not configured"
            });
        }

        // Send the message to OpenAI
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
                    model: "gpt-5.6",
                    instructions:
                        "You are My AI, a helpful and friendly AI assistant. Give clear, useful answers.",
                    input: message
                })
            }
        );

        // Get OpenAI response
        const data = await response.json();

        // Handle OpenAI errors
        if (!response.ok) {

            console.error("OpenAI error:", data);

            return res.status(response.status).json({
                error: "The AI service returned an error."
            });
        }

        // Get the generated text
        const reply = data.output_text;

        // Send it back to the website
        return res.status(200).json({
            reply: reply || "The AI didn't return a response."
        });

    } catch (error) {

        console.error("Server error:", error);

        return res.status(500).json({
            error: "Something went wrong on the server."
        });
    }
}
