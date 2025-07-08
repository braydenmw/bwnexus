

import React, { useState, useEffect, useRef } from 'react';
import type { SymbiosisContext, ChatMessage } from '../types';
import { fetchSymbiosisResponse } from '../services/nexusService';
import { CloseIcon, SymbiosisIcon, NexusLogo } from './Icons';
import { marked } from 'marked';

interface SymbiosisChatProps {
  context: SymbiosisContext;
  onClose: () => void;
}

const SymbiosisChat: React.FC<SymbiosisChatProps> = ({ context, onClose }) => {
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const startConversation = async () => {
        setIsLoading(true);
        const initialPrompt = `Let's discuss the strategic implications of this topic: "${context.topic}". The starting context is: "${context.originalContent}". What are the immediate financial risks or opportunities?`;
        
        const initialUserMessage: ChatMessage = { sender: 'user', text: initialPrompt };
        const currentHistory = [initialUserMessage];
        setHistory(currentHistory);

        try {
            const modelResponseText = await fetchSymbiosisResponse(context, currentHistory);
            setHistory(prev => [...prev, { sender: 'ai', text: modelResponseText }]);
        } catch(err) {
            console.error("Chat initialization error:", err);
            const errorMessage = err instanceof Error ? err.message : "Sorry, I encountered an error starting the chat. Please try again.";
            setHistory(prev => [...prev, { sender: 'ai', text: errorMessage }]);
        } finally {
            setIsLoading(false);
        }
    };

    startConversation();
  }, [context]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessageText = message.trim();
    setMessage('');
    
    const updatedHistory: ChatMessage[] = [...history, { sender: 'user', text: userMessageText }];
    setHistory(updatedHistory);
    setIsLoading(true);

    try {
        const modelResponseText = await fetchSymbiosisResponse(context, updatedHistory);
        setHistory(prev => [...prev, { sender: 'ai', text: modelResponseText }]);
    } catch(err) {
        console.error("Chat error:", err);
        const errorMessage = err instanceof Error ? err.message : "Sorry, I encountered an error. Please try again.";
        setHistory(prev => [...prev, { sender: 'ai', text: errorMessage }]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-nexus-bg-start to-nexus-bg-end border border-nexus-border rounded-xl shadow-2xl w-full max-w-2xl h-[90vh] flex flex-col">
        <header className="p-4 flex justify-between items-center border-b border-nexus-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <SymbiosisIcon className="w-8 h-8 text-purple-400" />
            <div>
              <h2 className="text-xl font-bold text-white">Nexus Symbiosis Chat</h2>
              <p className="text-sm text-gray-400 truncate max-w-md">Topic: {context.topic}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white"><CloseIcon className="w-6 h-6"/></button>
        </header>

        <main className="flex-grow p-4 overflow-y-auto space-y-4">
          {history.map((msg, index) => (
             <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
               {msg.sender === 'ai' && <NexusLogo className="w-7 h-7 text-nexus-blue flex-shrink-0 mt-1" />}
               <div className={`rounded-lg px-4 py-2 max-w-lg ${msg.sender === 'user' ? 'bg-nexus-blue text-white' : 'bg-slate-700 text-gray-200'}`}>
                 <div className="prose prose-invert prose-p-my-0" dangerouslySetInnerHTML={{ __html: marked(msg.text) }}></div>
               </div>
             </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3">
                <NexusLogo className="w-7 h-7 text-nexus-blue flex-shrink-0 mt-1 animate-pulse" />
                <div className="rounded-lg px-4 py-2 bg-slate-700 text-gray-200 flex items-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s] mx-1"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </main>

        <footer className="p-4 border-t border-nexus-border flex-shrink-0">
            <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={isLoading ? "Nexus is thinking..." : "Ask a follow-up question..."}
                    disabled={isLoading}
                    className="w-full bg-nexus-dark border border-nexus-border rounded-lg p-3 text-white focus:ring-2 focus:ring-nexus-blue focus:outline-none disabled:opacity-50"
                />
                <button type="submit" disabled={isLoading || !message.trim()} className="bg-nexus-blue hover:bg-sky-400 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
                    Send
                </button>
            </form>
        </footer>
      </div>
    </div>
  );
};

export default SymbiosisChat;