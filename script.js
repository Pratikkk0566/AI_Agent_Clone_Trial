class SmartAssistant {
    constructor() {
        this.conversation = [];
        this.isTyping = false;
        this.initializeElements();
        this.attachEventListeners();
        this.focusInput();
    }

    initializeElements() {
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.messageForm = document.getElementById('messageForm');
        this.loading = document.getElementById('loading');
    }

    attachEventListeners() {
        // Form submission
        this.messageForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendMessage();
        });

        // Send button click
        this.sendButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.sendMessage();
        });

        // Enter key handling
        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Input focus styling
        this.messageInput.addEventListener('focus', () => {
            this.messageInput.parentElement.style.transform = 'translateY(-2px)';
        });

        this.messageInput.addEventListener('blur', () => {
            this.messageInput.parentElement.style.transform = 'translateY(0)';
        });
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message || this.isTyping) return;

        this.isTyping = true;
        this.setInputState(false);
        
        // Add user message
        this.addMessage(message, 'user');
        
        // Clear input
        this.messageInput.value = '';
        
        // Show loading
        this.showLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    conversation: this.conversation
                })
            });

            const data = await response.json();

            if (data.success) {
                // Simulate typing delay for better UX
                await this.delay(800);
                this.addMessage(data.response, 'assistant');
            } else {
                this.addMessage('Sorry, I encountered an error. Please try again.', 'assistant', true);
            }

        } catch (error) {
            console.error('Error:', error);
            this.addMessage('Sorry, I\'m having trouble connecting. Please check your internet and try again.', 'assistant', true);
        } finally {
            this.showLoading(false);
            this.setInputState(true);
            this.isTyping = false;
            this.focusInput();
        }
    }

    addMessage(content, role, isError = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}-message`;
        
        // Create avatar
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';
        
        if (role === 'assistant') {
            avatarDiv.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2Z" fill="currentColor"/>
                </svg>
            `;
        } else {
            avatarDiv.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
                </svg>
            `;
        }

        // Create content
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        if (isError) {
            contentDiv.style.background = 'rgba(255, 107, 107, 0.2)';
            contentDiv.style.borderColor = 'rgba(255, 107, 107, 0.4)';
        }

        const textDiv = document.createElement('div');
        textDiv.className = 'message-text';
        textDiv.textContent = content;

        contentDiv.appendChild(textDiv);
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);

        this.chatMessages.appendChild(messageDiv);

        // Add to conversation history (but not error messages)
        if (!isError) {
            this.conversation.push({ role, content });
        }

        // Scroll to bottom
        this.scrollToBottom();
    }

    showLoading(show) {
        this.loading.style.display = show ? 'block' : 'none';
        if (show) {
            this.scrollToBottom();
        }
    }

    setInputState(enabled) {
        this.messageInput.disabled = !enabled;
        this.sendButton.disabled = !enabled;
        
        if (enabled) {
            this.messageInput.style.opacity = '1';
            this.sendButton.style.opacity = '1';
        } else {
            this.messageInput.style.opacity = '0.7';
            this.sendButton.style.opacity = '0.7';
        }
    }

    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }

    focusInput() {
        setTimeout(() => {
            this.messageInput.focus();
        }, 100);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the assistant when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Smart Assistant initializing...');
    new SmartAssistant();
    console.log('✨ Smart Assistant ready!');
});