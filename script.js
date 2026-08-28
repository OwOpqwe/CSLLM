"use strict";

const API_URL =
"https://csllm.vercel.app/api/chat";

const STORAGE_KEY =
"charlies_ai_chats";

let chats = [];
let currentChatId = null;
let isSending = false;

let messagesContainer = null;
let messageInput = null;
let sendButton = null;
let newChatButton = null;
let chatList = null;
let chatTitle = null;

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


if (!messagesContainer) {

    console.error(
        "Charlie's AI: Missing #messages"
    );
}


if (!messageInput) {

    console.error(
        "Charlie's AI: Missing #messageInput"
    );
}


if (!sendButton) {

    console.error(
        "Charlie's AI: Missing #sendButton"
    );
}


if (!chatList) {

    console.error(
        "Charlie's AI: Missing #chatList"
    );
}


}

function createNewChat() {


const chat = {

    id:
        Date.now().toString(),

    title:
        "New Chat",

    messages:
        []
};


chats.unshift(chat);

currentChatId =
    chat.id;


saveChats();

renderChatList();

loadChat(chat.id);


if (messageInput) {

    messageInput.value = "";

    messageInput.focus();
}


}

function deleteChat(
chatId,
event
) {


if (event) {

    event.stopPropagation();
}


chats =
    chats.filter(
        chat =>
            chat.id !== chatId
    );


if (chats.length === 0) {

    createNewChat();

    return;
}


if (
    currentChatId ===
    chatId
) {

    currentChatId =
        chats[0].id;

    loadChat(
        currentChatId
    );
}


saveChats();

renderChatList();


}

function saveChats() {


try {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(chats)
    );

} catch (error) {

    console.error(
        "Could not save chats:",
        error
    );
}


}

