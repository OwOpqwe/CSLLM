// ============================================
// CSLLM CHAT SYSTEM
// ============================================

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
