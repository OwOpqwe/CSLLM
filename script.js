const chat = document.getElementById("chat");
const input = document.getElementById("messageInput");
const history = document.getElementById("history");


// ========================================
// SEND MESSAGE
// ========================================

async function sendMessage() {

    const text = input.value.trim();

    if (!text) return;

    // Remove welcome screen
    removeWelcome();

    // Display user's message
    addMessage(text, "user");

    // Clear input
    input.value = "";
    input.style.height = "auto";

    // Add message to sidebar history
    addHistory(text);

    // Show loading message
    const loadingMessage = addMessage("Thinking...", "ai");

    try {

        // Send message to your Vercel backend
        const response = await fetch(
            "https://csllm.vercel.app/api/chat",
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


        // Check if the backend responded successfully
        if (!response.ok) {

            const errorText = await response.text();

            console.error(
                "Backend error:",
                response.status,
                errorText
            );

            throw new Error(
                `Server returned ${response.status}`
            );
        }


        // Convert response to JSON
        const data = await response.json();


        // Remove "Thinking..."
        loadingMessage.remove();


        // Display AI response
        if (data.reply) {

            addMessage(data.reply, "ai");

        } else {

            addMessage(
                "The AI didn't return a response.",
                "ai"
            );

        }


    } catch (error) {

        console.error("AI connection error:", error);


        // Remove "Thinking..."
        loadingMessage.remove();


        // Show error message
        addMessage(
            "Sorry, I couldn't connect to the AI. Please check your Vercel backend.",
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


    content.textContent = text;


    message.appendChild(content);

    chat.appendChild(message);


    // Automatically scroll to newest message
    chat.scrollTop = chat.scrollHeight;


    // Return the message so we can remove it later
    return message;
}


// ========================================
// REMOVE WELCOME SCREEN
// ========================================

function removeWelcome() {

    const welcome = document.getElementById("welcome");

    if (welcome) {

        welcome.remove();

    }
}


// ========================================
// SUGGESTION BUTTONS
// ========================================

function suggest(text) {

    input.value = text;

    input.style.height = "auto";

    input.style.height =
        Math.min(input.scrollHeight, 150) + "px";

    input.focus();

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

                <button onclick="suggest('Explain how AI works')">
                    Explain how AI works
                </button>

                <button onclick="suggest('Help me with my homework')">
                    Help me with my homework
                </button>

                <button onclick="suggest('Give me a fun project idea')">
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

    const item = document.createElement("div");

    item.className = "history-item";

    item.textContent = text;


    // Put newest conversation at the top
    history.prepend(item);
}


// ========================================
// MOBILE SIDEBAR
// ========================================

function toggleSidebar() {

    const sidebar =
        document.querySelector(".sidebar");

    sidebar.classList.toggle("open");
}


// ========================================
// ENTER TO SEND
// ========================================

function handleKey(event) {

    // Enter sends the message
    // Shift + Enter creates a new line

    if (
        event.key === "Enter" &&
        !event.shiftKey
    ) {

        event.preventDefault();

        sendMessage();

    }
}


// ========================================
// AUTO-RESIZE TEXTAREA
// ========================================

input.addEventListener("input", () => {

    input.style.height = "auto";

    input.style.height =
        Math.min(input.scrollHeight, 150) + "px";

});


// ========================================
// CLOSE MOBILE SIDEBAR
// ========================================

chat.addEventListener("click", () => {

    const sidebar =
        document.querySelector(".sidebar");

    if (window.innerWidth <= 700) {

        sidebar.classList.remove("open");

    }
});
