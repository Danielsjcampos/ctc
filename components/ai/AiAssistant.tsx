import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Mic, Sparkles, Loader2, Bot } from 'lucide-react';
import { sendMessageToAI, ChatMessage } from '../../lib/aiService';
import { supabase } from '../../lib/supabase';
import RobotImage from './support_avatar_v2.png';

const AiAssistant: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [randomBubble, setRandomBubble] = useState<string | null>(null);
    const [customAvatar, setCustomAvatar] = useState<string | null>(null);

    const robotRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Load Custom Avatar
    useEffect(() => {
        // Assuming 'supabase' is imported or available in this scope
        // For example: import { supabase } from '../../lib/supabaseClient';
        // If not, this line will cause an error.
        supabase.from('system_settings').select('ai_avatar_url').single()
            .then(({ data }) => {
                if (data?.ai_avatar_url) setCustomAvatar(data.ai_avatar_url);
            });
    }, []);

    // 1. Mouse Tracking for 3D Effect
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!robotRef.current) return;
            const rect = robotRef.current.getBoundingClientRect();
            const x = e.clientX - (rect.left + rect.width / 2);
            const y = e.clientY - (rect.top + rect.height / 2);
            setMousePos({ x, y });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // 2. Random Messages
    useEffect(() => {
        const phrases = [
            "Dúvidas sobre o acervo?",
            "Precisa renovar o CR?",
            "Conhece as regras de transporte?",
            "Estou aqui para ajudar!",
            "Posso explicar sobre calibres."
        ];

        const interval = setInterval(() => {
            if (!isOpen && Math.random() > 0.7) {
                const text = phrases[Math.floor(Math.random() * phrases.length)];
                setRandomBubble(text);
                setTimeout(() => setRandomBubble(null), 5000);
            }
        }, 15000);

        return () => clearInterval(interval);
    }, [isOpen]);

    // 3. Auto-scroll chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg: ChatMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        // Call AI
        const response = await sendMessageToAI([...messages, userMsg]); // Context awareness

        setMessages(prev => [...prev, { role: 'assistant', content: response?.content || 'Erro no sistema.' }]);
        setLoading(false);
    };

    const calculateRotation = () => {
        const maxX = 20; // Max rotation degrees
        const maxY = 20;

        // Normalize based on window size approx
        const rotX = (mousePos.y / (window.innerHeight / 2)) * -maxX; // Inverted for natural look
        const rotY = (mousePos.x / (window.innerWidth / 2)) * maxY;

        return { rotateX: rotX, rotateY: rotY };
    };

    const { rotateX, rotateY } = calculateRotation();

    // Voice Input (Simple Web Speech API)
    const startListening = () => {
        if ('webkitSpeechRecognition' in window) {
            const recognition = new (window as any).webkitSpeechRecognition();
            recognition.lang = 'pt-BR';
            recognition.start();
            recognition.onresult = (event: any) => {
                setInput(event.results[0][0].transcript);
            };
        } else {
            alert("Seu navegador não suporta reconhecimento de voz.");
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">

            {/* CHAT WINDOW */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="mb-4 w-[350px] md:w-[400px] h-[500px] bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden pointer-events-auto"
                    >
                        {/* Header */}
                        <div className="p-4 bg-gradient-to-r from-red-900/20 to-transparent border-b border-white/5 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-red-600/20 flex items-center justify-center border border-red-500/30">
                                    <Bot className="w-5 h-5 text-red-500" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-white uppercase tracking-wider">EliteBot</h3>
                                    <p className="text-[9px] text-gray-400 uppercase font-bold tracking-widest">Assistente Tático AI</p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-grow p-4 overflow-y-auto custom-scrollbar space-y-4">
                            {messages.length === 0 && (
                                <div className="mt-10 text-center opacity-50">
                                    <Sparkles className="w-10 h-10 mx-auto text-red-500 mb-2" />
                                    <p className="text-xs uppercase font-bold text-gray-500">Como posso ajudar hoje, recruta?</p>
                                </div>
                            )}
                            {messages.map((m, idx) => (
                                <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div
                                        className={`max-w-[80%] p-3 rounded-2xl text-xs md:text-sm font-medium leading-relaxed 
                    ${m.role === 'user'
                                                ? 'bg-red-600 text-white rounded-br-none'
                                                : 'bg-white/10 text-gray-200 rounded-bl-none border border-white/5'}`}
                                    >
                                        {m.content}
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-white/5 p-3 rounded-2xl rounded-bl-none flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                                        <span className="text-[10px] uppercase font-bold text-gray-500">Analisando...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-3 border-t border-white/5 bg-black/20 flex items-center gap-2">
                            <button onClick={startListening} className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-red-500 transition-colors">
                                <Mic size={18} />
                            </button>
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Pergunte sobre armas, leis..."
                                className="flex-grow bg-transparent border-none outline-none text-xs md:text-sm text-white placeholder-gray-600 font-medium"
                            />
                            <button
                                onClick={handleSend}
                                disabled={loading || !input.trim()}
                                className="p-2 bg-red-600 rounded-xl text-white shadow-lg shadow-red-600/20 disabled:opacity-50 hover:bg-red-700 transition-colors"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* AVATAR & BUBBLE */}
            <div className="relative pointer-events-auto" ref={robotRef}>
                <AnimatePresence>
                    {randomBubble && !isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute bottom-full right-0 mb-4 bg-white text-black px-4 py-2 rounded-2xl rounded-br-none shadow-xl min-w-[150px]"
                        >
                            <p className="text-xs font-bold">{randomBubble}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Floating Robot */}
                <motion.button
                    onClick={() => setIsOpen(!isOpen)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative w-24 h-24 focus:outline-none"
                    style={{
                        perspective: 1000
                    }}
                >
                    <motion.div
                        className="w-full h-full drop-shadow-2xl"
                        style={{
                            rotateX: rotateX,
                            rotateY: rotateY,
                            transformStyle: "preserve-3d"
                        }}
                    >
                        <img
                            src={customAvatar || RobotImage}
                            alt="AI Assistant"
                            className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]"
                        />
                        {/* Glowing Eyes Effect Layer (Simulated) */}
                        <div className="absolute top-[35%] left-[25%] w-[15%] h-[15%] bg-cyan-400 rounded-full blur-[2px] opacity-80 animate-pulse mix-blend-screen" />
                        <div className="absolute top-[35%] right-[25%] w-[15%] h-[15%] bg-cyan-400 rounded-full blur-[2px] opacity-80 animate-pulse mix-blend-screen" />
                    </motion.div>
                </motion.button>
            </div>

        </div>
    );
};

export default AiAssistant;
