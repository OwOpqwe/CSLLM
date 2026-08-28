// ========================================
// CSLLM FRONTEND
// Multiple Chats + Saved Conversations
// Works on Vercel AND GitHub Pages
// ========================================

const API_URL = "https://csllm.vercel.app/api/chat";


// ========================================
// HTML ELEMENTS
// ========================================

const chat = document.getElementById("chat");
const input = document.getElementById("messageInput");
const history = document.getElementById("history");


// ========================================
// CHAT DATA
// ========================================

let conversations =
    JSON.parse(localStorage.getItem("csllm_chats")) || [];

let currentChatId =
    localStorage.getItem("csllm_current_chat");


// ========================================
// CREATE CHAT ID
// ========================================

function createChatId() {

    return Date.now().toString() +
        Math.random()
            .toString(36)
            .substring(2);
}


// ========================================
// CREATE NEW CHAT
// ========================================

function newChat() {

    // If there is an empty current chat,
    // don't create another empty one.

    const currentChat =
        conversations.find(
            chat => chat.id === currentChatId
        );

    if (
        currentChat &&
        currentChat.messages.length === 0
    ) {

        loadChat(currentChat.id);
        return;
    }


    // Create new conversation

    const newConversation = {

        id: createChatId(),

        title: "New Chat",

        messages: [],

        createdAt: Date.now()

    };


    conversations.unshift(
        newConversation
    );


    currentChatId =
        newConversation.id;


    saveChats();

    renderHistory();

    displayWelcome();

    input.value = "";

    input.style.height = "auto";

    input.focus();
}


// ========================================
// SAVE CHATS
// ========================================

function saveChats() {

    localStorage.setItem(
        "csllm_chats",
        JSON.stringify(conversations)
    );


    localStorage.setItem(
        "csllm_current_chat",
        currentChatId || ""
    );
}


// ========================================
// GET CURRENT CHAT
// ========================================

function getCurrentChat() {

    return conversations.find(
        chat => chat.id === currentChatId
    );
}


// ========================================
// MAKE SURE CHAT EXISTS
// ========================================

function ensureChatExists() {

    let currentChat =
        getCurrentChat();


    if (!currentChat) {

        const newConversation = {

            id: createChatId(),

            title: "New Chat",

            messages: [],

            createdAt: Date.now()

        };


        conversations.unshift(
            newConversation
        );


        currentChatId =
            newConversation.id;


        saveChats();

        renderHistory();
    }


    return getCurrentChat();
}


// ========================================
// SEND MESSAGE
// ========================================

async function sendMessage() {

    const text =
        input.value.trim();


    if (!text) {
        return;
    }


    // Make sure there is a chat

    const currentChat =
        ensureChatExists();


    // Remove welcome screen

    removeWelcome();


    // Add user message to screen

    addMessage(
        text,
        "user"
    );


    // Save user message

    currentChat.messages.push({

        role: "user",

        content: text

    });


    // Use first message as chat title

    if (
        currentChat.title === "New Chat"
    ) {

        currentChat.title =
            createChatTitle(text);
    }


    saveChats();

    renderHistory();


    // Clear input

    input.value = "";

    input.style.height = "auto";


    // Show loading

    const loading =
        addMessage(
            "Thinking...",
            "ai"
        );


    try {

        // Send to Vercel

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

                        message: text

                    })

                }
            );


        const responseText =
            await response.text();


        console.log(
            "Backend status:",
            response.status
        );


        if (!response.ok) {

            console.error(
                "Backend error:",
                responseText
            );


            throw new Error(
                `Server returned ${response.status}`
            );
        }


        let data;


        try {

            data =
                JSON.parse(
                    responseText
                );

        } catch {

            throw new Error(
                "Invalid response from server."
            );
        }


        // Remove loading

        loading.remove();


        // Backend error

        if (data.error) {

            addMessage(
                "AI Error: " +
                data.error,
                "ai"
            );

            return;
        }


        // AI response

        if (data.reply) {

            addMessage(
                data.reply,
                "ai"
            );


            // Save AI response

            currentChat.messages.push({

                role: "assistant",

                content: data.reply

            });


            saveChats();

        } else {

            addMessage(
                "The AI returned an empty response.",
                "ai"
            );
        }


    } catch (error) {

        console.error(
            "AI connection error:",
            error
        );


        if (loading) {
            loading.remove();
        }


        addMessage(
            "Sorry, I couldn't connect to CSLLM.",
            "ai"
        );
    }
}


// ========================================
// CREATE CHAT TITLE
// ========================================

function createChatTitle(text) {

    let title =
        text.trim();


    // Remove excessive whitespace

    title =
        title.replace(
            /\s+/g,
            " "
        );


    // Limit title length

    if (title.length > 32) {

        title =
            title.substring(
                0,
                32
            ) + "...";
    }


    return title;
}


// ========================================
// DISPLAY MESSAGE
// ========================================

function addMessage(
    text,
    type
) {

    const message =
        document.createElement("div");


    message.className =
        `message ${type}`;


    const content =
        document.createElement("div");


    content.className =
        "message-content";


    content.textContent =
        text;


    message.appendChild(
        content
    );


    chat.appendChild(
        message
    );


    // Scroll to bottom

    chat.scrollTop =
        chat.scrollHeight;


    return message;
}


