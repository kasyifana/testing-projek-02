'use client';

import { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Send } from 'lucide-react';

export function ChatBot() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'system', content: 'Hai! Saya asisten AI yang siap membantu menjawab pertanyaan Anda.' }
  ]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message
    const updatedMessages = [
      ...messages,
      { role: 'user', content: input }
    ];
    
    setMessages(updatedMessages);
    setInput('');
    
    // Simulate AI response (in a real app, this would be an API call)
    setTimeout(() => {
      setMessages([
        ...updatedMessages,
        { 
          role: 'system', 
          content: `Terima kasih atas pertanyaan Anda. ${getRandomResponse()}`
        }
      ]);
    }, 1000);
  };
  
  // Helper function to generate random responses
  const getRandomResponse = () => {
    const responses = [
      "Apakah ada hal lain yang ingin Anda tanyakan?",
      "Semoga jawaban ini membantu Anda.",
      "Jika masih ada pertanyaan, silakan tanyakan kepada saya.",
      "Saya siap menjawab pertanyaan lainnya.",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="bg-slate-100 rounded-lg p-4 h-[350px] overflow-y-auto flex flex-col space-y-4">
        {messages.map((message, index) => (
          <div 
            key={index}
            className={`p-3 rounded-lg max-w-[80%] ${
              message.role === 'user' 
                ? 'bg-primary text-white self-end' 
                : 'bg-white border self-start'
            }`}
          >
            {message.content}
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ketik pertanyaan Anda di sini..."
          className="flex-1"
        />
        <Button type="submit">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
