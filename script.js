"use strict";

const API_URL = "https://csllm.vercel.app/api/chat";

let chats = [];
let currentChatId = null;
let isSending = false;

let messagesContainer = null;
let messageInput = null;
let sendButton = null;
let newChatButton = null;
let chatList = null;
let chatTitle = null;

// ============================================
// CHECK DOM ELEMENTS
// ============================================

function checkElements() {
messagesContainer = document.getElementById("messages");
messageInput = document.getElementById("messageInput");
sendButton = document.getElementById("sendButton");
newChatButton = document.getElementById("newChatButton");
chatList = document.getElementById("chatList");
chatTitle = document.getElementById("chatTitle");


if (!messagesContainer) {
    console.error("Charlie's AI: Missing #messages");
}

if (!messageInput) {
    console.error("Charlie's AI: Missing #messageInput");
}

if (!sendButton) {
    console.error("Charlie's AI: Missing #sendButton");
}

if (!chatList) {
    console.warn("Charlie's AI: Missing #chatList");
}


}

// ============================================
// CREATE NEW CHAT
// ============================================

function createNewChat() {
const chat = {
id: Date.now().toString(),
title: "New Chat",
messages: []
};


chats.unshift(chat);
currentChatId = chat.id;

saveChats();
renderChatList();
loadChat(chat.id);

if (messageInput) {
    messageInput.value = "";
    messageInput.style.height = "auto";
    messageInput.focus();
}


}

// ============================================
// DELETE CHAT
// ============================================

function deleteChat(chatId, event) {
if (event) {
event.stopPropagation();
}


chats = chats.filter(
    chat => chat.id !== chatId
);

if (chats.length === 0) {
    createNewChat();
    return;
}

if (currentChatId === chatId) {
    currentChatId = chats[0].id;
    loadChat(currentChatId);
}

saveChats();
renderChatList();


}

// ============================================
// SAVE CHATS
// ============================================

function saveChats() {
try {
localStorage.setItem(
"charlies_ai_chats",
JSON.stringify(chats)
);
} catch (error) {
console.error(
"Charlie's AI: Could not save chats:",
error
);
}
}

// ============================================
// LOAD SAVED CHATS
// ============================================

function loadSavedChats() {
try {
const saved =
localStorage.getItem(
"charlies_ai_chats"
);


    if (saved) {
        chats = JSON.parse(saved);
    }
} catch (error) {
    console.error(
        "Charlie's AI: Could not load chats:",
        error
    );

    chats = [];
}

if (!Array.isArray(chats)) {
    chats = [];
}

if (chats.length === 0) {
    createNewChat();
    return;
}

currentChatId = chats[0].id;

renderChatList();
loadChat(currentChatId);


}

// ============================================
// GET CURRENT CHAT
// ============================================

function getCurrentChat() {
return chats.find(
chat => chat.id === currentChatId
);
}

// ============================================
// RENDER CHAT LIST
// ============================================

function renderChatList() {
if (!chatList) {
return;
}


chatList.innerHTML = "";

chats.forEach(chat => {
    const chatItem =
        document.createElement("div");

    chatItem.className = "chat-item";

    if (chat.id === currentChatId) {
        chatItem.classList.add("active");
    }

    const title =
        document.createElement("span");

    title.className =
        "chat-item-title";

    title.textContent =
        chat.title || "New Chat";

    const deleteButton =
        document.createElement("button");

    deleteButton.className =
        "delete-chat";

    deleteButton.textContent = "×";

    deleteButton.setAttribute(
        "aria-label",
        "Delete chat"
    );

    deleteButton.addEventListener(
        "click",
        function(event) {
            deleteChat(
                chat.id,
                event
            );
        }
    );

    chatItem.appendChild(title);
    chatItem.appendChild(deleteButton);

    chatItem.addEventListener(
        "click",
        function() {
            currentChatId = chat.id;

            renderChatList();
            loadChat(chat.id);
        }
    );

    chatList.appendChild(chatItem);
});


}

// ============================================
// LOAD CHAT
// ============================================

function loadChat(chatId) {
const chat = chats.find(
item => item.id === chatId
);


if (!chat) {
    console.error(
        "Charlie's AI: Chat not found:",
        chatId
    );

    return;
}

currentChatId = chatId;

if (chatTitle) {
    chatTitle.textContent =
        chat.title || "New Chat";
}

if (!messagesContainer) {
    return;
}

messagesContainer.innerHTML = "";

if (
    !Array.isArray(chat.messages) ||
    chat.messages.length === 0
) {
    showWelcome();
    return;
}

chat.messages.forEach(message => {
    addMessageToScreen(
        message.role,
        message.content,
        false
    );
});

scrollToBottom();


}

