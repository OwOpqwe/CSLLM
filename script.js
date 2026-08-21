// ========================================
// CSLLM FRONTEND
// Works on Vercel AND GitHub Pages
// ========================================

const API_URL =
    "https://csllm.vercel.app/api/chat";


// ========================================
// HTML ELEMENTS
// ========================================

const chat =
    document.getElementById("chat");

const input =
    document.getElementById("messageInput");

const history =
    document.getElementById("history");


// ========================================
// SEND MESSAGE
// ========================================

async function sendMessage() {

    const text =
        input.value.trim();


    if (!text) {
        return;
    }


    removeWelcome();


    // Add user message
    addMessage(
        text,
        "user"
    );


    // Add to history
    addHistory(text);


    // Clear input
    input.value = "";

    input.style.height = "auto";


    // Loading message
    const loading =
        addMessage(
            "Thinking...",
            "ai"
        );


    try {

        const response =
            await fetch(
                API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        message: text
                    })
                }
            );


        const responseText =
            await response.text();


        console.log(
            "Backend status:",
            response.status
        );


        if (!response.ok) {

            console.error(
                "Backend error:",
                responseText
            );

            throw new Error(
                `Server returned ${response.status}`
            );
        }


        let data;


        try {

            data =
                JSON.parse(
                    responseText
                );

        } catch {

            throw new Error(
                "Invalid response from server."
            );
        }


        // Remove loading
        loading.remove();


        if (data.error) {

            addMessage(
                "AI Error: " +
                data.error,
                "ai"
            );

            return;
        }


        if (data.reply) {

            addMessage(
                data.reply,
                "ai"
            );

        } else {

            addMessage(
                "The AI returned an empty response.",
                "ai"
            );
        }


    } catch (error) {

        console.error(
            "AI connection error:",
            error
        );


        if (loading) {
            loading.remove();
        }


        addMessage(
            "Sorry, I couldn't connect to CSLLM.",
            "ai"
        );
    }
}


// ========================================
// ADD MESSAGE
// ========================================

function addMessage(
    text,
    type
) {

    const message =
        document.createElement("div");


    message.className =
        `message ${type}`;


    const content =
        document.createElement("div");


    content.className =
        "message-content";


    content.textContent =
        text;


    message.appendChild(
        content
    );


    chat.appendChild(
        message
    );


    chat.scrollTop =
        chat.scrollHeight;


    return message;
}


// ========================================
// REMOVE WELCOME
// ========================================

function removeWelcome() {

    const welcome =
        document.getElementById(
            "welcome"
        );


    if (welcome) {
        welcome.remove();
    }
}


// ========================================
// SUGGESTIONS
// ========================================

function suggest(text) {

    input.value =
        text;


    input.style.height =
        "auto";


    input.style.height =
        Math.min(
            input.scrollHeight,
            150
        ) + "px";


    input.focus();


    sendMessage();
}


// ========================================
// NEW CHAT
// ========================================

function newChat() {

    chat.innerHTML = `

        <div
            class="welcome"
            id="welcome"
        >

            <h1>
                How can I help?
            </h1>

            <p>
                Ask me anything.
            </p>

            <div class="suggestions">

                <button
                    onclick="suggest(
                        'Explain how AI works'
                    )"
                >
                    Explain how AI works
                </button>


                <button
                    onclick="suggest(
                        'Help me with my homework'
                    )"
                >
                    Help me with my homework
                </button>


                <button
                    onclick="suggest(
                        'Give me a fun project idea'
                    )"
                >
                    Give me a project idea
                </button>

            </div>

        </div>

    `;


    input.value = "";

    input.style.height =
        "auto";

    input.focus();
}


// ========================================
// HISTORY
// ========================================

function addHistory(text) {

    if (!history) {
        return;
    }


    const item =
        document.createElement("div");


    item.className =
        "history-item";


    let displayText =
        text;


    if (displayText.length > 40) {

        displayText =
            displayText.substring(
                0,
                40
            ) + "...";
    }


    item.textContent =
        displayText;


    history.prepend(
        item
    );
}


// ========================================
// KEYBOARD
// ========================================

function handleKey(event) {

    if (
        event.key === "Enter" &&
        !event.shiftKey
    ) {

        event.preventDefault();

        sendMessage();
    }
}


// ========================================
// AUTO RESIZE TEXTAREA
// ========================================

if (input) {

    input.addEventListener(
        "input",
        () => {

            input.style.height =
                "auto";


            input.style.height =
                Math.min(
                    input.scrollHeight,
                    150
                ) + "px";
        }
    );
}


// ========================================
// SIDEBAR
// ========================================

function toggleSidebar() {

    const sidebar =
        document.querySelector(
            ".sidebar"
        );


    if (!sidebar) {
        return;
    }


    sidebar.classList.toggle(
        "open"
    );
}


// ========================================
// STARTUP
// ========================================

console.log(
    "CSLLM loaded."
);

console.log(
    "AI backend:",
    API_URL
);
