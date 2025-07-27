const API_KEY = 'ANY_API'; // Hidden temporarily for security purposes

// Theme state
let isDarkTheme = true;

function formatResponse(text) {
    // Handle code blocks
    text = text.replace(/```([^`]*?)```/g, (match, code) => {
        return `<pre class="code-block"><code>${code.trim()}</code></pre>`;
    });

    // Handle inline code
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Handle bullet points
    text = text.replace(/^\s*[-*]\s(.+)$/gm, '<li>$1</li>');
    text = text.replace(/(<li>.*?<\/li>)/gs, '<ul>$1</ul>');

    // Handle numbered lists
    text = text.replace(/^\d+\.\s(.+)$/gm, '<li>$1</li>');
    text = text.replace(/(<li>.*?<\/li>)/gs, '<ol>$1</ol>');

    // Handle bold text
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Handle italic text
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Handle paragraphs
    text = text.split('\n\n').map(para => `<p>${para.trim()}</p>`).join('');

    return text;
}

function displayMessage(message, className) {
    const chatDisplay = document.getElementById("chatDisplay");
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${className}`;
    
    if (className === "botMessage") {
        messageDiv.innerHTML = formatResponse(message);
    } else {
        messageDiv.textContent = message;
    }
    
    chatDisplay.appendChild(messageDiv);
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
}

async function getBotResponse(userInput) {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: userInput
                    }]
                }]
            })
        });

        const data = await response.json();
        console.log('API Response:', data);

        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        } else {
            console.error('Unexpected response structure:', data);
            throw new Error('Invalid response format');
        }
    } catch (error) {
        console.error('Error details:', error);
        return 'Sorry, I could not process your request. Please try again.';
    }
}

async function handleUserMessage() {
    const userInput = document.getElementById("userInput").value.trim();
    if (!userInput) return;

    displayMessage(userInput, "userMessage");
    document.getElementById("userInput").value = "";

    displayMessage("Thinking...", "botMessage");

    try {
        const botResponse = await getBotResponse(userInput);
        const chatDisplay = document.getElementById("chatDisplay");
        chatDisplay.removeChild(chatDisplay.lastChild);
        displayMessage(botResponse, "botMessage");
    } catch (error) {
        const chatDisplay = document.getElementById("chatDisplay");
        chatDisplay.removeChild(chatDisplay.lastChild);
        displayMessage("Sorry, an error occurred. Please try again.", "botMessage");
    }
}

function clearChat() {
    const chatDisplay = document.getElementById("chatDisplay");
    chatDisplay.innerHTML = '';
    displayMessage("Chat cleared. How can I help you?", "botMessage");
}

function toggleTheme() {
    isDarkTheme = !isDarkTheme;
    const body = document.body;
    const appContainer = document.getElementById("appContainer");
    const sidebar = document.getElementById("sidebar");
    const mainChat = document.getElementById("mainChat");
    const chatHeader = document.getElementById("chatHeader");
    const inputContainer = document.getElementById("inputContainer");

    if (isDarkTheme) {
        // Enhanced Dark theme
        body.style.background = 'linear-gradient(135deg, #1a1c2e, #2d3047, #1a1c2e)';
        appContainer.style.background = 'rgba(30, 32, 50, 0.95)';
        sidebar.style.background = 'rgba(25, 27, 42, 0.95)';
        mainChat.style.background = 'rgba(35, 37, 54, 0.95)';
        chatHeader.style.background = 'rgba(25, 27, 42, 0.95)';
        inputContainer.style.background = 'rgba(25, 27, 42, 0.95)';

        // Reset text colors for dark theme
        document.querySelectorAll('.feature-btn, #modelSelector, #userInput').forEach(element => {
            element.style.color = '#fff';
        });
        document.querySelectorAll('h2, .toolbar-btn').forEach(element => {
            element.style.color = '#fff';
        });
        document.querySelectorAll('.message').forEach(element => {
            if (element.classList.contains('botMessage')) {
                element.style.color = '#e1e1e6';
            }
        });
        document.querySelector('#modelSelector').style.backgroundColor = 'rgba(45, 47, 65, 0.95)';
        document.querySelector('#inputWrapper').style.backgroundColor = 'rgba(45, 47, 65, 0.95)';
    } else {
        // Enhanced Light theme
        body.style.background = 'linear-gradient(135deg, #f5f7fa, #e4e9f2, #f5f7fa)';
        appContainer.style.background = 'rgba(255, 255, 255, 0.95)';
        sidebar.style.background = 'rgba(245, 247, 250, 0.95)';
        mainChat.style.background = 'rgba(250, 251, 254, 0.95)';
        chatHeader.style.background = 'rgba(245, 247, 250, 0.95)';
        inputContainer.style.background = 'rgba(245, 247, 250, 0.95)';

        // Adjust text colors for light theme
        document.querySelectorAll('.feature-btn, #modelSelector, #userInput').forEach(element => {
            element.style.color = '#2d3047';
        });
        document.querySelectorAll('h2, .toolbar-btn').forEach(element => {
            element.style.color = '#2d3047';
        });
        document.querySelectorAll('.message').forEach(element => {
            if (element.classList.contains('botMessage')) {
                element.style.color = '#2d3047';
            }
        });
        document.querySelector('#modelSelector').style.backgroundColor = 'rgba(228, 233, 242, 0.95)';
        document.querySelector('#inputWrapper').style.backgroundColor = 'rgba(228, 233, 242, 0.95)';
    }

    // Preserve user message styling
    document.querySelectorAll('.userMessage').forEach(element => {
        element.style.color = '#fff';
    });
}

function setMode(mode) {
    const modeMessages = {
        'creative': "Creative mode activated! Feel free to explore your imagination.",
        'professional': "Professional mode activated. How can I assist you with your work?",
        'technical': "Technical mode activated. Ready for coding and technical discussions."
    };
    
    displayMessage(modeMessages[mode], "botMessage");
}

// Event listeners
document.getElementById("sendButton").addEventListener("click", handleUserMessage);
document.getElementById("userInput").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        handleUserMessage();
    }
});

document.querySelector('.toolbar-btn:first-child').addEventListener("click", clearChat);
document.querySelector('.toolbar-btn:last-child').addEventListener("click", toggleTheme);
function exportChat() {
    // Get all messages from chat display
    const chatDisplay = document.getElementById("chatDisplay");
    const messages = chatDisplay.getElementsByClassName("message");
    
    // Format messages for export
    let exportText = "";
    const timestamp = new Date().toLocaleString();
    
    exportText += "Chat History - Exported on " + timestamp + "\n\n";
    
    for (const message of messages) {
        if (message.classList.contains("userMessage")) {
            exportText += "User: " + message.textContent + "\n\n";
        } else if (message.classList.contains("botMessage")) {
            // Strip HTML tags for bot messages
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = message.innerHTML;
            const textContent = tempDiv.textContent || tempDiv.innerText || "";
            exportText += "Assistant: " + textContent.trim() + "\n\n";
        }
    }
    
    // Create blob and download
    const blob = new Blob([exportText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "chat-history.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// PR from main account: Vatsal-R
