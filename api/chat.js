// ============================================
// CSLLM CHAT SYSTEM
// ============================================```javascript
// ============================================================
// CSLLM CHAT.JS
// ============================================================
// Frontend chat system
//
// IMPORTANT:
// Your API key should NOT be inside this file.
// The API key belongs in your Vercel backend.
//
// Expected backend:
// https://csllm.vercel.app/api/chat
// ============================================================


// ============================================================
// CONFIGURATION
// ============================================================

const API_URL =
    "https://csllm.vercel.app/api/chat";

const STORAGE_KEY =
    "csllm_chats";

const CURRENT_CHAT_KEY =
    "csllm_current_chat";


// ============================================================
// STATE
// ============================================================

let chats = {};

let currentChatId = null;

let isSending = false;


// ============================================================
// CREATE UNIQUE CHAT ID
// ============================================================

function createChatId() {

    return (
        "chat_" +
        Date.now() +
        "_" +
        Math.random()
            .toString(36)
            .substring(2, 9)
    );
}


// ============================================================
// LOAD CHATS FROM LOCAL STORAGE
// ============================================================

function loadChats() {

    try {

        const saved =
            localStorage.getItem(
                STORAGE_KEY
            );

        if (saved) {

            chats =
                JSON.parse(saved);

        } else {

            chats = {};

        }

    } catch (error) {

        console.error(
            "Could not load chats:",
            error
        );

        chats = {};

    }
}


// ============================================================
// SAVE CHATS
// ============================================================

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


// ============================================================
// SAVE CURRENT CHAT ID
// ============================================================

function saveCurrentChatId() {

    if (currentChatId) {

        localStorage.setItem(
            CURRENT_CHAT_KEY,
            currentChatId
        );

    }

}


// ============================================================
// GET CURRENT CHAT ID
// ============================================================

function getSavedChatId() {

    return localStorage.getItem(
        CURRENT_CHAT_KEY
    );

}


// ============================================================
// CREATE NEW CHAT
// ============================================================

function createNewChat() {

    const id =
        createChatId();

    chats[id] = {

        id: id,

        title: "New Chat",

        messages: [],

        createdAt:
            Date.now(),

        updatedAt:
            Date.now()

    };

    currentChatId = id;

    saveChats();

    saveCurrentChatId();

    renderChatList();

    loadChat(id);

}


// ============================================================
// NEW CHAT BUTTON
// ============================================================

function newChat() {

    createNewChat();

}


// ============================================================
// GET CURRENT CHAT
// ============================================================

function getCurrentChat() {

    if (
        !currentChatId ||
        !chats[currentChatId]
    ) {

        return null;

    }

    return chats[currentChatId];

}


// ============================================================
// DELETE CHAT
// ============================================================

function deleteChat(id) {

    if (!chats[id]) {

        return;

    }

    const confirmed =
        confirm(
            "Delete this chat?"
        );

    if (!confirmed) {

        return;

    }

    delete chats[id];

    saveChats();

    if (
        currentChatId === id
    ) {

        const remaining =
            Object.keys(chats);

        if (
            remaining.length > 0
        ) {

            remaining.sort(
                (a, b) =>
                    chats[b].updatedAt -
                    chats[a].updatedAt
            );

            currentChatId =
                remaining[0];

            saveCurrentChatId();

            loadChat(
                currentChatId
            );

        } else {

            createNewChat();

        }

    }

    renderChatList();

}


// ============================================================
// RENAME CHAT
// ============================================================

function renameChat(id) {

    if (!chats[id]) {

        return;

    }

    const newName =
        prompt(
            "Enter a new chat name:",
            chats[id].title
        );

    if (
        newName === null
    ) {

        return;

    }

    const cleaned =
        newName.trim();

    if (!cleaned) {

        return;

    }

    chats[id].title =
        cleaned;

    chats[id].updatedAt =
        Date.now();

    saveChats();

    renderChatList();

}


