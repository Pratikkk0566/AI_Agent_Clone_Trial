const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Initialize Groq client with API key from environment
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || 'your-groq-api-key-here'
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message, conversation } = req.body;

        console.log('📨 Received message:', message);

        // Check if API key is configured
        if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your-groq-api-key-here') {
            return res.status(400).json({ 
                error: 'API key not configured. Please set GROQ_API_KEY in your .env file.',
                success: false
            });
        }

        // Build conversation context
        const messages = [];
        
        // System prompt for assistant behavior
        messages.push({
            role: 'system',
            content: `You are a helpful, friendly AI assistant. You excel at:
            - Answering common questions about various topics
            - Helping with everyday tasks and problems
            - Providing explanations in simple, clear language
            - Offering practical advice and solutions
            - Being conversational and supportive
            
            Keep responses concise but helpful. Be warm and approachable in your tone.`
        });
        
        // Add conversation history
        if (conversation && conversation.length > 0) {
            conversation.forEach(msg => {
                messages.push({
                    role: msg.role,
                    content: msg.content
                });
            });
        }

        // Add current message
        messages.push({
            role: 'user',
            content: message
        });

        console.log('🔄 Sending to Groq API...');

        // Call Groq API
        const response = await groq.chat.completions.create({
            model: 'llama-3.1-8b-instant',
            messages: messages,
            max_tokens: 800,
            temperature: 0.7,
            top_p: 0.9,
            stream: false
        });

        const aiResponse = response.choices[0].message.content;
        
        console.log('✅ Got AI response');

        res.json({
            response: aiResponse,
            success: true
        });

    } catch (error) {
        console.error('❌ Error calling Groq API:', error);
        res.status(500).json({ 
            error: 'Failed to get AI response',
            details: error.message,
            success: false
        });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log('🚀 ================================');
    console.log(`🤖 Smart Assistant running on http://localhost:${PORT}`);
    console.log('✨ Beautiful glassmorphism interface ready!');
    console.log('🚀 ================================');
});