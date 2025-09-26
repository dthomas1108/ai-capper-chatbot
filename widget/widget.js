const chatWidget = (() => {
    let messagesContainer;
    let messageInput;
    let sendButton;
    let quickActions;
    let welcomeMessage;
    let sessionId;
    let isTyping = false;
    const messageHistory = [];

    function init() {
        messagesContainer = document.getElementById('messagesContainer');
        messageInput = document.getElementById('messageInput');
        sendButton = document.getElementById('sendButton');
        quickActions = document.getElementById('quickActions');
        welcomeMessage = document.getElementById('welcomeMessage');

        if (!messagesContainer || !messageInput || !sendButton || !quickActions) {
            console.error('Required DOM elements not found. Make sure HTML structure is correct.');
            return;
        }

        sessionId = generateSessionId();
        setupEventListeners();
    }

    function setupEventListeners() {
        sendButton.addEventListener('click', () => sendMessage());

        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        messageInput.addEventListener('input', () => autoResizeTextarea());

        quickActions.addEventListener('click', (e) => {
            if (e.target.classList.contains('quick-action')) {
                const action = e.target.dataset.action;
                sendMessage(action);
            }
        });

        if (welcomeMessage) {
            messageInput.addEventListener('focus', () => {
                if (welcomeMessage) {
                    welcomeMessage.style.animation = 'messageSlide 0.3s ease-out reverse';
                    setTimeout(() => {
                        if (welcomeMessage) {
                            welcomeMessage.remove();
                            welcomeMessage = null;
                        }
                    }, 300);
                }
            }, { once: true });
        }
    }

    function generateSessionId() {
        return 'widget_' + Math.random().toString(36).substring(2, 11);
    }

    function autoResizeTextarea() {
        const textarea = messageInput;
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    async function sendMessage(message = null) {
        const text = message || messageInput.value.trim();
        if (!text || isTyping) return;

        if (!message) {
            messageInput.value = '';
            autoResizeTextarea();
        }

        addMessage('user', text);
        showTypingIndicator();

        try {
            const response = await fetch('http://localhost:3000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-session-id': sessionId
                },
                body: JSON.stringify({ message: text })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            setTimeout(() => {
                hideTypingIndicator();
                addBotMessage(data);
                updateQuickActions(data.quickActions || []);
            }, 800 + Math.random() * 1200);

        } catch (error) {
            console.error('Chat error:', error);
            setTimeout(() => {
                hideTypingIndicator();
                addMessage('bot', 'Sorry, I\'m having trouble connecting right now. Please try again!');
            }, 1000);
        }
    }

    function addMessage(sender, text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;

        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'message-bubble';
        bubbleDiv.textContent = text;

        messageDiv.appendChild(bubbleDiv);
        messagesContainer.appendChild(messageDiv);

        scrollToBottom();
        messageHistory.push({ sender, text, timestamp: Date.now() });
    }

    function addBotMessage(data) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot';

        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'message-bubble';
        bubbleDiv.innerHTML = formatBotMessage(data.reply || 'No response received');
        messageDiv.appendChild(bubbleDiv);

        if (data.data && (data.data.capper || data.data.packages || data.data.topPerformers)) {
            const card = createRichCard(data);
            if (card) {
                messageDiv.appendChild(card);
            }
        }

        messagesContainer.appendChild(messageDiv);
        scrollToBottom();
    }

    function formatBotMessage(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
    }

    function createRichCard(data) {
        if (!data.data) return null;

        const card = document.createElement('div');
        card.className = 'message-card';

        if (data.data.capper) {
            const capper = data.data.capper;
            card.innerHTML = `
                <div class="card-header">
                    <div class="card-icon">👤</div>
                    <div class="card-title">${capper.name || 'Unknown Capper'}</div>
                </div>
                <div class="card-content">
                    <strong>${capper.currentStats?.winPercentage || 0}% Win Rate</strong> • 
                    ${capper.currentStats?.unitsProfit || 0} Units Profit<br>
                    <em>${capper.specialties ? capper.specialties.join(', ') : 'All Sports'}</em>
                </div>
                <div class="card-actions">
                    <div class="card-action" onclick="chatWidget.sendMessage('${capper.name} packages')">View Packages</div>
                    <div class="card-action" onclick="chatWidget.sendMessage('${capper.name} recent stats')">Recent Stats</div>
                </div>
            `;
        }
        else if (data.data.packages) {
            const packages = data.data.packages.slice(0, 3);
            const packageList = packages.map(pkg =>
                `<div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>${pkg.title || pkg.name || 'Unknown Package'}</span>
                    <strong>$${pkg.price || 0}</strong>
                </div>`
            ).join('');

            card.innerHTML = `
                <div class="card-header">
                    <div class="card-icon">📦</div>
                    <div class="card-title">Package Options</div>
                </div>
                <div class="card-content">
                    ${packageList}
                </div>
                <div class="card-actions">
                    <div class="card-action" onclick="chatWidget.sendMessage('more package details')">More Details</div>
                    <div class="card-action" onclick="chatWidget.sendMessage('show all packages')">View All</div>
                </div>
            `;
        }
        else if (data.data.topPerformers) {
            const performers = data.data.topPerformers.slice(0, 3);
            const performerList = performers.map((p, i) =>
                `<div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                    <span>${i + 1}. ${p.name || 'Unknown'}</span>
                    <span>${p.winRate || 0}%</span>
                </div>`
            ).join('');

            card.innerHTML = `
                <div class="card-header">
                    <div class="card-icon">📊</div>
                    <div class="card-title">Top Performers</div>
                </div>
                <div class="card-content">
                    ${performerList}
                </div>
                <div class="card-actions">
                    <div class="card-action" onclick="chatWidget.sendMessage('detailed comparison')">Full Comparison</div>
                    <div class="card-action" onclick="chatWidget.sendMessage('recent performance')">Recent Form</div>
                </div>
            `;
        }

        return card.innerHTML ? card : null;
    }

    function showTypingIndicator() {
        isTyping = true;
        sendButton.disabled = true;

        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `
            <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
            <div class="typing-text">AI is thinking...</div>
        `;

        messagesContainer.appendChild(typingDiv);
        scrollToBottom();
    }

    function hideTypingIndicator() {
        isTyping = false;
        sendButton.disabled = false;

        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    function updateQuickActions(actions) {
        if (!actions || actions.length === 0) return;

        quickActions.innerHTML = '';
        actions.forEach(action => {
            const actionDiv = document.createElement('div');
            actionDiv.className = 'quick-action';
            actionDiv.textContent = action;
            actionDiv.dataset.action = action;
            quickActions.appendChild(actionDiv);
        });
    }

    function scrollToBottom() {
        setTimeout(() => {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 100);
    }

    return {
        init,
        sendMessage
    };
})();

document.addEventListener('DOMContentLoaded', () => {
    try {
        chatWidget.init();
    } catch (error) {
        console.error('Failed to initialize chat widget:', error);
    }
});