import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Bot, User, Sparkles } from 'lucide-react';

type Message = {
  id: string;
  sender: 'bot' | 'user';
  text: string;
};

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    sender: 'bot',
    text: 'Xin chào! Mình là Trợ lý Sinh viên Smart School Workspace System. Mình có thể giúp bạn giải đáp nội quy trường học, lịch thi, và hướng dẫn sử dụng hệ thống. Bạn cần hỏi gì nào?'
  }
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: inputText };
    
    // We construct the context for OpenAI API
    const apiMessages = messages.map(m => ({
      role: m.sender === 'bot' ? 'assistant' : 'user',
      content: m.text
    }));
    apiMessages.push({ role: 'user', content: inputText });
    
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch");
      }

      const data = await response.json();
      
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: data.reply || "Xin lỗi, hiện tại tôi không thể trả lời."
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
       console.error("Error calling chat API:", error);
       const errorMsg: Message = {
         id: (Date.now() + 1).toString(),
         sender: 'bot',
         text: 'Xin lỗi, hệ thống đang gặp lỗi hoặc bạn chưa cung cấp QWEN_API_KEY trong Setting. Bạn có thể thêm key để kích hoạt tính năng này.'
       };
       setMessages(prev => [...prev, errorMsg]);
     } finally {
       setIsLoading(false);
     }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-20 right-4 sm:bottom-6 sm:right-6 lg:bottom-10 lg:right-10 z-[100] w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 hover:shadow-indigo-500/50 transition-all ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
      >
        <MessageCircle className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full"></span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 lg:bottom-10 lg:right-10 z-[100] w-full sm:w-[400px] h-full sm:h-[600px] sm:max-h-[80vh] bg-white rounded-none sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-100"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg leading-tight flex items-center gap-1">
                    <span className="sm:hidden">Trợ lý ảo Smart School</span>
                    <span className="hidden sm:inline">Trợ lý ảo Smart School Workspace System</span>
                    <Sparkles className="w-3.5 h-3.5 text-yellow-300 shrink-0" />
                  </h3>
                  <p className="text-xs text-indigo-100">Luôn sẵn sàng hỗ trợ 24/7</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-white text-xs shadow-sm ${msg.sender === 'user' ? 'bg-indigo-600' : 'bg-gradient-to-br from-indigo-500 to-purple-600'}`}>
                    {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.sender === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-sm' 
                      : 'bg-white border border-slate-100 text-slate-700 rounded-tl-sm'
                  }`}>
                    {msg.sender === 'user' ? msg.text : renderFormattedText(msg.text)}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 max-w-[85%]">
                  <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-white text-xs shadow-sm bg-gradient-to-br from-indigo-500 to-purple-600 animate-pulse">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-3 rounded-2xl bg-white border border-slate-100 text-slate-500 rounded-tl-sm flex items-center gap-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-slate-100 shrink-0">
              <form onSubmit={handleSend} className="flex gap-2">
                <input 
                  type="text" 
                  value={inputText || ''}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={isLoading ? "Trợ lý đang trả lời..." : "Nhập câu hỏi của bạn..."}
                  disabled={isLoading}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-75"
                />
                <button 
                  type="submit"
                  disabled={!inputText.trim() || isLoading}
                  className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center disabled:opacity-50 hover:bg-indigo-700 transition-colors shrink-0"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

const parseInlineMarkdown = (text: string) => {
  if (!text) return "";
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-bold text-indigo-700 bg-indigo-50/50 px-1 rounded mx-0.5">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
};

const renderFormattedText = (text: string) => {
  if (!text) return null;

  const lines = text.split('\n');

  return (
    <div className="space-y-2 text-slate-700">
      {lines.map((line, idx) => {
        let currentLine = line.trim();

        // Headers
        const headerMatch = currentLine.match(/^(#{1,6})\s+(.*)$/);
        if (headerMatch) {
          const level = headerMatch[1].length;
          const content = parseInlineMarkdown(headerMatch[2]);
          if (level === 1) return <h1 key={idx} className="text-base font-extrabold text-indigo-900 mt-2 mb-1 border-b border-indigo-100 pb-0.5">{content}</h1>;
          if (level === 2) return <h2 key={idx} className="text-sm font-extrabold text-indigo-800 mt-2 mb-1">{content}</h2>;
          return <h3 key={idx} className="text-xs font-bold text-slate-900 mt-1.5 mb-0.5">{content}</h3>;
        }

        // Bullet lists
        const bulletMatch = currentLine.match(/^[-*+]\s+(.*)$/);
        if (bulletMatch) {
          return (
            <div key={idx} className="flex items-start gap-1.5 ml-2 my-1">
              <span className="text-indigo-500 font-bold shrink-0 mt-1">•</span>
              <span className="text-slate-700">{parseInlineMarkdown(bulletMatch[1])}</span>
            </div>
          );
        }

        // Number lists
        const numberMatch = currentLine.match(/^(\d+)\.\s+(.*)$/);
        if (numberMatch) {
          return (
            <div key={idx} className="flex items-start gap-1.5 ml-2 my-1">
              <span className="text-indigo-600 font-bold shrink-0">{numberMatch[1]}.</span>
              <span className="text-slate-700">{parseInlineMarkdown(numberMatch[2])}</span>
            </div>
          );
        }

        // Empty line
        if (line === '') {
          return <div key={idx} className="h-1.5" />;
        }

        // Regular paragraph
        return (
          <p key={idx} className="text-slate-700 leading-relaxed">
            {parseInlineMarkdown(line)}
          </p>
        );
      })}
    </div>
  );
};