function loadSavedChats() {


try {

    const saved =
        localStorage.getItem(
            STORAGE_KEY
        );


    if (saved) {

        chats =
            JSON.parse(saved);
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


currentChatId =
    chats[0].id;


renderChatList();

loadChat(
    currentChatId
);


}

function getCurrentChat() {


return chats.find(
    chat =>
        chat.id ===
        currentChatId
);


}

function renderChatList() {


if (!chatList) {

    return;
}


chatList.innerHTML = "";


chats.forEach(chat => {

    const chatItem =
        document.createElement(
            "div"
        );


    chatItem.className =
        "chat-item";


    if (
        chat.id ===
        currentChatId
    ) {

        chatItem.classList.add(
            "active"
        );
    }


    const title =
        document.createElement(
            "span"
        );


    title.className =
        "chat-item-title";


    title.textContent =
        chat.title ||
        "New Chat";


    const deleteButton =
        document.createElement(
            "button"
        );


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


    chatItem.appendChild(
        title
    );

    chatItem.appendChild(
        deleteButton
    );


    chatItem.addEventListener(
        "click",
        () => {

            currentChatId =
                chat.id;

            renderChatList();

            loadChat(
                chat.id
            );
        }
    );


    chatList.appendChild(
        chatItem
    );

});


}

function loadChat(chatId) {


const chat =
    chats.find(
        item =>
            item.id ===
            chatId
    );


if (!chat) {

    console.error(
        "Chat not found:",
        chatId
    );

    return;
}


currentChatId =
    chatId;


if (chatTitle) {

    chatTitle.textContent =
        chat.title ||
        "New Chat";
}


if (!messagesContainer) {

    return;
}


messagesContainer.innerHTML =
    "";


if (
    !Array.isArray(
        chat.messages
    ) ||
    chat.messages.length === 0
) {

    showWelcome();

    return;
}


chat.messages.forEach(
    message => {

        addMessageToScreen(
            message.role,
            message.content,
            false
        );
    }
);


scrollToBottom();


}

function showWelcome() {


if (!messagesContainer) {

    return;
}


const welcome =
    document.createElement(
        "div"
    );


welcome.className =
    "welcome";


const heading =
    document.createElement(
        "h2"
    );


heading.textContent =
    "Welcome to Charlie's AI";


const paragraph =
    document.createElement(
        "p"
    );


paragraph.textContent =
    "Ask me anything, or ask me to create a graph.";


welcome.appendChild(
    heading
);


welcome.appendChild(
    paragraph
);


messagesContainer.appendChild(
    welcome
);


}

function addMessageToScreen(
role,
content,
scroll = true
) {


if (!messagesContainer) {

    return;
}


const message =
    document.createElement(
        "div"
    );


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
    document.createElement(
        "div"
    );


bubble.className =
    "message-bubble";


if (role === "assistant") {

    renderAssistantMessage(
        bubble,
        content
    );

} else {

    bubble.textContent =
        content;
}


message.appendChild(
    bubble
);


messagesContainer.appendChild(
    message
);


if (scroll) {

    scrollToBottom();
}


}

function renderAssistantMessage(
container,
content
) {


const graph =
    extractGraph(content);


const text =
    graph
        ? removeGraphBlock(
            content
        )
        : content;


if (text.trim()) {

    const textElement =
        document.createElement(
            "div"
        );


    textElement.className =
        "assistant-text";


    textElement.textContent =
        text.trim();


    container.appendChild(
        textElement
    );
}


if (graph) {

    createGraph(
        container,
        graph
    );
}


}

function extractGraph(content) {


const start =
    content.indexOf(
        "GRAPH_START"
    );


const end =
    content.indexOf(
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
    content
        .substring(
            start +
            "GRAPH_START".length,
            end
        )
        .trim();


try {

    const graph =
        JSON.parse(
            jsonText
        );


    if (
        !graph ||
        !Array.isArray(
            graph.labels
        ) ||
        !Array.isArray(
            graph.values
        )
    ) {

        return null;
    }


    return graph;

} catch (error) {

    console.error(
        "Could not parse graph data:",
        error
    );

    return null;
}


}

function removeGraphBlock(
content
) {


return content.replace(
    /GRAPH_START[\s\S]*?GRAPH_END/g,
    ""
).trim();


}

function createGraph(
container,
graph
) {


if (
    typeof Chart ===
    "undefined"
) {

    const error =
        document.createElement(
            "p"
        );


    error.textContent =
        "Graphing library could not be loaded.";


    container.appendChild(
        error
    );


    return;
}


const graphWrapper =
    document.createElement(
        "div"
    );


graphWrapper.className =
    "graph-container";


const canvas =
    document.createElement(
        "canvas"
    );


graphWrapper.appendChild(
    canvas
);


container.appendChild(
    graphWrapper
);


let chartType =
    graph.type || "line";


if (
    chartType !== "line" &&
    chartType !== "bar" &&
    chartType !== "scatter"
) {

    chartType =
        "line";
}


let labels =
    graph.labels;


let values =
    graph.values;


let datasets;


if (
    chartType ===
    "scatter"
) {

    datasets = [

        {

            label:
                graph.yLabel ||
                "Value",

            data:
                labels.map(
                    (x, index) => ({

                        x:
                            Number(x),

                        y:
                            Number(
                                values[index]
                            )

                    })
                ),

            borderWidth:
                2,

            showLine:
                true

        }

    ];

} else {

    datasets = [

        {

            label:
                graph.yLabel ||
                "Value",

            data:
                values,

            borderWidth:
                2,

            tension:
                0.3,

            fill:
                false

        }

    ];
}


const config = {

    type:
        chartType,

    data: {

        labels:
            chartType ===
            "scatter"
                ? undefined
                : labels,

        datasets:
            datasets

    },

    options: {

        responsive:
            true,

        maintainAspectRatio:
            false,

        plugins: {

            title: {

                display:
                    Boolean(
                        graph.title
                    ),

                text:
                    graph.title ||
                    "Graph"

            }

        },

        scales: {

            x: {

                title: {

                    display:
                        Boolean(
                            graph.xLabel
                        ),

                    text:
                        graph.xLabel ||
                        "X"

                }

            },

            y: {

                title: {

                    display:
                        Boolean(
                            graph.yLabel
                        ),

                    text:
                        graph.yLabel ||
                        "Y"

                }

            }

        }

    }

};


new Chart(
    canvas,
    config
);


}

function showTypingIndicator() {


if (!messagesContainer) {

    return;
}


removeTypingIndicator();


const typing =
    document.createElement(
        "div"
    );


typing.id =
    "typingIndicator";


typing.className =
    "message assistant-message";


const bubble =
    document.createElement(
        "div"
    );


bubble.className =
    "message-bubble";


bubble.textContent =
    "Thinking...";


typing.appendChild(
    bubble
);


messagesContainer.appendChild(
    typing
);


scrollToBottom();


}

function removeTypingIndicator() {


const typing =
    document.getElementById(
        "typingIndicator"
    );


if (typing) {

    typing.remove();
}


}

function scrollToBottom() {


if (!messagesContainer) {

    return;
}


messagesContainer.scrollTop =
    messagesContainer.scrollHeight;


}

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
    chat.title ===
        "New Chat"
) {

    let title =
        firstMessage.trim();


    if (
        title.length > 30
    ) {

        title =
            title.substring(
                0,
                30
            ) + "...";
    }


    chat.title =
        title ||
        "New Chat";
}


}

async function sendMessage() {


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


messageInput.value =
    "";


messageInput.style.height =
    "auto";


chat.messages.push({

    role:
        "user",

    content:
        text

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

                method:
                    "POST",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body:
                    JSON.stringify({

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
                responseText ||
                "Invalid server response."

        };
    }


    if (!response.ok) {

        throw new Error(

            data?.error ||
            "The AI service returned an error."

        );
    }


    const aiMessage =
        typeof data?.reply ===
        "string"
            ? data.reply
            : "";


    if (
        !aiMessage.trim()
    ) {

        throw new Error(
            "The AI returned an empty response."
        );
    }


    chat.messages.push({

        role:
            "assistant",

        content:
            aiMessage

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

    isSending =
        false;


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

function handleKey(event) {


if (
    event.key ===
        "Enter" &&
    !event.shiftKey
) {

    event.preventDefault();

    sendMessage();
}


}

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

function suggest(text) {


if (!messageInput) {

    return;
}


messageInput.value =
    text;


resizeTextarea();

messageInput.focus();


}

function clearAllChats() {


const confirmed =
    confirm(
        "Delete all chats?"
    );


if (!confirmed) {

    return;
}


localStorage.removeItem(
    STORAGE_KEY
);


chats = [];

currentChatId =
    null;


createNewChat();


}

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

function initialize() {


checkElements();

setupEvents();

loadSavedChats();


}

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