// ============================================================
// RENDER CHAT LIST
// ============================================================

function renderChatList() {

    const list =
        document.getElementById(
            "chat-list"
        );

    if (!list) {

        console.error(
            "CSLLM Error: #chat-list was not found."
        );

        return;

    }

    list.innerHTML = "";

    const chatIds =
        Object.keys(chats);

    chatIds.sort(
        (a, b) =>
            chats[b].updatedAt -
            chats[a].updatedAt
    );


    chatIds.forEach(
        function(id) {

            const chat =
                chats[id];

            const wrapper =
                document.createElement(
                    "div"
                );

            wrapper.style.display =
                "flex";

            wrapper.style.alignItems =
                "center";

            wrapper.style.marginBottom =
                "5px";


            const button =
                document.createElement(
                    "button"
                );

            button.className =
                "chat-list-item";


            if (
                id === currentChatId
            ) {

                button.classList.add(
                    "active"
                );

            }


            button.textContent =
                chat.title ||
                "New Chat";


            button.style.flex =
                "1";


            button.onclick =
                function() {

                    loadChat(id);

                };


            const menu =
                document.createElement(
                    "button"
                );

            menu.textContent =
                "⋯";

            menu.style.background =
                "transparent";

            menu.style.color =
                "#aaa";

            menu.style.border =
                "none";

            menu.style.cursor =
                "pointer";

            menu.style.fontSize =
                "20px";

            menu.title =
                "Chat options";


            menu.onclick =
                function(event) {

                    event.stopPropagation();

                    showChatMenu(id);

                };


            wrapper.appendChild(
                button
            );

            wrapper.appendChild(
                menu
            );

            list.appendChild(
                wrapper
            );

        }
    );

}


// ============================================================
// CHAT MENU
// ============================================================

function showChatMenu(id) {

    if (!chats[id]) {

        return;

    }

    const action =
        prompt(
            "Type:\nrename - Rename chat\ndelete - Delete chat",
            ""
        );

    if (!action) {

        return;

    }

    const command =
        action
            .trim()
            .toLowerCase();


    if (
        command ===
        "delete"
    ) {

        deleteChat(id);

    } else if (
        command ===
        "rename"
    ) {

        renameChat(id);

    }

}


// ============================================================
// LOAD CHAT
// ============================================================

function loadChat(id) {

    if (!chats[id]) {

        console.error(
            "Chat does not exist:",
            id
        );

        return;

    }

    currentChatId =
        id;

    saveCurrentChatId();

    renderChatList();


    const container =
        document.getElementById(
            "messages"
        );


    // IMPORTANT:
    // Prevent the null.innerHTML error
    // you were getting.

    if (!container) {

        console.error(
            "CSLLM Error: #messages was not found in index.html."
        );

        return;

    }


    container.innerHTML =
        "";


    const chat =
        chats[id];


    if (
        !chat.messages ||
        chat.messages.length === 0
    ) {

        showWelcomeScreen();

        return;

    }


    chat.messages.forEach(
        function(message) {

            addMessageToScreen(
                message.role,
                message.content
            );

        }
    );


    scrollToBottom();

}


// ============================================================
// WELCOME SCREEN
// ============================================================

function showWelcomeScreen() {

    const container =
        document.getElementById(
            "messages"
        );

    if (!container) {

        return;

    }


    const welcome =
        document.createElement(
            "div"
        );

    welcome.className =
        "empty-chat";


    welcome.innerHTML = `
        <div>
            <h1>CSLLM</h1>
            <p>How can I help you today?</p>
        </div>
    `;


    container.appendChild(
        welcome
    );

}


// ============================================================
// ADD MESSAGE TO SCREEN
// ============================================================

