const MODEL = "openai/gpt-oss-20b";

export default async function handler(req, res) {


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


if (req.method === "OPTIONS") {
    return res.status(200).end();
}


if (req.method !== "POST") {

    return res.status(405).json({
        error: "Method not allowed"
    });

}


try {

    const apiKey =
        process.env.GROQ_API_KEY;


    if (!apiKey) {

        return res.status(500).json({
            error:
                "GROQ_API_KEY is missing from Vercel."
        });

    }


    let body =
        req.body || {};


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


    let messages =
        body.messages;


    const responseType =
        body.responseType ||
        "normal";


    const graphType =
        body.graphType ||
        "auto";


    if (!Array.isArray(messages)) {

        return res.status(400).json({
            error:
                "messages must be an array."
        });

    }


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


    const graphInstruction =
        responseType === "graph"
            ? `


The user has selected GRAPH mode.

When the user asks for a graph, return graph data separately.

Your response MUST be valid JSON with this exact structure:

{
"reply": "short explanation",
"graph": {
"type": "bar",
"title": "Graph title",
"label": "Data",
"labels": ["A", "B", "C"],
"values": [10, 20, 30]
}
}

Allowed graph types:
bar
line
pie
scatter

The requested graph type is: ${graphType}

If graphType is "auto", choose the most appropriate type.

For scatter graphs, values MUST be:
[
{"x": 1, "y": 2},
{"x": 2, "y": 4}
]

For bar, line, and pie graphs, use labels and values.

Do not put markdown around the JSON.
`                :`
Normal response mode is selected.

Return valid JSON:

{
"reply": "your response",
"graph": null
}

Do not create a graph unless the user clearly requests one.
`;


    const systemInstruction = `


You are Charlie's AI, a helpful educational and general-purpose AI assistant.

Your purpose is to help users understand information, solve problems, explain concepts, analyze data, and create useful visualizations.

You should:

* Answer clearly and accurately.
* Explain difficult ideas in an understandable way.
* Show useful calculations when appropriate.
* Never claim to have performed an action you did not perform.
* Use the user's selected options.
* Create graphs when requested.
* Keep graph data accurate to the information supplied by the user.
* Never expose API keys or secret information.

${graphInstruction}

The user selected:
Response type: ${responseType}
Graph type: ${graphType}
`;

`
    const finalMessages = [
        {
            role: "system",
            content:
                systemInstruction
        },
        ...messages
    ];


    console.log(
        "Charlie's AI: calling Groq"
    );

    console.log(
        "Model:",
        MODEL
    );

    console.log(
        "Messages:",
        finalMessages.length
    );


    const groqResponse =
        await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                method: "POST",

                headers: {
                    "Authorization":
                        "Bearer " +
                        apiKey,

                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify({
                        model:
                            MODEL,

                        messages:
                            finalMessages,

                        temperature:
                            0.7,

                        max_completion_tokens:
                            2048
                    })
            }
        );


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


    const content =
        data?.choices?.[0]?.message?.content;


    if (
        typeof content !== "string" ||
        content.trim() === ""
    ) {

        return res.status(500).json({
            error:
                "Groq returned an empty response."
        });

    }


    let parsed;


    try {

        parsed =
            JSON.parse(
                content
                    .replace(
                        /^json\s*/i,
                        ""
                    )
                    .replace(
                        /^\s*/i,
                        ""
                    )
                    .replace(
                        /\s*$/i,
                        ""
                    )
                    .trim()
            );

    } catch {

        parsed = {
            reply: content,
            graph: null
        };

    }


    return res.status(200).json({

        reply:
            typeof parsed.reply === "string"
                ? parsed.reply
                : content,

        graph:
            parsed.graph &&
            typeof parsed.graph === "object"
                ? parsed.graph
                : null

    });


} catch (error) {

    console.error(
        "CHARLIE'S AI BACKEND ERROR:",
        error
    );


    return res.status(500).json({
        error:
            error?.message ||
            "Internal server error."
    });

}
`

}
