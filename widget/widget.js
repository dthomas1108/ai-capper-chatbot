const backendUrl = "http://localhost:3000/api";

const messagesDiv = document.getElementById("chatbot-messages");
const form = document.getElementById("chatbot-form");
const input = document.getElementById("chatbot-input");

function addMessage(role, text) {
    const msgDiv = document.createElement("div");
    msgDiv.className = "message " + role;
    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.textContent = text;
    msgDiv.appendChild(bubble);
    messagesDiv.appendChild(msgDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

async function getBotReply(question) {
    if (question.toLowerCase().includes("capper")) {
        const response = await fetch(`${backendUrl}/handicappers`);
        const data = await response.json();
        return "Here are some top cappers: " + data.map(cap => cap.name).join(", ");
    }

    if (question.toLowerCase().includes("package")) {
        const response = await fetch(`${backendUrl}/packages`);
        const data = await response.json();
        return "Some available packages: " + data.slice(0,3).map(p => p.title).join("; ");
    }

    return "I'm here to help! You can ask about cappers, packages, or sports picks.";
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    addMessage("user", text);
    input.value = "";

    addMessage("bot", "...");
    // Simulate thinking, then get real reply
    setTimeout(async () => {
        // Remove the "..." message
        const lastMessage = messagesDiv.lastChild;
        if (lastMessage) {
            messagesDiv.removeChild(lastMessage);
        }

        const reply = await getBotReply(text);
        addMessage("bot", reply);
    }, 600);
});