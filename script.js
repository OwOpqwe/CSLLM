"use strict";

/*

* CHARLIE'S AI FRONTEND
*
* Backend:
* https://csllm.vercel.app/api/chat
*
* API key stays on the backend.
  */

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
let clearChatsButton = null;

let graphContainer = null;
let graphCanvas = null;
let graphTitle = null;
let graphType = null;
let closeGraphButton = null;

let currentChart = null;
let currentGraphData = null;

/* ============================================
CHECK DOM ELEMENTS
============================================ */

function checkElements() {
messagesContainer =
document.getElementById("messages");


messageInput =
    document.getElementById("messageInput");

sendButton =
    document.getElementById("sendButton");

newChatButton =
    document.getElementById("newChatButton");

chatList =
    document.getElementById("chatList");

chatTitle =
    document.getElementById("chatTitle");

clearChatsButton =
    document.getElementById("clearChatsButton");

graphContainer =
    document.getElementById("graphContainer");

graphCanvas =
    document.getElementById("graphCanvas");

graphTitle =
    document.getElementById("graphTitle");

graphType =
    document.getElementById("graphType");

closeGraphButton =
    document.getElementById("closeGraphButton");

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

/* ============================================
CREATE NEW CHAT
============================================ */

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

hideGraph();

if (messageInput) {
    messageInput.value = "";
    messageInput.focus();
}


}

/* ============================================
DELETE CHAT
============================================ */

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

/* ============================================
SAVE CHATS
============================================ */

function saveChats() {
try {
localStorage.setItem(
"charlies_ai_chats",
JSON.stringify(chats)
);
} catch (error) {
console.error(
"Could not save chats:",
error
);
}
}

/* ============================================
LOAD SAVED CHATS
============================================ */

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
        "Could not load chats:",
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

/* ============================================
GET CURRENT CHAT
============================================ */

function getCurrentChat() {
return chats.find(
chat => chat.id === currentChatId
);
}

/* ============================================
RENDER CHAT LIST
============================================ */

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

            hideGraph();
        }
    );

    chatList.appendChild(chatItem);
});


}

/* ============================================
LOAD CHAT
============================================ */

function loadChat(chatId) {
const chat = chats.find(
item => item.id === chatId
);


if (!chat) {
    console.error(
        "Chat not found:",
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

/* ============================================
WELCOME
============================================ */

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
    "Ask me a question, analyze data, or create a graph.";

welcome.appendChild(heading);
welcome.appendChild(paragraph);

messagesContainer.appendChild(welcome);


}

/* ============================================
ADD MESSAGE
============================================ */

function addMessageToScreen(
role,
content,
scroll = true
) {
if (!messagesContainer) {
return;
}


const message =
    document.createElement("div");

message.className = "message";

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

/*
 * Do not show GRAPH_START / GRAPH_END
 * as normal text.
 */
const cleanContent =
    removeGraphSpecification(content);

bubble.textContent =
    cleanContent;

message.appendChild(bubble);

messagesContainer.appendChild(message);

/*
 * If the message contains a graph,
 * generate it.
 */
if (role === "assistant") {
    const graphData =
        extractGraphData(content);

    if (graphData) {
        currentGraphData = graphData;

        showGraph(
            graphData
        );
    }
}

if (scroll) {
    scrollToBottom();
}


}

/* ============================================
EXTRACT GRAPH DATA
============================================ */

function extractGraphData(text) {
if (
typeof text !== "string"
) {
return null;
}


const start =
    text.indexOf(
        "GRAPH_START"
    );

const end =
    text.indexOf(
        "GRAPH_END"
    );

if (
    start === -1 ||
    end === -1 ||
    end <= start
) {
    return null;
}

const jsonText =
    text.substring(
        start + "GRAPH_START".length,
        end
    ).trim();

try {
    const data =
        JSON.parse(jsonText);

    if (
        !data ||
        typeof data !== "object"
    ) {
        return null;
    }

    const allowedTypes = [
        "line",
        "bar",
        "pie",
        "doughnut",
        "scatter",
        "radar"
    ];

    if (
        !allowedTypes.includes(
            data.type
        )
    ) {
        data.type = "line";
    }

    return data;

} catch (error) {
    console.error(
        "Could not parse graph JSON:",
        error,
        jsonText
    );

    return null;
}


}

/* ============================================
REMOVE GRAPH SPECIFICATION
============================================ */

function removeGraphSpecification(text) {
if (
typeof text !== "string"
) {
return "";
}


return text
    .replace(
        /GRAPH_START[\s\S]*?GRAPH_END/g,
        ""
    )
    .trim();


}

/* ============================================
SHOW GRAPH
============================================ */

function showGraph(data) {
if (
!graphContainer ||
!graphCanvas
) {
console.warn(
"Graph elements are missing from HTML."
);


    return;
}

graphContainer.style.display =
    "block";

if (graphTitle) {
    graphTitle.textContent =
        data.title ||
        "Generated Graph";
}

if (graphType) {
    graphType.value =
        data.type;
}

drawGraph(data);


}

/* ============================================
DRAW GRAPH
============================================ */

function drawGraph(data) {
if (!graphCanvas) {
return;
}


if (
    typeof Chart === "undefined"
) {
    console.error(
        "Chart.js is not loaded."
    );

    return;
}

if (currentChart) {
    currentChart.destroy();
    currentChart = null;
}

const type =
    data.type || "line";

let chartData;
let options;

/*
 * SCATTER
 */

if (type === "scatter") {
    const points =
        Array.isArray(data.points)
            ? data.points
            : [];

    chartData = {
        datasets: [
            {
                label:
                    data.title ||
                    "Data",
                data: points,
                borderWidth: 2
            }
        ]
    };

    options = {
        responsive: true,
        maintainAspectRatio: false,

        scales: {
            x: {
                type: "linear",
                position: "bottom"
            }
        },

        plugins: {
            legend: {
                display: true
            }
        }
    };

} else {

    /*
     * NORMAL CHARTS
     */

    const labels =
        Array.isArray(data.labels)
            ? data.labels
            : [];

    const values =
        Array.isArray(data.values)
            ? data.values
            : [];

    chartData = {
        labels: labels,

        datasets: [
            {
                label:
                    data.title ||
                    "Data",

                data: values,

                borderWidth: 2,

                tension: 0.25
            }
        ]
    };

    /*
     * PIE / DOUGHNUT
     */

    if (
        type === "pie" ||
        type === "doughnut"
    ) {
        chartData.datasets[0].backgroundColor =
            generateChartColors(
                values.length
            );

        chartData.datasets[0].borderWidth =
            2;

        options = {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    display: true,
                    position: "right"
                }
            }
        };

    } else {

        /*
         * LINE / BAR / RADAR
         */

        options = {
            responsive: true,
            maintainAspectRatio: false,

            scales: {
                y: {
                    beginAtZero: true
                }
            },

            plugins: {
                legend: {
                    display:
                        type === "radar"
                }
            }
        };
    }
}

try {
    currentChart =
        new Chart(
            graphCanvas.getContext("2d"),
            {
                type: type,

                data: chartData,

                options: options
            }
        );

} catch (error) {
    console.error(
        "Could not create graph:",
        error
    );
}


}

