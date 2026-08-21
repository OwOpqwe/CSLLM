// ========================================
// CSLLM CHAT.JS
// Chat UI + Sidebar + New Chat
// ========================================


// ========================================
// GET ELEMENTS
// ========================================

const chatContainer =
    document.getElementById("chat");

const messageInput =
    document.getElementById("messageInput");

const historyContainer =
    document.getElementById("history");


// ========================================
// SIDEBAR
// ========================================

function toggleSidebar() {

    const sidebar =
        document.querySelector(".sidebar");

    if (!sidebar) {
        return;
    }

    sidebar.classList.toggle("open");
}


// ========================================
// NEW CHAT BUTTON
// ========================================

function createNewChat() {

    if (typeof newChat === "function") {

        newChat();

        // Close mobile sidebar

        const sidebar =
            document.querySelector(".sidebar");

        if (sidebar) {
            sidebar.classList.remove("open");
        }

        return;
    }

    console.error(
        "newChat() was not found."
    );
}


// ========================================
// SEND BUTTON
// ========================================

function handleSend() {

    if (
        typeof sendMessage === "function"
    ) {

        sendMessage();

    } else {

        console.error(
            "sendMessage() was not found."
        );

    }
}


// ========================================
// ENTER KEY
// ========================================

function handleChatKey(event) {

    // Enter sends message

    if (
        event.key === "Enter" &&
        !event.shiftKey
    ) {

        event.preventDefault();

        handleSend();

    }

}


// ========================================
// INPUT AUTO RESIZE
// ========================================

function resizeInput() {

    if (!messageInput) {
        return;
    }


    messageInput.style.height =
        "auto";


    const newHeight =
        Math.min(
            messageInput.scrollHeight,
            150
        );


    messageInput.style.height =
        newHeight + "px";

}


// ========================================
// INPUT EVENTS
// ========================================

if (messageInput) {

    messageInput.addEventListener(
        "input",
        resizeInput
    );


    messageInput.addEventListener(
        "keydown",
        handleChatKey
    );

}


// ========================================
// SUGGESTION BUTTONS
// ========================================

function useSuggestion(text) {

    if (!messageInput) {
        return;
    }


    messageInput.value =
        text;


    resizeInput();

    messageInput.focus();


    handleSend();

}


// ========================================
// CLOSE SIDEBAR AFTER CHAT SELECTION
// ========================================

if (historyContainer) {

    historyContainer.addEventListener(
        "click",
        function(event) {

            const sidebar =
                document.querySelector(
                    ".sidebar"
                );


            // Only close on mobile

            if (
                window.innerWidth <= 768 &&
                sidebar
            ) {

                sidebar.classList.remove(
                    "open"
                );

            }

        }
    );

}


// ========================================
// CLOSE SIDEBAR WHEN CLICKING OUTSIDE
// ========================================

document.addEventListener(
    "click",
    function(event) {

        const sidebar =
            document.querySelector(
                ".sidebar"
            );


        const menuButton =
            document.querySelector(
                ".menu-button"
            );


        if (
            !sidebar ||
            !sidebar.classList.contains(
                "open"
            )
        ) {
            return;
        }


        // Don't close if clicking
        // inside sidebar

        if (
            sidebar.contains(event.target)
        ) {
            return;
        }


        // Don't close if clicking
        // menu button

        if (
            menuButton &&
            menuButton.contains(
                event.target
            )
        ) {
            return;
        }


        sidebar.classList.remove(
            "open"
        );

    }
);


// ========================================
// MOBILE MENU
// ========================================

function openChatMenu() {

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
// CLEAR INPUT
// ========================================

function clearInput() {

    if (!messageInput) {
        return;
    }


    messageInput.value =
        "";


    messageInput.style.height =
        "auto";


    messageInput.focus();

}


// ========================================
// FOCUS CHAT
// ========================================

function focusChat() {

    if (messageInput) {

        messageInput.focus();

    }

}


// ========================================
// INITIALIZE CHAT UI
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        console.log(
            "CSLLM chat.js loaded."
        );


        // Focus input

        if (messageInput) {

            messageInput.focus();

        }

    }
);
