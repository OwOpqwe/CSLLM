"use strict";

/*

* CHARLIE'S AI FRONTEND
*
* Backend:
* https://csllm.vercel.app/api/chat
*
* API keys are NOT stored in this file.
  */

const API_URL = "https://csllm.vercel.app/api/chat";

const STORAGE_KEY = "charlies_ai_chats";

let chats = [];
let currentChatId = null;
let isSending = false;

let messagesContainer = null;
let messageInput = null;
let sendButton = null;
let newChatButton = null;
let chatList = null;
let chatTitle = null;

/* ============================================
DOM
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

/* ============================================
CHAT CREATION
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

if (messageInput) {
    messageInput.value = "";
    resizeTextarea();
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

chats =
    chats.filter(
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
STORAGE
============================================ */

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


currentChatId =
    chats[0].id;

renderChatList();

loadChat(currentChatId);


}

/* ============================================
CURRENT CHAT
============================================ */

function getCurrentChat() {


return chats.find(
    chat => chat.id === currentChatId
);


}

/* ============================================
CHAT LIST
============================================ */

function renderChatList() {


if (!chatList) {
    return;
}

chatList.innerHTML = "";


chats.forEach(chat => {

    const chatItem =
        document.createElement("div");

    chatItem.className =
        "chat-item";


    if (
        chat.id === currentChatId
    ) {
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


    chatList.appendChild(chatItem);
});


}

/* ============================================
LOAD CHAT
============================================ */

function loadChat(chatId) {


const chat =
    chats.find(
        item => item.id === chatId
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


chat.messages.forEach(
    message => {

        if (
            message.role ===
            "graph"
        ) {

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


const suggestions =
    document.createElement("div");

suggestions.className =
    "suggestions";


const buttons = [
    "Create a bar chart showing the population of five countries.",
    "Create a pie chart showing global food consumption.",
    "Create a line graph showing population growth from 2000 to 2025."
];


buttons.forEach(text => {

    const button =
        document.createElement("button");

    button.className =
        "suggestion";

    button.type =
        "button";

    button.textContent =
        text;


    button.addEventListener(
        "click",
        () => suggest(text)
    );


    suggestions.appendChild(button);
});


welcome.appendChild(
    suggestions
);


messagesContainer.appendChild(
    welcome
);


}

/* ============================================
NORMAL MESSAGE
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


}

/* ============================================
GRAPH DETECTION
============================================ */

function extractGraph(text) {


if (
    typeof text !== "string"
) {
    return null;
}


const start =
    text.indexOf("GRAPH_START");

const end =
    text.indexOf("GRAPH_END");


if (
    start === -1 ||
    end === -1 ||
    end <= start
) {
    return null;
}


const jsonText =
    text
        .substring(
            start + "GRAPH_START".length,
            end
        )
        .trim();


try {

    const graph =
        JSON.parse(jsonText);

    return graph;

} catch (error) {

    console.error(
        "Could not parse graph:",
        error
    );

    return null;
}


}

/* ============================================
REMOVE GRAPH MARKUP FROM TEXT
============================================ */

function removeGraphMarkup(text) {


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
GRAPH MESSAGE
============================================ */

function addGraphToScreen(
graph,
scroll = true
) {


if (
    !messagesContainer ||
    !graph
) {
    return;
}


const message =
    document.createElement("div");

message.className =
    "message assistant-message graph-message";


const bubble =
    document.createElement("div");

bubble.className =
    "graph-bubble";


const title =
    document.createElement("h3");

title.className =
    "graph-title";

title.textContent =
    graph.title ||
    "Chart";


bubble.appendChild(title);


if (graph.description) {

    const description =
        document.createElement("p");

    description.className =
        "graph-description";

    description.textContent =
        graph.description;

    bubble.appendChild(
        description
    );
}


const container =
    document.createElement("div");

container.className =
    "graph-canvas-container";


const canvas =
    document.createElement("canvas");

canvas.className =
    "graph-canvas";


container.appendChild(canvas);

bubble.appendChild(container);


const legend =
    document.createElement("div");

legend.className =
    "graph-legend";

bubble.appendChild(legend);


message.appendChild(bubble);

messagesContainer.appendChild(message);


drawGraph(
    canvas,
    graph,
    legend
);


if (scroll) {
    scrollToBottom();
}


}

/* ============================================
GRAPH DATA NORMALIZATION
============================================ */

function normalizeGraph(graph) {


const type =
    String(
        graph.type ||
        graph.chartType ||
        "bar"
    ).toLowerCase();


let labels =
    Array.isArray(graph.labels)
        ? graph.labels
        : [];


let values =
    Array.isArray(graph.values)
        ? graph.values
        : [];


if (
    Array.isArray(graph.data) &&
    graph.data.length > 0
) {

    const data =
        graph.data;


    if (
        labels.length === 0
    ) {

        labels =
            data.map(
                item =>
                    item.label ??
                    item.name ??
                    item.category ??
                    item.x ??
                    ""
            );
    }


    if (
        values.length === 0
    ) {

        values =
            data.map(
                item =>
                    Number(
                        item.value ??
                        item.y ??
                        item.amount ??
                        0
                    )
            );
    }
}


values =
    values.map(
        value => Number(value) || 0
    );


return {
    type,
    labels,
    values,
    title:
        graph.title ||
        "Chart",
    description:
        graph.description ||
        ""
};


}

/* ============================================
GRAPH DRAWING
============================================ */

function drawGraph(
canvas,
graph,
legend
) {


const normalized =
    normalizeGraph(graph);


const width =
    canvas.clientWidth || 700;

const height =
    canvas.clientHeight || 320;


const ratio =
    window.devicePixelRatio || 1;


canvas.width =
    width * ratio;

canvas.height =
    height * ratio;


const ctx =
    canvas.getContext("2d");


if (!ctx) {
    return;
}


ctx.scale(
    ratio,
    ratio
);


ctx.clearRect(
    0,
    0,
    width,
    height
);


if (
    normalized.type ===
    "pie"
) {

    drawPieChart(
        ctx,
        width,
        height,
        normalized,
        legend
    );

} else if (
    normalized.type ===
    "line"
) {

    drawLineChart(
        ctx,
        width,
        height,
        normalized,
        legend
    );

} else if (
    normalized.type ===
    "scatter"
) {

    drawScatterChart(
        ctx,
        width,
        height,
        normalized,
        legend
    );

} else {

    drawBarChart(
        ctx,
        width,
        height,
        normalized,
        legend
    );
}


}

/* ============================================
GRAPH COLORS
============================================ */

const GRAPH_COLORS = [
"#6ea8fe",
"#7ee2b8",
"#ffb86b",
"#c792ea",
"#ff7b9c",
"#70d6ff",
"#f7d774",
"#9be564"
];

/* ============================================
COMMON GRAPH HELPERS
============================================ */

function maxValue(values) {


const maximum =
    Math.max(
        ...values.map(
            value =>
                Math.abs(
                    Number(value) || 0
                )
        ),
        1
    );

return maximum;


}

function drawGrid(
ctx,
left,
top,
width,
height,
maximum
) {


ctx.strokeStyle =
    "#292929";

ctx.lineWidth = 1;


const lines = 5;


for (
    let i = 0;
    i <= lines;
    i++
) {

    const y =
        top +
        height -
        (height * i / lines);


    ctx.beginPath();

    ctx.moveTo(
        left,
        y
    );

    ctx.lineTo(
        left + width,
        y
    );

    ctx.stroke();


    ctx.fillStyle =
        "#777";

    ctx.font =
        "11px Arial";

    ctx.textAlign =
        "right";

    ctx.textBaseline =
        "middle";


    const value =
        maximum *
        i /
        lines;


    ctx.fillText(
        formatNumber(value),
        left - 8,
        y
    );
}


}

function formatNumber(value) {


if (
    Math.abs(value) >= 1000000
) {

    return (
        value / 1000000
    ).toFixed(1) + "M";

}


if (
    Math.abs(value) >= 1000
) {

    return (
        value / 1000
    ).toFixed(1) + "K";
}


if (
    Number.isInteger(value)
) {
    return String(value);
}


return Number(value).toFixed(2);


}

function drawLabels(
ctx,
labels,
left,
top,
width,
height
) {


if (!labels.length) {
    return;
}


ctx.fillStyle =
    "#aaa";

ctx.font =
    "11px Arial";

ctx.textAlign =
    "center";

ctx.textBaseline =
    "top";


const spacing =
    width /
    labels.length;


labels.forEach(
    (label, index) => {

        let text =
            String(label);


        if (
            text.length > 16
        ) {

            text =
                text.substring(
                    0,
                    14
                ) + "…";
        }


        const x =
            left +
            spacing * index +
            spacing / 2;


        ctx.fillText(
            text,
            x,
            top + height + 10
        );
    }
);


}

/* ============================================
BAR CHART
============================================ */

function drawBarChart(
ctx,
width,
height,
graph,
legend
) {


const labels =
    graph.labels;

const values =
    graph.values;


if (
    labels.length === 0 ||
    values.length === 0
) {
    drawGraphError(
        ctx,
        width,
        height,
        "No graph data"
    );
    return;
}


const left = 55;
const right = 20;
const top = 20;
const bottom = 45;


const chartWidth =
    width -
    left -
    right;

const chartHeight =
    height -
    top -
    bottom;


const maximum =
    maxValue(values);


drawGrid(
    ctx,
    left,
    top,
    chartWidth,
    chartHeight,
    maximum
);


const slot =
    chartWidth /
    values.length;


const barWidth =
    Math.max(
        8,
        slot * 0.65
    );


values.forEach(
    (value, index) => {

        const barHeight =
            Math.abs(value) /
            maximum *
            chartHeight;


        const x =
            left +
            index * slot +
            (slot - barWidth) / 2;


        const y =
            top +
            chartHeight -
            barHeight;


        ctx.fillStyle =
            GRAPH_COLORS[
                index %
                GRAPH_COLORS.length
            ];


        ctx.beginPath();

        ctx.roundRect(
            x,
            y,
            barWidth,
            barHeight,
            5
        );

        ctx.fill();
    }
);


drawLabels(
    ctx,
    labels,
    left,
    top,
    chartWidth,
    chartHeight
);


createLegend(
    legend,
    labels,
    values
);


}

/* ============================================
LINE CHART
============================================ */

function drawLineChart(
ctx,
width,
height,
graph,
legend
) {


const labels =
    graph.labels;

const values =
    graph.values;


if (
    labels.length === 0 ||
    values.length === 0
) {
    drawGraphError(
        ctx,
        width,
        height,
        "No graph data"
    );
    return;
}


const left = 55;
const right = 20;
const top = 20;
const bottom = 45;


const chartWidth =
    width -
    left -
    right;

const chartHeight =
    height -
    top -
    bottom;


const maximum =
    maxValue(values);


drawGrid(
    ctx,
    left,
    top,
    chartWidth,
    chartHeight,
    maximum
);


const points =
    values.map(
        (value, index) => {

            const x =
                labels.length === 1
                    ? left +
                      chartWidth / 2
                    : left +
                      (
                          index /
                          (labels.length - 1)
                      ) *
                      chartWidth;


            const y =
                top +
                chartHeight -
                (
                    value /
                    maximum
                ) *
                chartHeight;


            return {
                x,
                y
            };
        }
    );


ctx.strokeStyle =
    GRAPH_COLORS[0];

ctx.lineWidth = 3;

ctx.lineJoin =
    "round";

ctx.lineCap =
    "round";


ctx.beginPath();


points.forEach(
    (point, index) => {

        if (index === 0) {

            ctx.moveTo(
                point.x,
                point.y
            );

        } else {

            ctx.lineTo(
                point.x,
                point.y
            );
        }
    }
);


ctx.stroke();


points.forEach(
    point => {

        ctx.fillStyle =
            GRAPH_COLORS[0];

        ctx.beginPath();

        ctx.arc(
            point.x,
            point.y,
            4,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }
);


drawLabels(
    ctx,
    labels,
    left,
    top,
    chartWidth,
    chartHeight
);


createLegend(
    legend,
    ["Value"],
    values
);


}

/* ============================================
SCATTER CHART
============================================ */

function drawScatterChart(
ctx,
width,
height,
graph,
legend
) {


const labels =
    graph.labels;

const values =
    graph.values;


if (
    values.length === 0
) {

    drawGraphError(
        ctx,
        width,
        height,
        "No scatter data"
    );

    return;
}


const points = [];


if (
    Array.isArray(graph.data)
) {

    graph.data.forEach(
        item => {

            const x =
                Number(
                    item.x ??
                    item[graph.xKey] ??
                    0
                );

            const y =
                Number(
                    item.y ??
                    item.value ??
                    0
                );


            points.push({
                x,
                y,
                label:
                    item.label ??
                    ""
            });
        }
    );
}


if (
    points.length === 0
) {

    values.forEach(
        (value, index) => {

            points.push({
                x: index,
                y: value,
                label:
                    labels[index] ||
                    String(index + 1)
            });
        }
    );
}


const left = 55;
const right = 20;
const top = 20;
const bottom = 45;


const chartWidth =
    width -
    left -
    right;

const chartHeight =
    height -
    top -
    bottom;


const maxX =
    Math.max(
        ...points.map(
            point => point.x
        ),
        1
    );


const maxY =
    Math.max(
        ...points.map(
            point => point.y
        ),
        1
    );


drawGrid(
    ctx,
    left,
    top,
    chartWidth,
    chartHeight,
    maxY
);


points.forEach(
    (point, index) => {

        const x =
            left +
            (
                point.x /
                maxX
            ) *
            chartWidth;


        const y =
            top +
            chartHeight -
            (
                point.y /
                maxY
            ) *
            chartHeight;


        ctx.fillStyle =
            GRAPH_COLORS[
                index %
                GRAPH_COLORS.length
            ];


        ctx.beginPath();

        ctx.arc(
            x,
            y,
            6,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }
);


createLegend(
    legend,
    ["Data points"],
    values
);


}

/* ============================================
PIE CHART
============================================ */

function drawPieChart(
ctx,
width,
height,
graph,
legend
) {


const labels =
    graph.labels;

const values =
    graph.values;


if (
    labels.length === 0 ||
    values.length === 0
) {

    drawGraphError(
        ctx,
        width,
        height,
        "No pie chart data"
    );

    return;
}


const total =
    values.reduce(
        (sum, value) =>
            sum + Math.max(0, value),
        0
    );


if (total <= 0) {

    drawGraphError(
        ctx,
        width,
        height,
        "Pie chart values must be greater than zero"
    );

    return;
}


const centerX =
    width * 0.38;

const centerY =
    height / 2;


const radius =
    Math.min(
        height * 0.35,
        width * 0.28
    );


let startAngle =
    -Math.PI / 2;


values.forEach(
    (value, index) => {

        const safeValue =
            Math.max(
                0,
                value
            );


        const sliceAngle =
            (
                safeValue /
                total
            ) *
            Math.PI *
            2;


        const endAngle =
            startAngle +
            sliceAngle;


        ctx.fillStyle =
            GRAPH_COLORS[
                index %
                GRAPH_COLORS.length
            ];


        ctx.beginPath();

        ctx.moveTo(
            centerX,
            centerY
        );


        ctx.arc(
            centerX,
            centerY,
            radius,
            startAngle,
            endAngle
        );


        ctx.closePath();

        ctx.fill();


        ctx.strokeStyle =
            "#111";

        ctx.lineWidth = 2;

        ctx.stroke();


        startAngle =
            endAngle;
    }
);


createLegend(
    legend,
    labels,
    values,
    total
);


}

/* ============================================
LEGEND
============================================ */

function createLegend(
legend,
labels,
values,
total = null
) {


if (!legend) {
    return;
}


legend.innerHTML = "";


labels.forEach(
    (label, index) => {

        const item =
            document.createElement("div");

        item.className =
            "graph-legend-item";


        const dot =
            document.createElement("span");

        dot.className =
            "graph-legend-dot";


        dot.style.background =
            GRAPH_COLORS[
                index %
                GRAPH_COLORS.length
            ];


        const text =
            document.createElement("span");


        let display =
            String(label);


        if (
            total &&
            total > 0
        ) {

            const percentage =
                (
                    Number(
                        values[index]
                    ) /
                    total *
                    100
                ).toFixed(1);


            display +=
                " — " +
                percentage +
                "%";
        }


        text.textContent =
            display;


        item.appendChild(dot);

        item.appendChild(text);

        legend.appendChild(item);
    }
);


}

/* ============================================
GRAPH ERROR
============================================ */

function drawGraphError(
ctx,
width,
height,
text
) {


ctx.fillStyle =
    "#777";

ctx.font =
    "14px Arial";

ctx.textAlign =
    "center";

ctx.textBaseline =
    "middle";


ctx.fillText(
    text,
    width / 2,
    height / 2
);


}

/* ============================================
TYPING INDICATOR
============================================ */

function showTypingIndicator() {


removeTypingIndicator();


const message =
    document.createElement("div");

message.id =
    "typingIndicator";

message.className =
    "message assistant-message";


const bubble =
    document.createElement("div");

bubble.className =
    "message-bubble";

bubble.textContent =
    "Thinking...";


message.appendChild(bubble);

messagesContainer.appendChild(message);

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
CHAT TITLE
============================================ */

function updateChatTitle(
chat,
firstMessage
) {


if (!chat) {
    return;
}


if (
    chat.title &&
    chat.title !== "New Chat"
) {
    return;
}


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


        throw new Error(
            data?.error ||
            "The AI service returned an error."
        );
    }


    let aiMessage =
        "";


    if (
        typeof data ===
        "string"
    ) {

        aiMessage =
            data;

    } else if (
        typeof data.reply ===
        "string"
    ) {

        aiMessage =
            data.reply;

    } else if (
        typeof data.message ===
        "string"
    ) {

        aiMessage =
            data.message;

    } else if (
        data.message &&
        typeof data.message.content ===
        "string"
    ) {

        aiMessage =
            data.message.content;

    } else if (
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

            aiMessage =
                choice.message.content;

        } else if (
            typeof choice.text ===
            "string"
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


    const graph =
        extractGraph(aiMessage);


    const cleanText =
        removeGraphMarkup(
            aiMessage
        );


    chat.messages.push({
        role: "assistant",
        content: cleanText
    });


    if (graph) {

        chat.messages.push({
            role: "graph",
            graph: graph
        });
    }


    saveChats();


    removeTypingIndicator();


    if (cleanText) {

        addMessageToScreen(
            "assistant",
            cleanText
        );
    }


    if (graph) {

        addGraphToScreen(
            graph
        );
    }


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
SUGGESTIONS
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
CLEAR CHATS
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
    STORAGE_KEY
);


chats = [];

currentChatId = null;


createNewChat();


}

/* ============================================
EVENTS
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
