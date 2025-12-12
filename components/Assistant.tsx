import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import { getGeminiResponse } from '../services/geminiService';
import { COLORS, MESSAGES } from '../config';

const Assistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', text: string}[]>([
    {role: 'assistant', text: MESSAGES.assistant.initialMessage}
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    const response = await getGeminiResponse(userMsg);
    
    setMessages(prev => [...prev, { role: 'assistant', text: response }]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="text-white p-4 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-105"
          style={{ backgroundColor: COLORS.primary[600] }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = COLORS.primary[700])}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = COLORS.primary[600])}
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {isOpen && (
        <div 
          className="bg-white rounded-2xl shadow-2xl w-80 sm:w-96 flex flex-col overflow-hidden"
          style={{ height: '500px', borderColor: COLORS.primary[100], borderWidth: '1px' }}
        >
          {/* Header */}
          <div 
            className="p-4 text-white flex justify-between items-center"
            style={{ backgroundColor: COLORS.primary[700] }}
          >
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5" />
              <span className="font-bold">{MESSAGES.assistant.sendMessage}</span>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="transition-opacity hover:opacity-70"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ backgroundColor: COLORS.secondary[50] }}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                    msg.role === 'user' 
                      ? 'text-white rounded-br-none' 
                      : 'text-stone-700 rounded-bl-none shadow-sm'
                  }`}
                  style={{
                    backgroundColor: msg.role === 'user' ? COLORS.primary[600] : 'white',
                    border: msg.role === 'user' ? 'none' : `1px solid ${COLORS.secondary[200]}`
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div 
                  className="rounded-2xl px-4 py-2 text-sm rounded-bl-none shadow-sm italic"
                  style={{ backgroundColor: 'white', color: COLORS.secondary[500], border: `1px solid ${COLORS.secondary[200]}` }}
                >
                  {MESSAGES.assistant.thinking}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div 
            className="p-3 flex items-center space-x-2 border-t"
            style={{ borderColor: COLORS.secondary[100], backgroundColor: 'white' }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Pergunte sobre pedras..."
              className="flex-1 border-0 rounded-full px-4 py-2 text-sm focus:outline-none"
              style={{ 
                backgroundColor: COLORS.secondary[100],
                '--focus-ring-color': COLORS.primary[500]
              } as React.CSSProperties}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = `0 0 0 2px ${COLORS.primary[500]}`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            <button 
              onClick={handleSend}
              disabled={isLoading}
              className="p-2 text-white rounded-full disabled:opacity-50"
              style={{ backgroundColor: COLORS.primary[600] }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = COLORS.primary[700])}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = COLORS.primary[600])}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assistant;