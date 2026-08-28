````javascript
"use strict";

// ============================================================
// CSLLM FRONTEND
// ============================================================

const API_URL = "https://csllm.vercel.app/api/chat";

const STORAGE_KEY = "csllm_chats";
const CURRENT_CHAT_KEY = "csllm_current_chat";

let chats = [];
let currentChatId = null;
let isSending = false;


// ============================================================
// CHAT CREATION
// ============================================================

function createChat() {
    return {
        id:
            "chat-" +
            Date.now() +
            "-" +
            Math.random().toString(36).substring(2, 9),

        title: "New Chat",

        messages: [],

        createdAt: Date.now(),

        updatedAt: Date.now()
    };
}


// ============================================================
// LOAD CHATS
// ============================================================

function loadChats() {
    try {
        const saved =
            localStorage.getItem(STORAGE_KEY);

        if (saved) {
            chats = JSON.parse(saved);
        } else {
            chats = [];
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

        if (currentChatId) {
            localStorage.setItem(
                CURRENT_CHAT_KEY,
                currentChatId
            );
        }

    } catch (error) {
        console.error(
            "Could not save chats:",
            error
        );
    }
}


// ============================================================
// GET CURRENT CHAT
// ============================================================

function getCurrentChat() {
    return chats.find(
        chat => chat.id === currentChatId
    );
}


// ============================================================
// CREATE NEW CHAT
// ============================================================

function newChat() {

    const chat = createChat();

    chats.unshift(chat);

    currentChatId = chat.id;

    saveChats();

    renderChatList();

    renderCurrentChat();

    const input =
        document.getElementById(
            "message-input"
        );

    if (input) {
        input.focus();
    }
}


// Keep old function name working
function createNewChat() {
    newChat();
}


// ============================================================
// SWITCH CHAT
// ============================================================

function switchChat(id) {

    const chat =
        chats.find(
            chat => chat.id === id
        );

    if (!chat) {
        return;
    }

    currentChatId = id;

    saveChats();

    renderChatList();

    renderCurrentChat();
}


// ============================================================
// DELETE CHAT
// ============================================================

function deleteChat(id) {

    const chat =
        chats.find(
            chat => chat.id === id
        );

    if (!chat) {
        return;
    }

    if (
        !confirm(
            `Delete "${chat.title}"?`
        )
    ) {
        return;
    }

    chats =
        chats.filter(
            chat => chat.id !== id
        );


    if (chats.length === 0) {

        const newChatObject =
            createChat();

        chats.push(
            newChatObject
        );

        currentChatId =
            newChatObject.id;

    } else if (
        currentChatId === id
    ) {

        chats.sort(
            (a, b) =>
                b.updatedAt -
                a.updatedAt
        );

        currentChatId =
            chats[0].id;
    }


    saveChats();

    renderChatList();

    renderCurrentChat();
}


// ============================================================
// RENAME CHAT
// ============================================================

function renameChat(id) {

    const chat =
        chats.find(
            chat => chat.id === id
        );

    if (!chat) {
        return;
    }

    const name =
        prompt(
            "Enter a new chat name:",
            chat.title
        );

    if (name === null) {
        return;
    }

    const cleaned =
        name.trim();

    if (!cleaned) {
        return;
    }

    chat.title =
        cleaned;

    chat.updatedAt =
        Date.now();

    saveChats();

    renderChatList();
}


// ============================================================
// CHAT OPTIONS
// ============================================================

function showChatMenu(id) {

    const choice =
        prompt(
            "Type:\nrename - Rename chat\ndelete - Delete chat"
        );

    if (!choice) {
        return;
    }

    const command =
        choice
            .trim()
            .toLowerCase();

    if (command === "rename") {
        renameChat(id);
    }

    if (command === "delete") {
        deleteChat(id);
    }
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
        console.warn(
            "#chat-list was not found."
        );

        return;
    }

    list.innerHTML = "";


    const sortedChats =
        [...chats].sort(
            (a, b) =>
                b.updatedAt -
                a.updatedAt
        );


    sortedChats.forEach(
        chat => {

            const row =
                document.createElement(
                    "div"
                );

            row.className =
                "chat-list-row";


            const button =
                document.createElement(
                    "button"
                );

            button.className =
                "chat-list-item";


            if (
                chat.id ===
                currentChatId
            ) {

                button.classList.add(
                    "active"
                );
            }


            button.textContent =
                chat.title ||
                "New Chat";


            button.onclick =
                () => {

                    switchChat(
                        chat.id
                    );

                };


            const menu =
                document.createElement(
                    "button"
                );

            menu.className =
                "chat-menu-button";

            menu.textContent =
                "⋯";

            menu.title =
                "Chat options";


            menu.onclick =
                event => {

                    event.stopPropagation();

                    showChatMenu(
                        chat.id
                    );

                };


            row.appendChild(
                button
            );

            row.appendChild(
                menu
            );

            list.appendChild(
                row
            );
        }
    );
}


