"use strict";

/*

* CHARLIE'S AI FRONTEND
*
* Backend:
* https://csllm.vercel.app/api/chat
*
* The API key must NEVER be placed in this file.
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

let responseType = null;
let graphType = null;

let activeCharts = [];

/* ==============================
DOM
============================== */

function checkElements() {

```
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

responseType =
    document.getElementById("responseType");

graphType =
    document.getElementById("graphType");

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
    console.error("Charlie's AI: Missing #chatList");
}
```

}

/* ==============================
CREATE CHAT
============================== */

function createNewChat() {

```
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
    messageInput.focus();
}
```

}

/* ==============================
DELETE CHAT
============================== */

function deleteChat(chatId, event) {

```
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
```

}

/* ==============================
STORAGE
============================== */

function saveChats() {

```
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
```

}

function loadSavedChats() {

```
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
```

}

/* ==============================
CURRENT CHAT
============================== */

function getCurrentChat() {

```
return chats.find(
    chat => chat.id === currentChatId
);
```

}

/* ==============================
CHAT LIST
============================== */

function renderChatList() {

```
if (!chatList) {
    return;
}

chatList.innerHTML = "";

chats.forEach(chat => {

    const chatItem =
        document.createElement("div");

    chatItem.className =
        "chat-item";

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

    deleteButton.textContent =
        "×";

    deleteButton.setAttribute(
        "aria-label",
        "Delete chat"
    );


    deleteButton.addEventListener(
        "click",
        event => {
            deleteChat(
                chat.id,
                event
            );
        }
    );


    chatItem.appendChild(title);

    chatItem.appendChild(
        deleteButton
    );


    chatItem.addEventListener(
        "click",
        () => {

            currentChatId =
                chat.id;

            renderChatList();

            loadChat(chat.id);

        }
    );


    chatList.appendChild(chatItem);

});
```

}

/* ==============================
LOAD CHAT
============================== */

function loadChat(chatId) {

```
const chat =
    chats.find(
        item => item.id === chatId
    );

if (!chat) {
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

activeCharts.forEach(
    chart => {
        try {
            chart.destroy();
        } catch {}
    }
);

activeCharts = [];

messagesContainer.innerHTML = "";

if (
    !Array.isArray(chat.messages) ||
    chat.messages.length === 0
) {

    showWelcome();

    return;

}


chat.messages.forEach(
    message => {

        if (message.role === "graph") {

            addGraphToScreen(
                message.graph,
                false
            );

        } else {

            addMessageToScreen(
                message.role,
                message.content,
                false
            );

        }

    }
);

scrollToBottom();
```

}

/* ==============================
WELCOME
============================== */

function showWelcome() {

```
if (!messagesContainer) {
    return;
}

const welcome =
    document.createElement("div");

welcome.className =
    "welcome";

const heading =
    document.createElement("h2");

heading.textContent =
    "Welcome to Charlie's AI";


const paragraph =
    document.createElement("p");

paragraph.textContent =
    "Ask me anything, or ask me to create a graph.";


welcome.appendChild(heading);

welcome.appendChild(paragraph);

messagesContainer.appendChild(welcome);
```

}

/* ==============================
ADD MESSAGE
============================== */

function addMessageToScreen(
role,
content,
scroll = true
) {

```
if (!messagesContainer) {
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

bubble.textContent =
    content;


message.appendChild(bubble);

messagesContainer.appendChild(message);


if (scroll) {
    scrollToBottom();
}
```

}

/* ==============================
GRAPH
============================== */

function addGraphToScreen(
graph,
scroll = true
) {

```
if (
    !messagesContainer ||
    !graph
) {
    return;
}

const wrapper =
    document.createElement("div");

wrapper.className =
    "graph-message";


const container =
    document.createElement("div");

container.className =
    "graph-container";


const canvas =
    document.createElement("canvas");


container.appendChild(canvas);

wrapper.appendChild(container);

messagesContainer.appendChild(wrapper);


const type =
    ["bar", "line", "pie", "scatter"]
        .includes(graph.type)
        ? graph.type
        : "bar";


const labels =
    Array.isArray(graph.labels)
        ? graph.labels
        : [];


const values =
    Array.isArray(graph.values)
        ? graph.values
        : [];


let chartData;


if (type === "scatter") {

    chartData = {
        datasets: [
            {
                label:
                    graph.label ||
                    "Data",
                data:
                    values,
                parsing: false
            }
        ]
    };

} else {

    chartData = {

        labels: labels,

        datasets: [
            {
                label:
                    graph.label ||
                    "Data",

                data:
                    values,

                borderWidth: 2,

                tension: 0.25
            }
        ]

    };

}


const chart =
    new Chart(
        canvas.getContext("2d"),
        {
            type: type,

            data: chartData,

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    title: {

                        display:
                            Boolean(
                                graph.title
                            ),

                        text:
                            graph.title ||
                            "Graph"

                    },

                    legend: {

                        display:
                            type !== "bar" &&
                            type !== "line"

                    }

                }

            }
        }
    );


canvas.parentElement.style.height =
    "420px";


activeCharts.push(chart);


if (scroll) {
    scrollToBottom();
}
```

}