/* ============================================
GRAPH COLORS
============================================ */

function generateChartColors(count) {
const colors = [];


const colorList = [
    "#3b82f6",
    "#ef4444",
    "#22c55e",
    "#f59e0b",
    "#a855f7",
    "#06b6d4",
    "#ec4899",
    "#84cc16",
    "#f97316",
    "#6366f1"
];

for (
    let i = 0;
    i < count;
    i++
) {
    colors.push(
        colorList[
            i % colorList.length
        ]
    );
}

return colors;


}

/* ============================================
CHANGE GRAPH TYPE
============================================ */

function changeGraphType() {
if (
!currentGraphData ||
!graphType
) {
return;
}


const newType =
    graphType.value;

const newData = {
    ...currentGraphData,
    type: newType
};

currentGraphData =
    newData;

drawGraph(newData);


}

/* ============================================
HIDE GRAPH
============================================ */

function hideGraph() {
if (graphContainer) {
graphContainer.style.display =
"none";
}


if (currentChart) {
    currentChart.destroy();
    currentChart = null;
}

currentGraphData = null;


}

/* ============================================
TYPING INDICATOR
============================================ */

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

/* ============================================
REMOVE TYPING INDICATOR
============================================ */

function removeTypingIndicator() {
const typing =
document.getElementById(
"typingIndicator"
);


if (typing) {
    typing.remove();
}


}

/* ============================================
SCROLL
============================================ */

function scrollToBottom() {
if (!messagesContainer) {
return;
}


messagesContainer.scrollTop =
    messagesContainer.scrollHeight;


}

/* ============================================
UPDATE CHAT TITLE
============================================ */

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

/* ============================================
SEND MESSAGE
============================================ */

async function sendMessage() {
if (isSending) {
return;
}


if (!messageInput) {
    console.error(
        "Message input does not exist."
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

loadChat(chat.id);

showTypingIndicator();

if (sendButton) {
    sendButton.disabled =
        true;

    sendButton.textContent =
        "Sending...";
}

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

    if (!response.ok) {
        console.error(
            "Backend error:",
            response.status,
            data
        );

        const errorMessage =
            data &&
            data.error
                ? data.error
                : "The AI service returned an error.";

        throw new Error(
            "Server returned " +
            response.status +
            ": " +
            errorMessage
        );
    }

    let aiMessage = "";

    if (
        typeof data === "string"
    ) {
        aiMessage = data;

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

    if (
        !aiMessage ||
        typeof aiMessage !==
            "string"
    ) {
        console.error(
            "Unknown backend response:",
            data
        );

        throw new Error(
            "The backend returned an unexpected response."
        );
    }

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
        "AI connection error:",
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

/* ============================================
ENTER KEY
============================================ */

function handleKey(event) {
if (
event.key === "Enter" &&
!event.shiftKey
) {
event.preventDefault();


    sendMessage();
}


}

/* ============================================
TEXTAREA RESIZE
============================================ */

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

/* ============================================
SUGGESTION
============================================ */

function suggest(text) {
if (!messageInput) {
return;
}


messageInput.value =
    text;

resizeTextarea();

messageInput.focus();


}

/* ============================================
CLEAR ALL CHATS
============================================ */

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

hideGraph();

createNewChat();


}

/* ============================================
EVENT LISTENERS
============================================ */

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

if (clearChatsButton) {
    clearChatsButton.addEventListener(
        "click",
        clearAllChats
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

if (graphType) {
    graphType.addEventListener(
        "change",
        changeGraphType
    );
}

if (closeGraphButton) {
    closeGraphButton.addEventListener(
        "click",
        hideGraph
    );
}


}

/* ============================================
GLOBAL FUNCTIONS
============================================ */

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

/* ============================================
INITIALIZE
============================================ */

function initialize() {
checkElements();


setupEvents();

loadSavedChats();


}

/* ============================================
START
============================================ */

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
