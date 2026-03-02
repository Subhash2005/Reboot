"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, Sparkles, Mail } from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    isAction?: boolean;
    actionType?: 'navigate' | 'mail';
    actionPayload?: string;
    previewUrl?: string;
}

export default function AiAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', text: "Hello! I am your Reboot AI Assistant. How can I help you navigate the site, understand our workflow, or get started? (Ask me to 'mail' instructions if you want a copy!)", sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [waitingForEmail, setWaitingForEmail] = useState(false);
    const [pendingContext, setPendingContext] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input.trim();
        setInput('');

        const newMsg: Message = { id: Math.random().toString(36).substring(2, 9), text: userMsg, sender: 'user' };
        setMessages(prev => [...prev, newMsg]);

        if (waitingForEmail) {
            // Assume the user is providing an email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailRegex.test(userMsg)) {
                setUserEmail(userMsg);
                setWaitingForEmail(false);
                await processBackendQuery(pendingContext, userMsg);
            } else {
                setMessages(prev => [...prev, { id: Math.random().toString(36).substring(2, 9), text: "That doesn't look like a valid email. Please provide your email address, or type 'cancel'.", sender: 'bot' }]);
                if (userMsg.toLowerCase() === 'cancel') {
                    setWaitingForEmail(false);
                }
            }
            return;
        }

        const isMailRequest = userMsg.toLowerCase().includes('mail') || userMsg.toLowerCase().includes('email');

        if (isMailRequest && !userEmail) {
            setPendingContext(userMsg);
            setWaitingForEmail(true);
            setMessages(prev => [...prev, { id: Math.random().toString(36).substring(2, 9), text: "I can email the steps to you! Please reply with your email address.", sender: 'bot' }]);
            return;
        }

        await processBackendQuery(userMsg, isMailRequest ? userEmail : undefined);
    };

    const processBackendQuery = async (query: string, email?: string) => {
        setMessages(prev => [...prev, { id: 'temp-loading', text: "Thinking...", sender: 'bot' }]);

        try {
            const res = await axios.post('http://localhost:5000/api/ai/chat', {
                query,
                email
            });

            setMessages(prev => prev.filter(m => m.id !== 'temp-loading'));

            const botMsg: Message = {
                id: Math.random().toString(36).substring(2, 9),
                text: res.data.message,
                sender: 'bot',
                previewUrl: res.data.previewUrl
            };
            setMessages(prev => [...prev, botMsg]);

            if (res.data.action === 'navigate' && res.data.route) {
                setTimeout(() => {
                    router.push(res.data.route);
                    setIsOpen(false);
                }, 2000);
            }

        } catch (error) {
            setMessages(prev => prev.filter(m => m.id !== 'temp-loading'));
            setMessages(prev => [...prev, { id: Math.random().toString(36).substring(2, 9), text: "I'm having trouble connecting to my neural network right now. Please try again later.", sender: 'bot' }]);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="bg-[#0f172a] border border-white/10 rounded-2xl w-[350px] shadow-2xl overflow-hidden mb-4 flex flex-col"
                        style={{ height: '500px' }}
                    >
                        {/* Header */}
                        <div className="bg-primary/10 p-4 border-b border-primary/20 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/40">
                                    <Sparkles className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-sm tracking-tight">Reboot AI Guide</h3>
                                    <div className="flex items-center space-x-1">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                        <span className="text-[10px] text-foreground/50 uppercase tracking-widest font-black">Online</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-foreground/40 hover:text-white transition-colors p-1">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Chat Area */}
                        <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar bg-black/20">
                            {messages.map(msg => (
                                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-2xl p-3 text-sm flex space-x-2 relative group ${msg.sender === 'user'
                                        ? 'bg-primary text-white rounded-tr-sm'
                                        : 'bg-white/5 border border-white/10 text-white/90 rounded-tl-sm'
                                        }`}>
                                        {msg.sender === 'bot' && (
                                            <div className="absolute -left-10 top-0 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Bot className="w-4 h-4 text-primary" />
                                            </div>
                                        )}
                                        {msg.id === 'temp-loading' ? (
                                            <div className="flex space-x-1 items-center h-4 px-2">
                                                <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" />
                                                <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                                <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                                            </div>
                                        ) : (
                                            <div className="flex flex-col">
                                                <span>{msg.text}</span>
                                                {msg.previewUrl && (
                                                    <a href={msg.previewUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center space-x-2 px-3 py-1.5 bg-primary/20 hover:bg-primary/40 border border-primary/50 text-white text-xs font-bold rounded-lg transition-colors w-fit">
                                                        <Mail className="w-3 h-3" />
                                                        <span>View Sent Email</span>
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSend} className="p-4 border-t border-white/5 bg-[#0f172a]">
                            <div className="relative flex items-center">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={waitingForEmail ? "Type your email..." : "Ask me anything..."}
                                    className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-primary transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim()}
                                    className="absolute right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                                >
                                    {waitingForEmail ? <Mail className="w-4 h-4" /> : <Send className="w-4 h-4 ml-0.5" />}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-110 transition-transform relative"
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                            <X className="w-8 h-8 text-white relative z-10" />
                        </motion.div>
                    ) : (
                        <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                            <MessageSquare className="w-8 h-8 text-white relative z-10" />
                            <div className="absolute top-0 right-0 w-4 h-4 bg-rose-500 rounded-full border-2 border-[#0a0f1d] z-20" />
                        </motion.div>
                    )}
                </AnimatePresence>
                {!isOpen && (
                    <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-20" />
                )}
            </button>
        </div>
    );
}
