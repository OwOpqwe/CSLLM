// ========================================
// CSLLM - FRONTEND JAVASCRIPT
// ========================================

// Your Vercel backend
const API_URL = "https://csllm.vercel.app/api/chat";


// ========================================
// GET HTML ELEMENTS
// ========================================

const chat = document.getElementById("chat");
const input = document.getElementById("messageInput");
const history = document.getElementById("history");


// ========================================
// SEND MESSAGE
// ========================================

async function sendMessage() {

    const text = input.value.trim();

    // Don't send empty messages
    if (!text) {
        return;
    }

    // Remove welcome screen
    removeWelcome();

    // Display user's message
    addMessage(text, "user");

    // Add conversation to history
    addHistory(text);

    // Clear input
    input.value = "";

    // Reset textarea height
    input.style.height = "auto";


    // Show loading message
    const loadingMessage = addMessage(
        "Thinking...",
        "ai"
    );


    try {

        // Send message to Vercel
        const response = await fetch(
            API_URL,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    message: text
                })
            }
        );


        // Get response text first
        // This lets us see errors from the backend
        const responseText = await response.text();


        // Check HTTP status
        if (!response.ok) {

            console.error(
                "Backend error:",
                response.status,
                responseText
            );

            throw new Error(
                `Server returned ${response.status}`
            );
        }


        // Convert response to JSON
        let data;

        try {

            data = JSON.parse(responseText);

        } catch (error) {

            console.error(
                "Invalid JSON received:",
                responseText
            );

            throw new Error(
                "The server returned invalid data."
            );
        }


        // Remove "Thinking..."
        loadingMessage.remove();


        // Check for an error returned by backend
        if (data.error) {

            addMessage(
                "AI Error: " + data.error,
                "ai"
            );

            return;
        }


        // Check for AI response
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


        // Remove loading message
        if (loadingMessage) {
            loadingMessage.remove();
        }


        // Display error
        addMessage(
            "Sorry, I couldn't connect to CSLLM. Check the browser console for the error.",
            "ai"
        );
    }
}


// ========================================
// ADD MESSAGE
// ========================================

function addMessage(text, type) {

    const message = document.createElement("div");

    message.className = `message ${type}`;


    const content = document.createElement("div");

    content.className = "message-content";


    // textContent prevents AI responses
    // from being treated as HTML
    content.textContent = text;


    message.appendChild(content);

    chat.appendChild(message);


    // Scroll to newest message
    chat.scrollTop = chat.scrollHeight;


    // Return message
    return message;
}


// ========================================
// REMOVE WELCOME SCREEN
// ========================================

function removeWelcome() {

    const welcome =
        document.getElementById("welcome");

    if (welcome) {

        welcome.remove();

    }
}


// ========================================
// SUGGESTION BUTTON
// ========================================

function suggest(text) {

    input.value = text;


    // Resize textarea
    input.style.height = "auto";

    input.style.height =
        Math.min(
            input.scrollHeight,
            150
        ) + "px";


    input.focus();


    // Send suggestion
    sendMessage();
}


// ========================================
// NEW CHAT
// ========================================

function newChat() {

    chat.innerHTML = `
        <div class="welcome" id="welcome">

            <h1>How can I help?</h1>

            <p>Ask me anything.</p>

            <div class="suggestions">

                <button
                    onclick="suggest('Explain how AI works')">
                    Explain how AI works
                </button>

                <button
                    onclick="suggest('Help me with my homework')">
                    Help me with my homework
                </button>

                <button
                    onclick="suggest('Give me a fun project idea')">
                    Give me a project idea
                </button>

            </div>

        </div>
    `;


    input.value = "";

    input.style.height = "auto";

    input.focus();
}


// ========================================
// CHAT HISTORY
// ========================================

function addHistory(text) {

    if (!history) {
        return;
    }


    const item =
        document.createElement("div");


    item.className =
        "history-item";


    // Don't put extremely long messages
    // into the sidebar
    let displayText = text;

    if (displayText.length > 40) {

        displayText =
            displayText.substring(0, 40)
            + "...";
    }


    item.textContent = displayText;


    // Newest conversation at top
    history.prepend(item);
}


// ========================================
// MOBILE SIDEBAR
// ========================================

function toggleSidebar() {

    const sidebar =
        document.querySelector(".sidebar");


    if (!sidebar) {
        return;
    }


    sidebar.classList.toggle("open");
}


// ========================================
// KEYBOARD INPUT
// ========================================

function handleKey(event) {

    // Enter = send
    // Shift + Enter = new line

    if (
        event.key === "Enter" &&
        !event.shiftKey
    ) {

        event.preventDefault();

        sendMessage();
    }
}


// ========================================
// TEXTAREA AUTO RESIZE
// ========================================

if (input) {

    input.addEventListener(
        "input",
        () => {

            input.style.height = "auto";

            input.style.height =
                Math.min(
                    input.scrollHeight,
                    150
                ) + "px";
        }
    );
}


// ========================================
// CLOSE SIDEBAR ON MOBILE
// ========================================

if (chat) {

    chat.addEventListener(
        "click",
        () => {

            const sidebar =
                document.querySelector(
                    ".sidebar"
                );


            if (
                sidebar &&
                window.innerWidth <= 700
            ) {

                sidebar.classList.remove(
                    "open"
                );
            }
        }
    );
}


// ========================================
// STARTUP
// ========================================

console.log(
    "CSLLM frontend loaded."
);

console.log(
    "Backend:",
    API_URL
);
