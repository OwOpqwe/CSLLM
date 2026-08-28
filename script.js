"use strict";

# /*

# CSLLM FRONTEND

This file is the FRONTEND.

Your backend remains:

/api/chat.js

Do NOT put your API key in this file.

====================================================
*/

// ============================================
// CONFIGURATION
// ============================================

const API_URL = "https://csllm.vercel.app/api/chat";

// ============================================
// STATE
// ============================================

let chats = [];

let currentChatId = null;

let isSending = false;

// ============================================
// DOM ELEMENTS
// ============================================

const messagesContainer =
document.getElementById("messages");

const messageInput =
document.getElementById("messageInput");

const sendButton =
document.getElementById("sendButton");

const newChatButton =
document.getElementById("newChatButton");

const chatList =
document.getElementById("chatList");

const chatTitle =
document.getElementById("chatTitle");

// ============================================
// CHECK DOM
// ============================================

function checkElements() {

```
if (!messagesContainer) {
    console.error(
        'CSLLM ERROR: Could not find element with id="messages".'
    );
}

if (!messageInput) {
    console.error(
        'CSLLM ERROR: Could not find element with id="messageInput".'
    );
}

if (!sendButton) {
    console.error(
        'CSLLM ERROR: Could not find element with id="sendButton".'
    );
}

if (!chatList) {
    console.error(
        'CSLLM ERROR: Could not find element with id="chatList".'
    );
}
```

}

// ============================================
// CREATE CHAT
// ============================================

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
```

}

// ============================================
// DELETE CHAT
// ============================================

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

    currentChatId =
        chats[0].id;

    loadChat(currentChatId);
}

saveChats();

renderChatList();
```

}

// ============================================
// SAVE CHATS
// ============================================

function saveChats() {

```
try {

    localStorage.setItem(
        "csllm_chats",
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

// ============================================
// LOAD SAVED CHATS
// ============================================

function loadSavedChats() {

```
try {

    const saved =
        localStorage.getItem(
            "csllm_chats"
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

loadChat(currentChatId);
```

}

// ============================================
// FIND CURRENT CHAT
// ============================================

function getCurrentChat() {

```
return chats.find(
    chat =>
        chat.id === currentChatId
);
```

}

// ============================================
// RENDER CHAT LIST
// ============================================

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

        chatItem.classList.add(
            "active"
        );
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
        function(event) {

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
        function() {

            currentChatId =
                chat.id;

            renderChatList();

            loadChat(chat.id);
        }
    );


    chatList.appendChild(
        chatItem
    );

});
```

}

// ============================================
// LOAD CHAT
// ============================================

function loadChat(chatId) {

```
const chat =
    chats.find(
        item =>
            item.id === chatId
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
        chat.title || "New Chat";
}


if (!messagesContainer) {

    console.error(
        'Cannot load chat because #messages does not exist.'
    );

    return;
}


messagesContainer.innerHTML = "";


if (
    !chat.messages ||
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
```

}

// ============================================
// WELCOME SCREEN
// ============================================

function showWelcome() {

```
if (!messagesContainer) {
    return;
}


const welcome =
    document.createElement("div");

welcome.className =
    "welcome";


welcome.innerHTML = `
    <h2>Welcome to CSLLM</h2>
    <p>How can I help you?</p>
`;


messagesContainer.appendChild(
    welcome
);
```

}

// ============================================
// ADD MESSAGE TO SCREEN
// ============================================

function addMessageToScreen(
role,
content,
scroll = true
) {

```
if (!messagesContainer) {

    console.error(
        'Cannot display message: #messages does not exist.'
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


bubble.textContent =
    content;


message.appendChild(
    bubble
);


messagesContainer.appendChild(
    message
);


if (scroll) {

    scrollToBottom();
}
```

}

// ============================================
// TYPING INDICATOR
// ============================================

function showTypingIndicator() {

```
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


typing.appendChild(
    bubble
);


messagesContainer.appendChild(
    typing
);


scrollToBottom();
```

}

// ============================================
// REMOVE TYPING INDICATOR
// ============================================

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

// ============================================
// SCROLL TO BOTTOM
// ============================================

function scrollToBottom() {

```
if (!messagesContainer) {
    return;
}


messagesContainer.scrollTop =
    messagesContainer.scrollHeight;
```

}

// ============================================
// UPDATE CHAT TITLE
// ============================================

function updateChatTitle(
chat,
firstMessage
) {

```
if (!chat) {
    return;
}


if (
    !chat.messages ||
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
```

}

// ============================================
// SEND MESSAGE
// ============================================

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


const chat =
    getCurrentChat();


if (!chat) {

    console.error(
        "No current chat."
    );

    return;
}


isSending = true;


messageInput.value = "";

messageInput.style.height =
    "auto";


// Add user message locally

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

    /*
    ----------------------------------------
    SEND REQUEST TO VERCEL
    ----------------------------------------
    */

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


    /*
    ----------------------------------------
    READ RESPONSE
    ----------------------------------------
    */

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


    /*
    ----------------------------------------
    HANDLE BACKEND ERROR
    ----------------------------------------
    */

    if (!response.ok) {

        console.error(
            "Backend error:",
            response.status,
            data
        );


        let errorMessage =
            "The AI service returned an error.";


        if (data.error) {

            errorMessage =
                data.error;
        }


        throw new Error(
            `Server returned ${response.status}: ${errorMessage}`
        );
    }


    /*
    ----------------------------------------
    GET AI RESPONSE
    ----------------------------------------
    */

    let aiMessage =
        "";


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


    if (
        !aiMessage ||
        typeof aiMessage !== "string"
    ) {

        console.error(
            "Unknown backend response:",
            data
        );


        throw new Error(
            "The backend returned an unexpected response."
        );
    }


    /*
    ----------------------------------------
    SAVE AI MESSAGE
    ----------------------------------------
    */

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
        "Sorry, I couldn't connect to the AI. " +
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


    messageInput.focus();
}
```

}

// ============================================
// ENTER KEY
// ============================================

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

// ============================================
// AUTO RESIZE TEXTAREA
// ============================================

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
    ) + "px";
```

}

// ============================================
// SUGGESTION
// ============================================

function suggest(text) {

```
if (!messageInput) {
    return;
}


messageInput.value =
    text;


resizeTextarea();

messageInput.focus();
```

}

// ============================================
// CLEAR ALL CHATS
// ============================================

function clearAllChats() {

```
const confirmed =
    confirm(
        "Delete all chats?"
    );


if (!confirmed) {
    return;
}


localStorage.removeItem(
    "csllm_chats"
);


chats = [];

currentChatId = null;


createNewChat();
```

}

// ============================================
// EVENT LISTENERS
// ============================================

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

// ============================================
// INITIALIZE
// ============================================

function initialize() {

```
checkElements();

setupEvents();

loadSavedChats();
```

}

// ============================================
// START
// ============================================

initialize();
