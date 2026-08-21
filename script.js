const chat = document.getElementById("chat");
const input = document.getElementById("messageInput");
const history = document.getElementById("history");

let conversations = [];


// SEND MESSAGE

function sendMessage() {

    const text = input.value.trim();

    if (!text) return;

    removeWelcome();

    addMessage(text, "user");

    input.value = "";

    input.style.height = "auto";

    addHistory(text);

    // Temporary AI response
    setTimeout(() => {

        const response = generateResponse(text);

        addMessage(response, "ai");

    }, 600);
}


// ADD MESSAGE

function addMessage(text, type) {

    const message = document.createElement("div");

    message.className = `message ${type}`;

    const content = document.createElement("div");

    content.className = "message-content";

    content.textContent = text;

    message.appendChild(content);

    chat.appendChild(message);

    chat.scrollTop = chat.scrollHeight;
}


// REMOVE WELCOME SCREEN

function removeWelcome() {

    const welcome = document.getElementById("welcome");

    if (welcome) {
        welcome.remove();
    }
}


// SUGGESTION BUTTON

function suggest(text) {

    input.value = text;

    sendMessage();
}


// NEW CHAT

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
}


// CHAT HISTORY

function addHistory(text) {

    const item = document.createElement("div");

    item.className = "history-item";

    item.textContent = text;

    history.prepend(item);

}


// MOBILE SIDEBAR

function toggleSidebar() {

    const sidebar = document.querySelector(".sidebar");

    sidebar.classList.toggle("open");

}


// ENTER TO SEND

function handleKey(event) {

    if (event.key === "Enter" && !event.shiftKey) {

        event.preventDefault();

        sendMessage();

    }
}


// AUTO RESIZE TEXTAREA

input.addEventListener("input", () => {

    input.style.height = "auto";

    input.style.height = input.scrollHeight + "px";

});


// TEMPORARY AI

function generateResponse(message) {

    const text = message.toLowerCase();

    if (text.includes("hello") || text.includes("hi")) {

        return "Hello! I'm your AI assistant. What would you like to talk about?";

    }

    if (text.includes("how does ai work")) {

        return "AI learns patterns from data using mathematical models called neural networks. During training, the model adjusts billions of parameters so it becomes better at predicting useful outputs.";

    }

    if (text.includes("who are you")) {

        return "I'm My AI, a small experimental chatbot. Right now I'm running with simple JavaScript responses. The next step is connecting me to a real language model.";

    }

    if (text.includes("project")) {

        return "A cool project would be to build your own small language model and then create a website where people can talk to it.";

    }

    return "I received your message: \"" + message + "\"\n\nRight now I'm a basic prototype. The next version can connect this website to a real AI model.";
}