// ============================================================
// RENDER CURRENT CHAT
// ============================================================

function renderCurrentChat() {

    const container =
        document.getElementById(
            "messages"
        );

    if (!container) {

        console.error(
            "CSLLM ERROR: #messages does not exist."
        );

        return;
    }


    container.innerHTML = "";


    const chat =
        getCurrentChat();


    if (!chat) {
        return;
    }


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
}


// ============================================================
// WELCOME
// ============================================================

function showWelcome() {

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


    const title =
        document.createElement(
            "h1"
        );

    title.textContent =
        "CSLLM";


    const subtitle =
        document.createElement(
            "p"
        );

    subtitle.textContent =
        "How can I help you today?";


    welcome.appendChild(
        title
    );

    welcome.appendChild(
        subtitle
    );

    container.appendChild(
        welcome
    );
}


// ============================================================
// DISPLAY MESSAGE
// ============================================================

function addMessageToScreen(
    role,
    content,
    scroll = true
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


    const messageContent =
        document.createElement(
            "div"
        );


    messageContent.className =
        "message-content";


    messageContent.innerHTML =
        formatMessage(
            String(content || "")
        );


    message.appendChild(
        messageContent
    );


    container.appendChild(
        message
    );


    if (scroll) {
        scrollToBottom();
    }
}


// ============================================================
// BASIC MARKDOWN FORMAT
// ============================================================

function formatMessage(text) {

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


    result =
        result.replace(
            /```([\s\S]*?)```/g,
            "<pre><code>$1</code></pre>"
        );


    result =
        result.replace(
            /\*\*(.*?)\*\*/g,
            "<strong>$1</strong>"
        );


    result =
        result.replace(
            /\*(.*?)\*/g,
            "<em>$1</em>"
        );


    result =
        result.replace(
            /\n/g,
            "<br>"
        );


    return result;
}


// ============================================================
// SCROLL
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
// CREATE CHAT TITLE
// ============================================================

