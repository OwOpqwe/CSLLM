"use strict";

/*

* CSLLM FRONTEND
*
* Your backend remains:
* https://csllm.vercel.app/api/chat
*
* Do NOT put your API key in this file.
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

```
if (!messagesContainer) {
    console.error('CSLLM: Missing #messages');
}

if (!messageInput) {
    console.error('CSLLM: Missing #messageInput');
}

if (!sendButton) {
    console.error('CSLLM: Missing #sendButton');
}

if (!chatList) {
    console.warn('CSLLM: Missing #chatList');
}
```

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

```
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

// ============================================
// DELETE CHAT
// ============================================

function deleteChat(chatId, event) {
if (event) {
event.stopPropagation();
}

```
chats = chats.filter(chat => chat.id !== chatId);

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

// ============================================
// SAVE CHATS
// ============================================

function saveChats() {
try {
localStorage.setItem(
"csllm_chats",
JSON.stringify(chats)
);
} catch (error) {
console.error("Could not save chats:", error);
}
}

// ============================================
// LOAD SAVED CHATS
// ============================================

function loadSavedChats() {
try {
const saved = localStorage.getItem("csllm_chats");

```
    if (saved) {
        chats = JSON.parse(saved);
    }
} catch (error) {
    console.error("Could not load chats:", error);
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

```
chatList.innerHTML = "";

chats.forEach(chat => {
    const chatItem = document.createElement("div");

    chatItem.className = "chat-item";

    if (chat.id === currentChatId) {
        chatItem.classList.add("active");
    }

    const title = document.createElement("span");

    title.className = "chat-item-title";

    title.textContent =
        chat.title || "New Chat";


    const deleteButton =
        document.createElement("button");

    deleteButton.className = "delete-chat";

    deleteButton.textContent = "×";

    deleteButton.setAttribute(
        "aria-label",
        "Delete chat"
    );


    deleteButton.addEventListener(
        "click",
        function(event) {
            deleteChat(chat.id, event);
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
```

}

// ============================================
// LOAD CHAT
// ============================================

function loadChat(chatId) {
const chat = chats.find(
item => item.id === chatId
);

```
if (!chat) {
    console.error("Chat not found:", chatId);
    return;
}

currentChatId = chatId;

if (chatTitle) {
    chatTitle.textContent =
        chat.title || "New Chat";
}

if (!messagesContainer) {
    console.error(
        "Cannot load chat: #messages does not exist."
    );
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
```

}

// ============================================
// WELCOME SCREEN
// ============================================

function showWelcome() {
if (!messagesContainer) {
return;
}

```
const welcome =
    document.createElement("div");

welcome.className = "welcome";

const heading =
    document.createElement("h2");

heading.textContent =
    "Welcome to CSLLM";


const paragraph =
    document.createElement("p");

paragraph.textContent =
    "How can I help you?";


welcome.appendChild(heading);
welcome.appendChild(paragraph);

messagesContainer.appendChild(welcome);
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
if (!messagesContainer) {
console.error(
"Cannot display message: #messages does not exist."
);
return;
}

```
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

bubble.textContent =
    content;


message.appendChild(bubble);

messagesContainer.appendChild(message);


if (scroll) {
    scrollToBottom();
}
```

}

// ============================================
// TYPING INDICATOR
// ============================================

function showTypingIndicator() {
if (!messagesContainer) {
return;
}

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

// ============================================
// REMOVE TYPING INDICATOR
// ============================================

function removeTypingIndicator() {
const typing =
document.getElementById(
"typingIndicator"
);

```
if (typing) {
    typing.remove();
}
```

}

// ============================================
// SCROLL TO BOTTOM
// ============================================

function scrollToBottom() {
if (!messagesContainer) {
return;
}

```
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
if (!chat) {
return;
}

```
if (
    !Array.isArray(chat.messages) ||
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
            title.substring(0, 30) +
            "...";
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
if (isSending) {
return;
}

```
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


// Add user message
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
    sendButton.disabled = true;
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
    } catch (parseError) {
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


    // ====================================
    // SAVE AI MESSAGE
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
        sendButton.disabled = false;

        sendButton.textContent =
            "Send";
    }


    if (messageInput) {
        messageInput.focus();
    }
}
```

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

```
    sendMessage();
}
```

}

// ============================================
// AUTO RESIZE TEXTAREA
// ============================================

function resizeTextarea() {
if (!messageInput) {
return;
}

```
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
// SUGGESTION BUTTON
// ============================================

function suggest(text) {
if (!messageInput) {
return;
}

```
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
const confirmed =
confirm(
"Delete all chats?"
);

```
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
if (sendButton) {
sendButton.addEventListener(
"click",
sendMessage
);
}

```
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

```
setupEvents();

loadSavedChats();
```

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