function addMessageToScreen(
    role,
    content
) {

    const container =
        document.getElementById(
            "messages"
        );


    if (!container) {

        console.error(
            "CSLLM Error: #messages was not found."
        );

        return;

    }


    const message =
        document.createElement(
            "div"
        );


    if (
        role === "user"
    ) {

        message.className =
            "message user-message";

    } else {

        message.className =
            "message ai-message";

    }


    const messageContent =
        document.createElement(
            "div"
        );


    messageContent.className =
        "message-content";


    // Use textContent rather than
    // innerHTML for AI/user text.
    //
    // This prevents arbitrary HTML
    // from being injected into the page.

    messageContent.textContent =
        content;


    message.appendChild(
        messageContent
    );


    container.appendChild(
        message
    );


    scrollToBottom();

}


// ============================================================
// SCROLL TO BOTTOM
// ============================================================

function scrollToBottom() {

    const container =
        document.getElementById(
            "messages"
        );


    if (!container) {

        return;

    }


    container.scrollTop =
        container.scrollHeight;

}


// ============================================================
// ADD MESSAGE TO CURRENT CHAT
// ============================================================

function addMessageToChat(
    role,
    content
) {

    const chat =
        getCurrentChat();


    if (!chat) {

        console.error(
            "No current chat."
        );

        return;

    }


    chat.messages.push({

        role:
            role,

        content:
            content,

        timestamp:
            Date.now()

    });


    chat.updatedAt =
        Date.now();


    // Automatically name the chat
    // after the first user message.

    if (
        role === "user" &&
        chat.title ===
            "New Chat"
    ) {

        chat.title =
            createChatTitle(
                content
            );

    }


    saveChats();

    renderChatList();

}


// ============================================================
// CREATE CHAT TITLE
// ============================================================

function createChatTitle(
    text
) {

    let title =
        text
            .replace(
                /\s+/g,
                " "
            )
            .trim();


    if (
        title.length >
        35
    ) {

        title =
            title.substring(
                0,
                35
            ) + "...";

    }


    return (
        title ||
        "New Chat"
    );

}


// ============================================================
// CREATE NEW CHAT IF NEEDED
// ============================================================

function ensureCurrentChat() {

    if (
        !currentChatId ||
        !chats[currentChatId]
    ) {

        createNewChat();

    }

}


// ============================================================
// GET MESSAGE INPUT
// ============================================================

function getInput() {

    return document.getElementById(
        "message-input"
    );

}


// ============================================================
// SET INPUT
// ============================================================

function setInput(value) {

    const input =
        getInput();

    if (!input) {

        return;

    }

    input.value =
        value;

    input.focus();

    resizeInput();

}


// ============================================================
// RESIZE TEXTAREA
// ============================================================

function resizeInput() {

    const input =
        getInput();

    if (!input) {

        return;

    }


    input.style.height =
        "auto";


    input.style.height =
        Math.min(
            input.scrollHeight,
            180
        ) + "px";

}


// ============================================================
// SET BUTTON STATE
// ============================================================

function setSendingState(
    sending
) {

    isSending =
        sending;


    const button =
        document.getElementById(
            "send-button"
        );


    if (!button) {

        return;

    }


    button.disabled =
        sending;


    button.textContent =
        sending
            ? "..."
            : "Send";

}


// ============================================================
// SHOW LOADING MESSAGE
// ============================================================

function showLoadingMessage() {

    const container =
        document.getElementById(
            "messages"
        );


    if (!container) {

        return null;

    }


    const message =
        document.createElement(
            "div"
        );


    message.className =
        "message ai-message";


    const content =
        document.createElement(
            "div"
        );


    content.className =
        "message-content";


    content.textContent =
        "Thinking...";


    message.appendChild(
        content
    );


    container.appendChild(
        message
    );


    scrollToBottom();


    return message;

}


// ============================================================
// REMOVE LOADING MESSAGE
// ============================================================

function removeLoadingMessage(
    element
) {

    if (
        element &&
        element.parentNode
    ) {

        element.parentNode.removeChild(
            element
        );

    }

}


