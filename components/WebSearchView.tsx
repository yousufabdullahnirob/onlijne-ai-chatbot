
import React, { useState } from 'react';
import { ChatMessage as ChatMessageType } from '../types';
import ChatMessage from './ChatMessage';
import Spinner from './Spinner';
import { generateWithSearch } from '../services/geminiService';
import { SendIcon } from './icons';

const WebSearchView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setInput('');

    try {
      const response = await generateWithSearch(input);
      
      const modelMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text,
        groundingChunks: response.chunks,
      };
      setMessages(prev => [...prev, modelMessage]);

    } catch (error) {
      console.error('Error generating web search response:', error);
      const errorMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: 'Sorry, I encountered an error during the web search. Please try again.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-800">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-8">
            <h2 className="text-2xl font-bold">Web Search</h2>
            <p>Ask me anything about recent events or up-to-date information.</p>
          </div>
        )}
        {messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
         {isLoading && (
            <div className="flex justify-center py-4">
              <Spinner />
            </div>
          )}
      </div>
      <div className="p-4 border-t border-gray-700 bg-gray-900">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-center bg-gray-700 rounded-lg p-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 bg-transparent focus:outline-none px-4 text-white"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2 rounded-full bg-indigo-600 text-white disabled:bg-gray-500 disabled:cursor-not-allowed hover:bg-indigo-500 transition-colors"
            >
              {isLoading ? <Spinner /> : <SendIcon className="w-6 h-6" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WebSearchView;