// ========================================
// DISPLAY WELCOME SCREEN
// ========================================

function displayWelcome() {

    chat.innerHTML = `

        <div
            class="welcome"
            id="welcome"
        >

            <h1>
                How can I help?
            </h1>

            <p>
                Ask me anything.
            </p>

            <div class="suggestions">

                <button
                    onclick="suggest(
                        'Explain how AI works'
                    )"
                >
                    Explain how AI works
                </button>


                <button
                    onclick="suggest(
                        'Help me with my homework'
                    )"
                >
                    Help me with my homework
                </button>


                <button
                    onclick="suggest(
                        'Give me a fun project idea'
                    )"
                >
                    Give me a project idea
                </button>

            </div>

        </div>

    `;
}


// ========================================
// REMOVE WELCOME
// ========================================

function removeWelcome() {

    const welcome =
        document.getElementById(
            "welcome"
        );


    if (welcome) {

        welcome.remove();

    }
}


// ========================================
// LOAD CHAT
// ========================================

function loadChat(id) {

    const selectedChat =
        conversations.find(
            chat => chat.id === id
        );


    if (!selectedChat) {
        return;
    }


    currentChatId =
        selectedChat.id;


    saveChats();


    // Clear current screen

    chat.innerHTML = "";


    // Display saved messages

    selectedChat.messages.forEach(
        message => {

            addMessage(
                message.content,
                message.role === "user"
                    ? "user"
                    : "ai"
            );

        }
    );


    // If empty chat

    if (
        selectedChat.messages.length === 0
    ) {

        displayWelcome();

    }


    renderHistory();

    input.focus();
}


// ========================================
// DELETE CHAT
// ========================================

function deleteChat(
    id,
    event
) {

    // Stop clicking delete
    // from opening the chat

    if (event) {
        event.stopPropagation();
    }


    conversations =
        conversations.filter(
            chat => chat.id !== id
        );


    // If deleting current chat

    if (
        currentChatId === id
    ) {

        currentChatId =
            null;


        // Create a new empty chat

        const newConversation = {

            id: createChatId(),

            title: "New Chat",

            messages: [],

            createdAt: Date.now()

        };


        conversations.unshift(
            newConversation
        );


        currentChatId =
            newConversation.id;


        displayWelcome();
    }


    saveChats();

    renderHistory();
}


// ========================================
// RENDER CHAT HISTORY
// ========================================

function renderHistory() {

    if (!history) {
        return;
    }


    history.innerHTML = "";


    conversations.forEach(
        conversation => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "history-item";


            if (
                conversation.id ===
                currentChatId
            ) {

                item.classList.add(
                    "active"
                );

            }


            // Chat title

            const title =
                document.createElement(
                    "span"
                );


            title.className =
                "history-title";


            title.textContent =
                conversation.title;


            // Delete button

            const deleteButton =
                document.createElement(
                    "button"
                );


            deleteButton.className =
                "delete-chat";


            deleteButton.textContent =
                "×";


            deleteButton.title =
                "Delete chat";


            deleteButton.onclick =
                function(event) {

                    deleteChat(
                        conversation.id,
                        event
                    );

                };


            // Open chat

            item.onclick =
                function() {

                    loadChat(
                        conversation.id
                    );

                };


            item.appendChild(
                title
            );


            item.appendChild(
                deleteButton
            );


            history.appendChild(
                item
            );

        }
    );
}


// ========================================
// SUGGESTION BUTTON
// ========================================

function suggest(text) {

    input.value =
        text;


    input.style.height =
        "auto";


    input.style.height =
        Math.min(
            input.scrollHeight,
            150
        ) + "px";


    input.focus();


    sendMessage();
}


// ========================================
// KEYBOARD INPUT
// ========================================

function handleKey(event) {

    if (
        event.key === "Enter" &&
        !event.shiftKey
    ) {

        event.preventDefault();

        sendMessage();
    }
}


// ========================================
// AUTO RESIZE INPUT
// ========================================

if (input) {

    input.addEventListener(
        "input",
        function() {

            input.style.height =
                "auto";


            input.style.height =
                Math.min(
                    input.scrollHeight,
                    150
                ) + "px";

        }
    );
}


// ========================================
// MOBILE SIDEBAR
// ========================================

function toggleSidebar() {

    const sidebar =
        document.querySelector(
            ".sidebar"
        );


    if (!sidebar) {
        return;
    }


    sidebar.classList.toggle(
        "open"
    );
}


// ========================================
// INITIALIZE
// ========================================

function initialize() {

    // If there are no chats,
    // create the first one.

    if (
        conversations.length === 0
    ) {

        const firstChat = {

            id: createChatId(),

            title: "New Chat",

            messages: [],

            createdAt: Date.now()

        };


        conversations.push(
            firstChat
        );


        currentChatId =
            firstChat.id;


        saveChats();

    }


    // Make sure current chat
    // actually exists

    const currentExists =
        conversations.some(
            chat =>
                chat.id ===
                currentChatId
        );


    if (!currentExists) {

        currentChatId =
            conversations[0].id;

        saveChats();

    }


    // Load current chat

    loadChat(
        currentChatId
    );


    renderHistory();

    console.log(
        "CSLLM loaded successfully."
    );

    console.log(
        "Backend:",
        API_URL
    );
}


// Start app

initialize();