// ============================================================
// SEND MESSAGE
// ============================================================

async function sendMessage(
    text = null
) {

    if (isSending) {

        return;

    }


    ensureCurrentChat();


    const input =
        getInput();


    let messageText;


    if (
        text !== null
    ) {

        messageText =
            text;

    } else {

        if (!input) {

            console.error(
                "CSLLM Error: #message-input not found."
            );

            return;

        }

        messageText =
            input.value;

    }


    messageText =
        messageText.trim();


    if (!messageText) {

        return;

    }


    // Add user message.

    addMessageToChat(
        "user",
        messageText
    );


    addMessageToScreen(
        "user",
        messageText
    );


    if (input) {

        input.value =
            "";

        resizeInput();

    }


    const loading =
        showLoadingMessage();


    setSendingState(
        true
    );


    try {

        const chat =
            getCurrentChat();


        // Send the entire conversation
        // to the backend so the AI can
        // remember previous messages
        // within this chat.

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


        const rawText =
            await response.text();


        let data;


        try {

            data =
                JSON.parse(
                    rawText
                );

        } catch {

            data = {

                error:
                    rawText

            };

        }


        if (
            !response.ok
        ) {

            console.error(
                "Backend error:",
                response.status,
                rawText
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
                `Server returned ${response.status}: ${errorMessage}`
            );

        }


        // Try several common response formats.

        const aiText =
            extractAIResponse(
                data
            );


        if (!aiText) {

            console.error(
                "Unexpected backend response:",
                data
            );

            throw new Error(
                "The AI returned an empty response."
            );

        }


        removeLoadingMessage(
            loading
        );


        addMessageToChat(
            "assistant",
            aiText
        );


        addMessageToScreen(
            "assistant",
            aiText
        );


    } catch (error) {

        console.error(
            "AI connection error:",
            error
        );


        removeLoadingMessage(
            loading
        );


        const errorText =
            error.message ||
            "Something went wrong.";


        addMessageToScreen(
            "assistant",
            "Sorry, I couldn't connect to the AI.\n\n" +
            errorText
        );

    } finally {

        setSendingState(
            false
        );

        if (input) {

            input.focus();

        }

    }

}


// ============================================================
// EXTRACT AI RESPONSE
// ============================================================

function extractAIResponse(
    data
) {

    if (!data) {

        return null;

    }


    // Common format:
    //
    // { reply: "Hello!" }

    if (
        typeof data.reply ===
        "string"
    ) {

        return data.reply;

    }


    // Another common format:
    //
    // { response: "Hello!" }

    if (
        typeof data.response ===
        "string"
    ) {

        return data.response;

    }


    // Another format:
    //
    // { message: "Hello!" }

    if (
        typeof data.message ===
        "string"
    ) {

        return data.message;

    }


    // OpenAI-style response:
    //
    // choices[0].message.content

    if (
        data.choices &&
        data.choices.length > 0 &&
        data.choices[0].message &&
        typeof
            data.choices[0].message.content ===
            "string"
    ) {

        return data
            .choices[0]
            .message
            .content;

    }


    // OpenAI-style text response.

    if (
        data.choices &&
        data.choices.length > 0 &&
        typeof
            data.choices[0].text ===
            "string"
    ) {

        return data
            .choices[0]
            .text;

    }


    return null;

}


// ============================================================
// SUGGESTION BUTTONS
// ============================================================

function suggest(
    text
) {

    setInput(
        text
    );

    sendMessage(
        text
    );

}


// ============================================================
// KEYBOARD HANDLING
// ============================================================

function handleKey(
    event
) {

    if (
        event.key ===
        "Enter" &&
        !event.shiftKey
    ) {

        event.preventDefault();

        sendMessage();

    }

}


// ============================================================
// CLEAR ALL CHATS
// ============================================================