// ============================================
// WELCOME SCREEN
// ============================================

function showWelcome() {
if (!messagesContainer) {
return;
}


const welcome =
    document.createElement("div");

welcome.className = "welcome";

const heading =
    document.createElement("h2");

heading.textContent =
    "Welcome to Charlie's AI";

const paragraph =
    document.createElement("p");

paragraph.textContent =
    "Ask me anything or ask me to create a graph.";

welcome.appendChild(heading);
welcome.appendChild(paragraph);

messagesContainer.appendChild(welcome);


}

// ============================================
// EXTRACT GRAPH DATA
// ============================================

function extractGraph(content) {
if (
!content ||
typeof content !== "string"
) {
return null;
}

`
const graphMatch =
    content.match(
        /graph\s*([\s\S]*?)/i
    );

if (!graphMatch) {
    return null;
}

try {
    return JSON.parse(
        graphMatch[1].trim()
    );
} catch (error) {
    console.error(
        "Charlie's AI: Invalid graph data:",
        error
    );

    return null;
}
`

}

// ============================================
// REMOVE GRAPH FROM TEXT
// ============================================

function removeGraphCode(content) {
if (
!content ||
typeof content !== "string"
) {
return "";
}

`
return content
    .replace(
        /graph\s*[\s\S]*?/gi,
        ""
    )
    .trim();
`

}

// ============================================
// RENDER GRAPH
// ============================================

function renderGraph(
graphData,
container
) {
if (!graphData) {
return false;
}


if (
    typeof Chart === "undefined"
) {
    console.error(
        "Charlie's AI: Chart.js is not loaded."
    );

    return false;
}

const canvas =
    document.createElement("canvas");

canvas.className =
    "ai-graph";

container.appendChild(canvas);

const requestedType =
    String(
        graphData.type || "line"
    ).toLowerCase();

const allowedTypes = [
    "line",
    "bar",
    "scatter",
    "pie",
    "doughnut",
    "polararea"
];

let type =
    requestedType;

if (
    !allowedTypes.includes(type)
) {
    type = "line";
}

if (type === "polararea") {
    type = "polarArea";
}

let labels =
    Array.isArray(
        graphData.labels
    )
        ? graphData.labels
        : [];

let datasets =
    Array.isArray(
        graphData.datasets
    )
        ? graphData.datasets
        : [];

// Support simpler AI graph format
if (
    datasets.length === 0 &&
    Array.isArray(
        graphData.data
    )
) {
    datasets = [
        {
            label:
                graphData.label ||
                "Data",
            data:
                graphData.data
        }
    ];
}

// Support x/y scatter data
if (
    type === "scatter" &&
    datasets.length === 0 &&
    Array.isArray(
        graphData.points
    )
) {
    datasets = [
        {
            label:
                graphData.label ||
                "Data",
            data:
                graphData.points
        }
    ];
}

if (datasets.length === 0) {
    console.error(
        "Charlie's AI: Graph has no datasets."
    );

    canvas.remove();

    return false;
}

// Give datasets default settings
datasets =
    datasets.map(
        dataset => {

            const newDataset = {
                ...dataset
            };

            if (
                !newDataset.label
            ) {
                newDataset.label =
                    "Data";
            }

            if (
                !Array.isArray(
                    newDataset.data
                )
            ) {
                newDataset.data = [];
            }

            return newDataset;
        }
    );

const options = {
    responsive: true,

    maintainAspectRatio: false,

    animation: {
        duration: 500
    },

    plugins: {
        legend: {
            display: true
        }
    }
};

// Axes for normal graphs
if (
    type === "line" ||
    type === "bar"
) {
    options.scales = {
        x: {
            beginAtZero: false
        },

        y: {
            beginAtZero: true
        }
    };
}

// Scatter graph
if (
    type === "scatter"
) {
    options.scales = {
        x: {
            type: "linear",
            position: "bottom"
        },

        y: {
            beginAtZero: false
        }
    };
}

const config = {
    type: type,

    data: {
        labels: labels,

        datasets: datasets
    },

    options: options
};

try {
    new Chart(
        canvas.getContext("2d"),
        config
    );

    return true;

} catch (error) {
    console.error(
        "Charlie's AI: Could not render graph:",
        error
    );

    canvas.remove();

    return false;
}


}