/* ==============================
TYPING
============================== */

function showTypingIndicator() {

```
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

messagesContainer.appendChild(typing);

scrollToBottom();
```

}

function removeTypingIndicator() {

```
const typing =
    document.getElementById(
        "typingIndicator"
    );

if (typing) {
    typing.remove();
}
```

}

/* ==============================
SCROLL
============================== */

function scrollToBottom() {

```
if (!messagesContainer) {
    return;
}

messagesContainer.scrollTop =
    messagesContainer.scrollHeight;
```

}

/* ==============================
TITLE
============================== */

function updateChatTitle(
chat,
firstMessage
) {

```
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
            ) +
            "...";

    }

    chat.title =
        title || "New Chat";

}
```

}

/* ==============================
SEND
============================== */

async function sendMessage() {

```
if (isSending) {
    return;
}

if (!messageInput) {
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


const selectedResponseType =
    responseType
        ? responseType.value
        : "normal";


const selectedGraphType =
    graphType
        ? graphType.value
        : "auto";


messageInput.value = "";

resizeTextarea();


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

    const response =
        await fetch(
            API_URL,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify({
                        messages:
                            chat.messages,

                        responseType:
                            selectedResponseType,

                        graphType:
                            selectedGraphType
                    })
            }
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

        throw new Error(
            data?.error ||
            "The AI service returned an error."
        );

    }


    removeTypingIndicator();


    const aiMessage =
        typeof data.reply === "string"
            ? data.reply
            : "I received an empty response.";


    chat.messages.push({
        role: "assistant",
        content: aiMessage
    });


    addMessageToScreen(
        "assistant",
        aiMessage
    );


    if (
        data.graph &&
        typeof data.graph === "object"
    ) {

        chat.messages.push({
            role: "graph",
            graph: data.graph
        });


        addGraphToScreen(
            data.graph
        );

    }


    saveChats();

    renderChatList();


} catch (error) {

    console.error(
        "Charlie's AI error:",
        error
    );


    removeTypingIndicator();


    addMessageToScreen(
        "assistant",
        "Sorry, I couldn't connect to Charlie's AI.\n\n" +
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
```

}

/* ==============================
ENTER
============================== */

function handleKey(event) {

```
if (
    event.key === "Enter" &&
    !event.shiftKey
) {

    event.preventDefault();

    sendMessage();

}
```

}

/* ==============================
RESIZE
============================== */

function resizeTextarea() {

```
if (!messageInput) {
    return;
}

messageInput.style.height =
    "auto";

messageInput.style.height =
    Math.min(
        messageInput.scrollHeight,
        200
    ) +
    "px";
```

}

/* ==============================
CLEAR
============================== */

function clearAllChats() {

```
if (
    !confirm(
        "Delete all chats?"
    )
) {
    return;
}

localStorage.removeItem(
    "charlies_ai_chats"
);

chats = [];

currentChatId = null;

createNewChat();
```

}

/* ==============================
EVENTS
============================== */

function setupEvents() {

```
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
```

}

/* ==============================
GLOBALS
============================== */

window.sendMessage =
sendMessage;

window.handleKey =
handleKey;

window.createNewChat =
createNewChat;

window.deleteChat =
deleteChat;

window.clearAllChats =
clearAllChats;

/* ==============================
INITIALIZE
============================== */

function initialize() {

```
checkElements();

setupEvents();

loadSavedChats();
```

}

if (
document.readyState ===
"loading"
) {

```
document.addEventListener(
    "DOMContentLoaded",
    initialize
);
```

} else {

```
initialize();
```

}