function clearAllChats() {

    const confirmed =
        confirm(
            "Delete ALL chats? This cannot be undone."
        );


    if (!confirmed) {

        return;

    }


    chats = {};

    currentChatId =
        null;


    localStorage.removeItem(
        STORAGE_KEY
    );

    localStorage.removeItem(
        CURRENT_CHAT_KEY
    );


    createNewChat();

}


// ============================================================
// EXPORT CURRENT CHAT
// ============================================================

function exportCurrentChat() {

    const chat =
        getCurrentChat();


    if (!chat) {

        return;

    }


    let text =
        `CSLLM - ${chat.title}\n\n`;


    chat.messages.forEach(
        function(message) {

            const name =
                message.role ===
                "user"
                    ? "You"
                    : "CSLLM";


            text +=
                `${name}:\n${message.content}\n\n`;

        }
    );


    const blob =
        new Blob(
            [text],
            {
                type:
                    "text/plain"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;

    link.download =
        `${chat.title || "chat"}.txt`;


    link.click();


    URL.revokeObjectURL(
        url
    );

}


// ============================================================
// AUTO RESIZE INPUT
// ============================================================

function setupInput() {

    const input =
        getInput();


    if (!input) {

        console.warn(
            "CSLLM: #message-input was not found."
        );

        return;

    }


    input.addEventListener(
        "input",
        resizeInput
    );


    input.addEventListener(
        "keydown",
        handleKey
    );


    resizeInput();

}


// ============================================================
// SEND BUTTON
// ============================================================

function setupSendButton() {

    const button =
        document.getElementById(
            "send-button"
        );


    if (!button) {

        console.warn(
            "CSLLM: #send-button was not found."
        );

        return;

    }


    button.addEventListener(
        "click",
        function() {

            sendMessage();

        }
    );

}


// ============================================================
// INITIALIZE
// ============================================================

function initialize() {

    console.log(
        "CSLLM initializing..."
    );


    loadChats();


    const savedChat =
        getSavedChatId();


    // If the previously selected chat
    // still exists, reopen it.

    if (
        savedChat &&
        chats[savedChat]
    ) {

        currentChatId =
            savedChat;

    }


    // Otherwise choose the newest chat.

    if (
        !currentChatId
    ) {

        const ids =
            Object.keys(chats);


        if (
            ids.length > 0
        ) {

            ids.sort(
                (a, b) =>
                    chats[b].updatedAt -
                    chats[a].updatedAt
            );


            currentChatId =
                ids[0];

        }

    }


    // If there are no chats,
    // create one.

    if (
        !currentChatId
    ) {

        createNewChat();

    } else {

        saveCurrentChatId();

        renderChatList();

        loadChat(
            currentChatId
        );

    }


    setupInput();

    setupSendButton();


    console.log(
        "CSLLM ready."
    );

}


// ============================================================
// START APP
// ============================================================

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
```


const API_URL = "https://csllm.vercel.app/api/chat";


// ============================================
// CHAT STORAGE
// ============================================

let chats = JSON.parse(
    localStorage.getItem("csllm_chats") || "[]"
);

let currentChatId =
    localStorage.getItem("csllm_current_chat");


// ============================================
// CREATE FIRST CHAT IF NEEDED
// ============================================

if (!Array.isArray(chats) || chats.length === 0) {

    chats = [
        createChat()
    ];

}


// ============================================
// MAKE SURE CURRENT CHAT EXISTS
// ============================================

if (
    !currentChatId ||
    !chats.some(chat => chat.id === currentChatId)
) {

    currentChatId = chats[0].id;

}


saveChats();


// ============================================
// CREATE CHAT
// ============================================

function createChat(title = "New Chat") {

    return {

        id:
            "chat-" +
            Date.now() +
            "-" +
            Math.random()
                .toString(36)
                .substring(2, 9),

        title: title,

        messages: []

    };

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
// SAVE CHATS
// ============================================

function saveChats() {

    localStorage.setItem(
        "csllm_chats",
        JSON.stringify(chats)
    );

    localStorage.setItem(
        "csllm_current_chat",
        currentChatId
    );

}


// ============================================
// NEW CHAT
// ============================================

function newChat() {

    const chat =
        createChat();

    chats.unshift(chat);

    currentChatId =
        chat.id;

    saveChats();

    renderChatList();

    renderCurrentChat();

}


// ============================================
// SWITCH CHAT
// ============================================

function switchChat(chatId) {

    const chat =
        chats.find(
            chat => chat.id === chatId
        );

    if (!chat) return;

    currentChatId =
        chatId;

    saveChats();

    renderChatList();

    renderCurrentChat();

}


// ============================================
// DELETE CHAT
// ============================================

function deleteChat(chatId) {

    chats =
        chats.filter(
            chat => chat.id !== chatId
        );


    if (chats.length === 0) {

        const chat =
            createChat();

        chats.push(chat);

    }


    if (
        !chats.some(
            chat => chat.id === currentChatId
        )
    ) {

        currentChatId =
            chats[0].id;

    }


    saveChats();

    renderChatList();

    renderCurrentChat();

}


// ============================================
// RENAME CHAT
// ============================================

function renameChat(chatId, title) {

    const chat =
        chats.find(
            chat => chat.id === chatId
        );

    if (!chat) return;

    chat.title =
        title.trim() ||
        "New Chat";

    saveChats();

    renderChatList();

}


// ============================================
// SEND MESSAGE TO AI
// ============================================

async function sendMessage(message) {

    const chat =
        getCurrentChat();

    if (!chat) {
        throw new Error(
            "No active chat."
        );
    }


    message =
        message.trim();


    if (!message) {
        return;
    }


    // ========================================
    // ADD USER MESSAGE
    // ========================================

    chat.messages.push({

        role: "user",

        content: message

    });


    saveChats();

    renderCurrentChat();


    // ========================================
    // CREATE HISTORY
    // ========================================

    // We DON'T send the newest message twice.
    // The newest message is already inside
    // chat.messages, so the backend receives
    // the complete conversation here.

    const history =
        chat.messages.map(
            msg => ({

                role:
                    msg.role,

                content:
                    msg.content

            })
        );


    // ========================================
    // SHOW LOADING
    // ========================================

    setLoading(true);


    try {

        console.log(
            "Sending conversation:",
            history
        );


        // ========================================
        // CALL VERCEL BACKEND
        // ========================================

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

                            // Newest user message
                            message:
                                message,

                            // Complete conversation
                            history:
                                history.slice(0, -1)

                        })

                }
            );


        const data =
            await response.json();


        console.log(
            "Backend status:",
            response.status
        );


        // ========================================
        // ERROR
        // ========================================

        if (!response.ok) {

            console.error(
                "Backend error:",
                data
            );

            throw new Error(
                data.error ||
                `Server returned ${response.status}`
            );

        }


        // ========================================
        // GET AI RESPONSE
        // ========================================

        const reply =
            data.reply;


        if (
            !reply ||
            typeof reply !== "string"
        ) {

            throw new Error(
                "The AI returned an empty response."
            );

        }


        // ========================================
        // SAVE AI RESPONSE
        // ========================================

        chat.messages.push({

            role:
                "assistant",

            content:
                reply

        });


        // ========================================
        // AUTOMATIC CHAT TITLE
        // ========================================

        if (
            chat.title === "New Chat"
        ) {

            chat.title =
                message.length > 30
                    ? message.substring(0, 30) + "..."
                    : message;

        }


        saveChats();

        renderChatList();

        renderCurrentChat();


        return reply;


    } catch (error) {

        console.error(
            "AI connection error:",
            error
        );


        // ========================================
        // REMOVE USER MESSAGE IF AI FAILED
        // ========================================

        if (
            chat.messages.length > 0 &&
            chat.messages[
                chat.messages.length - 1
            ].role === "user"
        ) {

            chat.messages.pop();

            saveChats();

            renderCurrentChat();

        }


        throw error;


    } finally {

        setLoading(false);

    }

}


// ============================================
// RENDER CHAT LIST
// ============================================

function renderChatList() {

    const container =
        document.getElementById(
            "chat-list"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    chats.forEach(chat => {

        const button =
            document.createElement(
                "button"
            );


        button.className =
            "chat-list-item";


        if (
            chat.id === currentChatId
        ) {

            button.classList.add(
                "active"
            );

        }


        button.textContent =
            chat.title;


        button.onclick =
            () => {

                switchChat(
                    chat.id
                );

            };


        container.appendChild(
            button
        );

    });

}


// ============================================
// RENDER CURRENT CHAT
// ============================================

function renderCurrentChat() {

    const chat =
        getCurrentChat();


    if (!chat) {
        return;
    }


    const container =
        document.getElementById(
            "messages"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    chat.messages.forEach(
        message => {

            addMessageToScreen(
                message.role,
                message.content
            );

        }
    );


    // Scroll to bottom

    container.scrollTop =
        container.scrollHeight;

}


// ============================================
// DISPLAY MESSAGE
// ============================================

function addMessageToScreen(
    role,
    content
) {

    const container =
        document.getElementById(
            "messages"
        );


    if (!container) {
        return;
    }


    const message =
        document.createElement(
            "div"
        );


    message.className =
        role === "user"
            ? "message user-message"
            : "message ai-message";


    const text =
        document.createElement(
            "div"
        );


    text.className =
        "message-content";


    // Basic Markdown-like formatting

    text.innerHTML =
        formatMessage(
            content
        );


    message.appendChild(
        text
    );


    container.appendChild(
        message
    );

}


// ============================================
// BASIC MESSAGE FORMATTER
// ============================================

function formatMessage(text) {

    if (!text) {
        return "";
    }


    // Escape HTML first

    let result =
        text
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            );


    // Code blocks

    result =
        result.replace(
            /```([\s\S]*?)```/g,
            "<pre><code>$1</code></pre>"
        );


    // Bold

    result =
        result.replace(
            /\*\*(.*?)\*\*/g,
            "<strong>$1</strong>"
        );


    // Italic

    result =
        result.replace(
            /\*(.*?)\*/g,
            "<em>$1</em>"
        );


    // Line breaks

    result =
        result.replace(
            /\n/g,
            "<br>"
        );


    return result;

}


// ============================================
// LOADING STATE
// ============================================

function setLoading(loading) {

    const button =
        document.getElementById(
            "send-button"
        );


    if (!button) {
        return;
    }


    button.disabled =
        loading;


    if (loading) {

        button.dataset.oldText =
            button.textContent;

        button.textContent =
            "Thinking...";

    } else {

        button.textContent =
            button.dataset.oldText ||
            "Send";

    }

}


// ============================================
// HANDLE SEND BUTTON
// ============================================

async function handleSend() {

    const input =
        document.getElementById(
            "message-input"
        );


    if (!input) {
        return;
    }


    const message =
        input.value.trim();


    if (!message) {
        return;
    }


    input.value = "";


    try {

        await sendMessage(
            message
        );

    } catch (error) {

        addMessageToScreen(
            "assistant",
            "Sorry, I couldn't connect to the AI. Please try again."
        );

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

        handleSend();

    }

}


// ============================================
// INITIALIZE
// ============================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        renderChatList();

        renderCurrentChat();


        const input =
            document.getElementById(
                "message-input"
            );


        if (input) {

            input.addEventListener(
                "keydown",
                handleKey
            );

        }


        const sendButton =
            document.getElementById(
                "send-button"
            );


        if (sendButton) {

            sendButton.addEventListener(
                "click",
                handleSend
            );

        }

    }
);