// ============================================
// ADD MESSAGE TO SCREEN
// ============================================

function addMessageToScreen(
role,
content,
scroll = true
) {
if (!messagesContainer) {
console.error(
"Charlie's AI: Missing #messages"
);


    return;
}

const message =
    document.createElement("div");

message.className =
    "message";

if (role === "user") {
    message.classList.add(
        "user-message"
    );
} else {
    message.classList.add(
        "assistant-message"
    );
}

const bubble =
    document.createElement("div");

bubble.className =
    "message-bubble";

const graph =
    extractGraph(content);

// ========================================
// GRAPH MESSAGE
// ========================================

if (graph) {

    const description =
        removeGraphCode(content);

    if (description) {
        const descriptionElement =
            document.createElement("div");

        descriptionElement.className =
            "graph-description";

        descriptionElement.textContent =
            description;

        bubble.appendChild(
            descriptionElement
        );
    }

    const graphContainer =
        document.createElement("div");

    graphContainer.className =
        "graph-container";

    const graphSuccess =
        renderGraph(
            graph,
            graphContainer
        );

    if (graphSuccess) {

        bubble.appendChild(
            graphContainer
        );

    } else {

        bubble.textContent =
            content;
    }

} else {

    bubble.textContent =
        content;
}

message.appendChild(bubble);

messagesContainer.appendChild(
    message
);

if (scroll) {
    scrollToBottom();
}


}

// ============================================
// TYPING INDICATOR
// ============================================

function showTypingIndicator() {
if (!messagesContainer) {
return;
}


removeTypingIndicator();

const typing =
    document.createElement("div");

typing.id =
    "typingIndicator";

typing.className =
    "message assistant-message";

const bubble =
    document.createElement("div");

bubble.className =
    "message-bubble";

bubble.textContent =
    "Thinking...";

typing.appendChild(bubble);

messagesContainer.appendChild(
    typing
);

scrollToBottom();


}

// ============================================
// REMOVE TYPING INDICATOR
// ============================================

function removeTypingIndicator() {
const typing =
document.getElementById(
"typingIndicator"
);


if (typing) {
    typing.remove();
}


}

// ============================================
// SCROLL
// ============================================

function scrollToBottom() {
if (!messagesContainer) {
return;
}


messagesContainer.scrollTop =
    messagesContainer.scrollHeight;


}

// ============================================
// UPDATE CHAT TITLE
// ============================================

function updateChatTitle(
chat,
firstMessage
) {
if (!chat) {
return;
}


if (
    !Array.isArray(
        chat.messages
    ) ||
    chat.messages.length === 0
) {
    return;
}

if (
    !chat.title ||
    chat.title === "New Chat"
) {
    let title =
        firstMessage.trim();

    if (title.length > 30) {
        title =
            title.substring(
                0,
                30
            ) + "...";
    }

    chat.title =
        title || "New Chat";
}


}

// ============================================
// SEND MESSAGE
// ============================================