function createChatTitle(text) {

    let title =
        text
            .replace(
                /\s+/g,
                " "
            )
            .trim();


    if (
        title.length > 35
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
// ADD MESSAGE TO CHAT
// ============================================================

function addMessageToChat(
    role,
    content
) {

    const chat =
        getCurrentChat();

    if (!chat) {
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
// LOADING INDICATOR
// ============================================================

function showLoading() {

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


function removeLoading(element) {

    if (
        element &&
        element.parentNode
    ) {

        element.remove();

    }
}


// ============================================================
// SEND MESSAGE
// ============================================================

async function sendMessage(
    suppliedText = null
) {

    if (isSending) {
        return;
    }


    const input =
        document.getElementById(
            "message-input"
        );


    let text;


    if (
        suppliedText !== null
    ) {

        text =
            suppliedText.trim();

    } else if (input) {

        text =
            input.value.trim();

    } else {

        console.error(
            "#message-input was not found."
        );

        return;
    }


    if (!text) {
        return;
    }


    let chat =
        getCurrentChat();


    if (!chat) {

        newChat();

        chat =
            getCurrentChat();
    }


    // Add user message

    addMessageToChat(
        "user",
        text
    );


    addMessageToScreen(
        "user",
        text
    );


    if (input) {

        input.value =
            "";

        input.style.height =
            "auto";
    }


    const loading =
        showLoading();


    isSending =
        true;


    setSendButton(
        true
    );


    try {

        // Send the entire conversation.
        // This gives the AI memory inside
        // the current chat.

        const messages =
            chat.messages.map(
                message => ({
                    role:
                        message.role,
                    content:
                        message.content
                })
            );


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
                                messages
                        })

                }
            );


        console.log(
            "Backend status:",
            response.status
        );


        const raw =
            await response.text();


        let data;


        try {

            data =
                JSON.parse(
                    raw
                );

        } catch {

            data = {
                error:
                    raw
            };
        }


        if (!response.ok) {

            console.error(
                "Backend error:",
                response.status,
                data
            );


            throw new Error(
                data.error ||
                `Server returned ${response.status}`
            );
        }


        const reply =
            extractReply(
                data
            );


        if (!reply) {

            console.error(
                "Unexpected backend response:",
                data
            );


            throw new Error(
                "The backend returned no AI response."
            );
        }


        removeLoading(
            loading
        );


        addMessageToChat(
            "assistant",
            reply
        );


        addMessageToScreen(
            "assistant",
            reply
        );


    } catch (error) {

        console.error(
            "AI connection error:",
            error
        );


        removeLoading(
            loading
        );


        addMessageToScreen(
            "assistant",
            "Sorry, I couldn't connect to the AI.\n\n" +
            error.message
        );

    } finally {

        isSending =
            false;

        setSendButton(
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

function extractReply(data) {

    if (!data) {
        return null;
    }


    if (
        typeof data.reply ===
        "string"
    ) {

        return data.reply;
    }


    if (
        typeof data.response ===
        "string"
    ) {

        return data.response;
    }


    if (
        typeof data.content ===
        "string"
    ) {

        return data.content;
    }


    if (
        typeof data.message ===
        "string"
    ) {

        return data.message;
    }


    if (
        data.message &&
        typeof data.message.content ===
            "string"
    ) {

        return data.message.content;
    }


    if (
        data.choices &&
        data.choices[0]
    ) {

        const choice =
            data.choices[0];


        if (
            choice.message &&
            typeof choice.message.content ===
                "string"
        ) {

            return choice.message.content;
        }


        if (
            typeof choice.text ===
                "string"
        ) {

            return choice.text;
        }
    }


    return null;
}


// ============================================================
// SEND BUTTON
// ============================================================

function setSendButton(
    loading
) {

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


// ============================================================
// HANDLE SEND
// ============================================================

async function handleSend() {

    const input =
        document.getElementById(
            "message-input"
        );

    if (!input) {
        return;
    }


    await sendMessage(
        input.value
    );
}


// ============================================================
// ENTER KEY
// ============================================================

function handleKey(event) {

    if (
        event.key === "Enter" &&
        !event.shiftKey
    ) {

        event.preventDefault();

        handleSend();
    }
}


// ============================================================
// SUGGESTION BUTTONS
// ============================================================

function suggest(text) {

    sendMessage(
        text
    );
}


// ============================================================
// CLEAR ALL
// ============================================================

function clearAllChats() {

    if (
        !confirm(
            "Delete all chats?"
        )
    ) {
        return;
    }


    chats = [];


    const chat =
        createChat();


    chats.push(
        chat
    );


    currentChatId =
        chat.id;


    saveChats();

    renderChatList();

    renderCurrentChat();
}


// ============================================================
// EXPORT CHAT
// ============================================================

function exportCurrentChat() {

    const chat =
        getCurrentChat();

    if (!chat) {
        return;
    }


    let output =
        `CSLLM - ${chat.title}\n\n`;


    chat.messages.forEach(
        message => {

            output +=
                `${
                    message.role === "user"
                        ? "You"
                        : "CSLLM"
                }:\n`;

            output +=
                message.content +
                "\n\n";
        }
    );


    const blob =
        new Blob(
            [output],
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
// INITIALIZE
// ============================================================

function initialize() {

    console.log(
        "CSLLM initializing..."
    );


    loadChats();


    const saved =
        localStorage.getItem(
            CURRENT_CHAT_KEY
        );


    if (
        saved &&
        chats.some(
            chat => chat.id === saved
        )
    ) {

        currentChatId =
            saved;

    } else if (
        chats.length > 0
    ) {

        chats.sort(
            (a, b) =>
                b.updatedAt -
                a.updatedAt
        );

        currentChatId =
            chats[0].id;

    } else {

        const chat =
            createChat();

        chats.push(
            chat
        );

        currentChatId =
            chat.id;
    }


    saveChats();

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


        input.addEventListener(
            "input",
            () => {

                input.style.height =
                    "auto";

                input.style.height =
                    Math.min(
                        input.scrollHeight,
                        180
                    ) + "px";
            }
        );
    }


    const button =
        document.getElementById(
            "send-button"
        );


    if (button) {

        button.addEventListener(
            "click",
            handleSend
        );
    }


    console.log(
        "CSLLM ready."
    );
}


// ============================================================
// START
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
````
