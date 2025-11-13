import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, ChevronDown, Smile, Paperclip, Settings } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi there! Nice to see you 👋. I am so happy that help you choose suitable scholarships',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInputValue('');

    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "Cool! What's your email address then?",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const handleQuickReply = (reply: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text: reply,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages([...messages, newMessage]);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-6 w-14 h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 z-50"
        style={{ bottom: 'calc(1.5rem + 30px)' }}
        aria-label="Open chat"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed right-6 z-50" style={{ bottom: 'calc(1.5rem + 30px)' }}>
      <div
        className={cn(
          'bg-white rounded-lg shadow-2xl transition-all duration-300',
          isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]',
          'flex flex-col'
        )}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white p-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Avatar */}
            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">SR</span>
            </div>
            
            {/* Name and Status */}
            <div>
              <div className="font-semibold">Chat with</div>
              <div className="text-sm">Scholarship Routing Bot</div>
              <div className="text-xs text-blue-200">We're online</div>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-blue-700 rounded transition-colors"
              aria-label="Minimize"
            >
              <ChevronDown className={cn('w-5 h-5 transition-transform', isMinimized && 'rotate-180')} />
            </button>
            <button
              className="p-1 hover:bg-blue-700 rounded transition-colors"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-blue-700 rounded transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex',
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[80%] rounded-lg p-3 text-sm',
                      message.sender === 'user'
                        ? 'bg-blue-900 text-white'
                        : 'bg-white text-gray-800 shadow-sm'
                    )}
                  >
                    {message.text}
                  </div>
                </div>
              ))}

              {/* Quick Reply Buttons */}
              {messages.length === 1 && (
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => handleQuickReply('Yes, sure!')}
                    className="px-6 py-2 bg-blue-900 text-white rounded-full text-sm font-medium hover:bg-blue-800 transition-colors"
                  >
                    Yes, sure!
                  </button>
                  <button
                    onClick={() => handleQuickReply('No, thanks.')}
                    className="px-6 py-2 bg-white text-blue-900 border-2 border-blue-900 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    No, thanks.
                  </button>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-200 rounded-b-lg">
              <div className="flex items-center space-x-2">
                <button
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Emoji"
                >
                  <Smile className="w-5 h-5 text-gray-500" />
                </button>
                <button
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Attach"
                >
                  <Paperclip className="w-5 h-5 text-gray-500" />
                </button>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Enter your message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <button
                  onClick={handleSend}
                  className="p-3 bg-blue-900 text-white rounded-full hover:bg-blue-800 transition-colors"
                  aria-label="Send"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