async function sendMessage() {


if (isSending) {
    return;
}

if (!messageInput) {
    console.error(
        "Charlie's AI: Message input does not exist."
    );

    return;
}

const text =
    messageInput.value.trim();

if (!text) {
    return;
}

let chat =
    getCurrentChat();

if (!chat) {
    createNewChat();

    chat =
        getCurrentChat();

    if (!chat) {
        return;
    }
}

isSending = true;

messageInput.value = "";

messageInput.style.height =
    "auto";

// ========================================
// USER MESSAGE
// ========================================

chat.messages.push({
    role: "user",
    content: text
});

updateChatTitle(
    chat,
    text
);

saveChats();

renderChatList();

loadChat(
    chat.id
);

showTypingIndicator();

if (sendButton) {
    sendButton.disabled = true;

    sendButton.textContent =
        "Sending...";
}

// ========================================
// API REQUEST
// ========================================

try {

    console.log(
        "Sending request to:",
        API_URL
    );

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
                    messages:
                        chat.messages
                })
            }
        );

    console.log(
        "Backend status:",
        response.status
    );

    const responseText =
        await response.text();

    let data;

    try {
        data =
            JSON.parse(
                responseText
            );

    } catch {
        data = {
            error:
                responseText
        };
    }

    // ====================================
    // ERROR
    // ====================================

    if (!response.ok) {

        console.error(
            "Charlie's AI backend error:",
            response.status,
            data
        );

        let errorMessage =
            "The AI service returned an error.";

        if (
            data &&
            data.error
        ) {
            errorMessage =
                data.error;
        }

        throw new Error(
            "Server returned " +
            response.status +
            ": " +
            errorMessage
        );
    }

    // ====================================
    // GET AI RESPONSE
    // ====================================

    let aiMessage = "";

    if (
        typeof data === "string"
    ) {

        aiMessage =
            data;

    } else if (
        data.reply
    ) {

        aiMessage =
            data.reply;

    } else if (
        data.message
    ) {

        if (
            typeof data.message ===
            "string"
        ) {

            aiMessage =
                data.message;

        } else if (
            data.message.content
        ) {

            aiMessage =
                data.message.content;
        }

    } else if (
        data.content
    ) {

        aiMessage =
            data.content;

    } else if (
        data.choices &&
        data.choices[0]
    ) {

        const choice =
            data.choices[0];

        if (
            choice.message &&
            choice.message.content
        ) {

            aiMessage =
                choice.message.content;

        } else if (
            choice.text
        ) {

            aiMessage =
                choice.text;
        }
    }

    // ====================================
    // INVALID RESPONSE
    // ====================================

    if (
        !aiMessage ||
        typeof aiMessage !==
        "string"
    ) {

        console.error(
            "Charlie's AI: Unknown backend response:",
            data
        );

        throw new Error(
            "The backend returned an unexpected response."
        );
    }

    // ====================================
    // SAVE AI RESPONSE
    // ====================================

    chat.messages.push({
        role: "assistant",
        content: aiMessage
    });

    saveChats();

    removeTypingIndicator();

    addMessageToScreen(
        "assistant",
        aiMessage
    );

    renderChatList();

} catch (error) {

    console.error(
        "Charlie's AI connection error:",
        error
    );

    removeTypingIndicator();

    addMessageToScreen(
        "assistant",
        "Sorry, I couldn't connect to the AI.\n\n" +
        error.message
    );

} finally {

    isSending = false;

    if (sendButton) {

        sendButton.disabled =
            false;

        sendButton.textContent =
            "Send";
    }

    if (messageInput) {
        messageInput.focus();
    }
}


}

// ============================================
// ENTER KEY
// ============================================

function handleKey(event) {
if (
event.key === "Enter" &&
!event.shiftKey
) {
event.preventDefault();


    sendMessage();
}


}

// ============================================
// AUTO RESIZE TEXTAREA
// ============================================

function resizeTextarea() {
if (!messageInput) {
return;
}


messageInput.style.height =
    "auto";

messageInput.style.height =
    Math.min(
        messageInput.scrollHeight,
        200
    ) + "px";


}

// ============================================
// SUGGESTION BUTTON
// ============================================

function suggest(text) {
if (!messageInput) {
return;
}


messageInput.value =
    text;

resizeTextarea();

messageInput.focus();


}

// ============================================
// CLEAR ALL CHATS
// ============================================

function clearAllChats() {
const confirmed =
confirm(
"Delete all chats?"
);


if (!confirmed) {
    return;
}

localStorage.removeItem(
    "charlies_ai_chats"
);

chats = [];

currentChatId = null;

createNewChat();


}

// ============================================
// EVENT LISTENERS
// ============================================

function setupEvents() {


if (sendButton) {
    sendButton.addEventListener(
        "click",
        sendMessage
    );
}

if (newChatButton) {
    newChatButton.addEventListener(
        "click",
        createNewChat
    );
}

if (messageInput) {

    messageInput.addEventListener(
        "keydown",
        handleKey
    );

    messageInput.addEventListener(
        "input",
        resizeTextarea
    );
}


}

// ============================================
// MAKE FUNCTIONS AVAILABLE TO HTML
// ============================================

window.sendMessage =
sendMessage;

window.handleKey =
handleKey;

window.suggest =
suggest;

window.createNewChat =
createNewChat;

window.deleteChat =
deleteChat;

window.clearAllChats =
clearAllChats;

// ============================================
// INITIALIZE
// ============================================

function initialize() {
checkElements();


setupEvents();

loadSavedChats();


}

// ============================================
// START
// ============================================

if (
document.readyState ===
"loading"
) {


document.addEventListener(
    "DOMContentLoaded",
    initialize
);


} else {


initialize();


}
