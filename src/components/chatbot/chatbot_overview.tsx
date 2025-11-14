import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, ChevronDown, Smile, Paperclip, Settings, Check, Zap, Sparkles } from 'lucide-react';
import { cn } from '@/utils/cn';
import { env } from '@/config/env';

type ChatbotPlan = 'basic' | 'pro';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

// Component to render formatted scholarship text
function FormattedScholarshipMessage({ text }: { text: string }) {
  const lines = text.split('\n');
  const elements: JSX.Element[] = [];
  let scholarshipNumber = 0;
  let keyIndex = 0;

  lines.forEach((line) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return;

    // Check if line contains a scholarship name (with or without number and **)
    const scholarshipMatch = trimmedLine.match(/^(?:\d+\.\s*)?\*\*(.+?)\*\*\s*\((.+?)\)/);
    const simpleScholarshipMatch = trimmedLine.match(/^(?:\d+\.\s*)?\*\*(.+?)\*\*/);
    
    if (scholarshipMatch) {
      // Scholarship name with location (e.g., "**Name** (Country)")
      scholarshipNumber++;
      elements.push(  
        <div key={`scholarship-${keyIndex++}`} className="mb-2 mt-3">
          <div className="font-bold text-gray-900">
            {scholarshipNumber}. {scholarshipMatch[1]} ({scholarshipMatch[2]})
          </div>
        </div>
      );
    } else if (simpleScholarshipMatch) {
      // Simple scholarship name (e.g., "**Name**")
      scholarshipNumber++;
      elements.push(
        <div key={`scholarship-${keyIndex++}`} className="mb-2 mt-3">
          <div className="font-bold text-gray-900">
            {scholarshipNumber}. {simpleScholarshipMatch[1]}
          </div>
        </div>
      );
    } else if (trimmedLine.startsWith('*') && trimmedLine.includes(':')) {
      // Attribute line starting with * (e.g., "* **Benefits:** content")
      // Remove leading * and **
      const cleanLine = trimmedLine.replace(/^\*\s*\*\*/, '').replace(/\*\*/, '');
      const colonIndex = cleanLine.indexOf(':');
      
      if (colonIndex > -1) {
        const attributeName = cleanLine.substring(0, colonIndex).trim();
        const attributeContent = cleanLine.substring(colonIndex + 1).trim();
        
        elements.push(
          <div key={`attr-${keyIndex++}`} className="mb-1 text-sm ml-2">
            <span className="font-bold">{attributeName}:</span>
            {attributeContent && <span> {attributeContent}</span>}
          </div>
        );
      }
    } else if (trimmedLine.includes('**') && trimmedLine.includes(':')) {
      // Attribute line with ** markers (e.g., "**Benefits:** content")
      const cleanLine = trimmedLine.replace(/\*\*/g, '');
      const colonIndex = cleanLine.indexOf(':');
      
      if (colonIndex > -1) {
        const attributeName = cleanLine.substring(0, colonIndex).trim();
        const attributeContent = cleanLine.substring(colonIndex + 1).trim();
        
        elements.push(
          <div key={`attr-${keyIndex++}`} className="mb-1 text-sm">
            <span className="font-bold">{attributeName}:</span>
            {attributeContent && <span> {attributeContent}</span>}
          </div>
        );
      }
    } else {
      // Regular text line
      elements.push(
        <div key={`text-${keyIndex++}`} className="mb-1 text-sm">
          {trimmedLine}
        </div>
      );
    }
  });

  return <div className="space-y-0.5">{elements}</div>;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [showPlanSelection, setShowPlanSelection] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<ChatbotPlan | null>(null);
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
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentQueryRef = useRef<string>('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsThinking(false);
    
    // Restore the original query to the input field for editing
    setInputValue(currentQueryRef.current);
    currentQueryRef.current = '';
    
    // Add a message indicating the request was stopped
    const stopMessage: Message = {
      id: Date.now().toString(),
      text: 'Request stopped by user.',
      sender: 'bot',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, stopMessage]);
  };

  const handlePlanSelect = (plan: ChatbotPlan) => {
    setSelectedPlan(plan);
    setShowPlanSelection(false);
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isThinking) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const query = inputValue;
    currentQueryRef.current = query; // Store the query for potential restoration
    setInputValue('');
    setIsThinking(true);

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();

    try {
      // Send POST request to chatbot API with plan information
      const response = await fetch(`${env.API_URL}/chatbot/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query,
          plan: selectedPlan 
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error('Failed to get response from chatbot');
      }

      const data = await response.json();

      // Add bot response with the answer from API
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: data.answer || 'Sorry, I could not process your request.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botResponse]);
    } catch (error: any) {
      // Check if error is due to abort
      if (error.name === 'AbortError') {
        console.log('Request was aborted');
        return;
      }
      
      console.error('Error sending message to chatbot:', error);
      
      // Show error message to user
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again later.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsThinking(false);
      abortControllerRef.current = null;
      currentQueryRef.current = ''; // Clear the stored query after completion
    }
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
        onClick={() => {
          setIsOpen(true);
          setShowPlanSelection(true);
        }}
        className="fixed right-6 w-14 h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 z-50"
        style={{ bottom: 'calc(1.5rem + 30px)' }}
        aria-label="Open chat"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  // Plan Selection Screen
  if (showPlanSelection) {
    return (
      <div className="fixed right-6 z-50" style={{ bottom: 'calc(1.5rem + 30px)' }}>
        <div className="bg-white rounded-lg shadow-2xl w-[460px] flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">SR</span>
              </div>
              <div>
                <div className="font-semibold">Choose Your Plan</div>
                <div className="text-sm text-blue-200">Select a plan to start chatting</div>
              </div>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                setShowPlanSelection(false);
              }}
              className="p-1 hover:bg-blue-700 rounded transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Plan Options */}
          <div className="p-6 space-y-4">
            {/* Basic Plan */}
            <button
              onClick={() => handlePlanSelect('basic')}
              className="w-full text-left p-5 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-bold text-gray-900">Basic</h3>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">Free</div>
                      <div className="text-xs text-gray-500">0 VND/month</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Suitable for answering quick and simple questions.
                  </p>
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-700">
                      <Check className="w-4 h-4 text-green-600 mr-2" />
                      <span>Limited number of queries</span>
                    </div>
                  </div>
                </div>
                <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            </button>

            {/* Pro Plan */}
            <button
              onClick={() => handlePlanSelect('pro')}
              className="w-full text-left p-5 border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg hover:border-purple-500 hover:shadow-md transition-all group relative overflow-hidden"
            >
              <div className="absolute top-2 right-2">
              </div>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      <h3 className="text-lg font-bold text-gray-900">Pro</h3>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-600">119.000₫</div>
                      <div className="text-xs text-gray-500">/month</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Advanced features for comprehensive scholarship search.
                  </p>
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-700">
                      <Check className="w-4 h-4 text-green-600 mr-2" />
                      <span>Unlimited basic queries</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <Check className="w-4 h-4 text-green-600 mr-2" />
                      <span>100 advanced queries per day</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <Check className="w-4 h-4 text-green-600 mr-2" />
                      <span>Integrate personal information</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <Check className="w-4 h-4 text-green-600 mr-2" />
                      <span>Internet Search for latest info</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <Check className="w-4 h-4 text-green-600 mr-2" />
                      <span>Support CV upload for analysis</span>
                    </div>
                  </div>
                </div>
                <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed right-6 z-50" style={{ bottom: 'calc(1.5rem + 30px)' }}>
      <div
        className={cn(
          'bg-white rounded-lg shadow-2xl transition-all duration-300',
          isMinimized ? 'w-80 h-16' : 'w-[460px] h-[600px]',
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
              <div className="flex items-center space-x-2">
                <span className="font-semibold">Chat with</span>
                {selectedPlan && (
                  <span className={cn(
                    "text-xs font-bold px-2 py-0.5 rounded-full",
                    selectedPlan === 'pro' 
                      ? "bg-purple-500 text-white" 
                      : "bg-blue-500 text-white"
                  )}>
                    {selectedPlan.toUpperCase()}
                  </span>
                )}
              </div>
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
              onClick={() => setShowPlanSelection(true)}
              className="p-1 hover:bg-blue-700 rounded transition-colors"
              aria-label="Change Plan"
              title="Change Plan"
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
                    {message.sender === 'bot' ? (
                      <FormattedScholarshipMessage text={message.text} />
                    ) : (
                      message.text
                    )}
                  </div>
                </div>
              ))}

              {/* Thinking indicator */}
              {isThinking && (
                <div className="flex justify-start">
                  <div className="bg-white text-gray-800 shadow-sm rounded-lg p-3 text-sm">
                    <div className="flex items-center space-x-1">
                      <span>Thinking</span>
                      <span className="flex space-x-1">
                        <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                        <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                        <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
                      </span>
                    </div>
                  </div>
                </div>
              )}

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
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Enter your message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                {isThinking ? (
                  <button
                    onClick={handleStop}
                    className="p-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                    aria-label="Stop"
                  >
                    <div className="w-3 h-3 bg-white rounded-sm" />
                  </button>
                ) : (
                  <button
                    onClick={handleSend}
                    className="p-3 bg-blue-900 text-white rounded-full hover:bg-blue-800 transition-colors"
                    aria-label="Send"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
