import { useState, useRef, useEffect } from 'react';
import {
  MessageCircle,
  X,
  ChevronDown,
  Settings,
  Check,
  Zap,
  Sparkles,
  History,
  MessageSquarePlus,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { env } from '@/config/env';
import { useUser } from '@/lib/auth';
import { useNavigate } from 'react-router';
import { paths } from '@/config/paths';
import { Message } from './chatbox-base';
import { ChatboxBasic } from './chatbox-basic';
import { ChatboxPro } from './chatbox-pro';
import './chatbot.css';

type ChatbotPlan = 'basic' | 'pro';

const CHATBOT_STORAGE_KEY = 'chatbot_state';

export function Chatbot() {
  const user = useUser();
  const navigate = useNavigate();
  
  // Initialize state from localStorage
  const [isOpen, setIsOpen] = useState(() => {
    try {
      const saved = localStorage.getItem(CHATBOT_STORAGE_KEY);
      return saved ? JSON.parse(saved).isOpen : false;
    } catch {
      return false;
    }
  });
  
  const [showPlanSelection, setShowPlanSelection] = useState(() => {
    try {
      const saved = localStorage.getItem(CHATBOT_STORAGE_KEY);
      return saved ? JSON.parse(saved).showPlanSelection : false;
    } catch {
      return false;
    }
  });
  
  const [selectedPlan, setSelectedPlan] = useState<ChatbotPlan | null>(() => {
    try {
      const saved = localStorage.getItem(CHATBOT_STORAGE_KEY);
      return saved ? JSON.parse(saved).selectedPlan : null;
    } catch {
      return null;
    }
  });
  
  const [isMinimized, setIsMinimized] = useState(() => {
    try {
      const saved = localStorage.getItem(CHATBOT_STORAGE_KEY);
      return saved ? JSON.parse(saved).isMinimized : false;
    } catch {
      return false;
    }
  });
  
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(CHATBOT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.messages && Array.isArray(parsed.messages)) {
          return parsed.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }));
        }
      }
    } catch (error) {
      console.error('Failed to load messages from localStorage:', error);
    }
    return [
      {
        id: '1',
        text: 'Hi there! Nice to see you 👋. I am so happy that help you choose suitable scholarships',
        sender: 'bot',
        timestamp: new Date(),
      },
    ];
  });
  
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [useProfile, setUseProfile] = useState(() => {
    try {
      const saved = localStorage.getItem(CHATBOT_STORAGE_KEY);
      return saved ? JSON.parse(saved).useProfile ?? false : false;
    } catch {
      return false;
    }
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentQueryRef = useRef<string>('');
  const loadingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      const state = {
        isOpen,
        showPlanSelection,
        selectedPlan,
        isMinimized,
        messages,
        useProfile,
      };
      localStorage.setItem(CHATBOT_STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save chatbot state:', error);
    }
  }, [isOpen, showPlanSelection, selectedPlan, isMinimized, messages, useProfile]);

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
    if (loadingIntervalRef.current) {
      clearInterval(loadingIntervalRef.current);
      loadingIntervalRef.current = null;
    }
    setIsThinking(false);
    setLoadingStage(0);
    
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

  const handleQuickReply = (reply: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text: reply,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
    sendBotRequest(reply); 
  };

  const handleViewScholarshipDetails = (scholarshipId: string) => {
    navigate(paths.app.scholarshipDetail.getHref(scholarshipId));
  };

  const handleAskScholarship = (scholarshipName: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text: "Tell me more about " + scholarshipName,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
    sendBotRequest(scholarshipName);
  };

  const handleScholarshipNameClick = (scholarshipName: string, scholarshipId?: string) => {
    if (scholarshipId) {
      return;
    }
    handleAskScholarship(scholarshipName);
  };

  const handleNewChat = () => {
    // Reset messages to initial welcome message
    setMessages([
      {
        id: Date.now().toString(),
        text: 'Hi! I am a Scholarship Routing virtual assistant. How would you like me to help you today?',
        sender: 'bot',
        timestamp: new Date(),
      },
    ]);
    // Clear input
    setInputValue('');
    // Reset thinking state
    setIsThinking(false);
    setLoadingStage(0);
    // Clear any ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (loadingIntervalRef.current) {
      clearInterval(loadingIntervalRef.current);
      loadingIntervalRef.current = null;
    }
  };
  
  const sendBotRequest = async (query: string) => {
    if (isThinking) return;

    currentQueryRef.current = query;
    setIsThinking(true);
    setLoadingStage(1);

    abortControllerRef.current = new AbortController();

    loadingIntervalRef.current = setInterval(() => {
      setLoadingStage(prev => {
        if (prev < 4) return prev + 1;
        return prev;
      });
    }, 3000);

    try {
      const response = await fetch(`${env.API_URL}/chatbot/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query,
          plan: selectedPlan,
          user_id: user.data?.uid || null,
          use_profile: selectedPlan === 'pro' ? useProfile : false
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error('Failed to get response from chatbot');
      }

      const data = await response.json();

      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
        loadingIntervalRef.current = null;
      }

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: data.answer || 'Sorry, I could not process your request.',
        sender: 'bot',
        timestamp: new Date(),
        scholarship_names: data.scholarship_names,
        scholarships: data.scholarships || (data.scholarship_names && data.scholarship_ids 
          ? data.scholarship_names.map((name: string, idx: number) => ({
              name,
              id: data.scholarship_ids[idx]
            }))
          : undefined),
      };
      setMessages(prev => [...prev, botResponse]);
    } catch (error: any) {
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
        loadingIntervalRef.current = null;
      }

      if (error.name === 'AbortError') {
        console.log('Request was aborted');
        return;
      }
      
      console.error('Error sending message to chatbot:', error);
      
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again later.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsThinking(false);
      setLoadingStage(0);
      abortControllerRef.current = null;
      currentQueryRef.current = '';
    }
  }
  
  const handleSend = () => {
    if (!inputValue.trim() || isThinking) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    const query = inputValue;
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    sendBotRequest(query);
  };


  if (!isOpen) {
    return (
      <div className="chatbot-floating-button-container fixed right-6 z-50 group" style={{ bottom: 'calc(1.5rem + 30px)' }}>
        {/* Tooltip */}
        <div className="absolute bottom-20 right-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 max-sm:hidden">
          <div className="bg-white px-6 py-5 rounded-3xl shadow-xl border border-gray-100 min-w-[320px]">
            <div className="flex items-start gap-3 mb-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                <img src="/Logo.png" alt="ScholarBot Logo" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <div className="text-blue-500 font-semibold text-lg mb-2">ScholarBot Chat</div>
                <div className="text-gray-600 text-sm leading-relaxed">
                  👋 Hi, I am your assistant to help you choose suitable scholarships
                </div>
              </div>
            </div>
            <div className="space-y-3 flex flex-col items-end">
              <button
                onClick={() => {
                  setIsOpen(true);
                  setShowPlanSelection(true);
                }}
                className="py-2.5 px-6 bg-white hover:bg-purple-600 text-purple-600 hover:text-white border-2 border-purple-600 hover:border-purple-600 text-sm font-medium rounded-full transition-all duration-200 pointer-events-auto"
              >
                Schedule a consultation
              </button>
              <button
                onClick={() => {
                  setIsOpen(true);
                  setShowPlanSelection(true);
                }}
                className="py-2.5 px-6 bg-white hover:bg-purple-600 text-purple-600 hover:text-white border-2 border-purple-600 hover:border-purple-600 text-sm font-medium rounded-full transition-all duration-200 pointer-events-auto"
              >
                Contact for a quote
              </button>
              <button
                onClick={() => {
                  setIsOpen(true);
                  setShowPlanSelection(true);
                }}
                className="py-2.5 px-6 bg-white hover:bg-purple-600 text-purple-600 hover:text-white border-2 border-purple-600 hover:border-purple-600 text-sm font-medium rounded-full transition-all duration-200 pointer-events-auto"
              >
                Consultation support
              </button>
            </div>
            {/* Arrow pointing down to the button */}
            <div className="absolute bottom-[-8px] right-6 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white"></div>
            <div className="absolute bottom-[-9px] right-6 w-0 h-0 border-l-[9px] border-l-transparent border-r-[9px] border-r-transparent border-t-[9px] border-t-gray-100"></div>
          </div>
        </div>
        
        <button
          onClick={() => {
            setIsOpen(true);
            setShowPlanSelection(true);
          }}
          className="w-14 h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
          aria-label="Open chat"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>
    );
  }

  // Plan Selection Screen
  if (showPlanSelection) {
    return (
      <div className="scholarship-routing-chat-pro-container fixed right-6 z-50" style={{ bottom: 'calc(1.5rem + 30px)' }}>
        <div className="scholarship-routing-chat-pro bg-white rounded-lg shadow-2xl w-[460px] flex flex-col">
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
                      <div className="text-3xl font-bold text-gray-900">Free</div>
                      <div className="text-sm text-gray-500">0 VND/month</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Suitable for answering quick and simple questions.
                  </p>
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-700">
                      <Check className="w-4 h-4 text-green-600 mr-2" />
                      <span>Limited to 10 queries</span>
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
                      <div className="text-3xl font-bold text-purple-600">130.000₫</div>
                      <div className="text-sm font-semibold text-purple-500">($5) /month</div>
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
    <div className="scholarship-routing-chat-pro-container fixed right-6 z-50" style={{ bottom: 'calc(1.5rem + 30px)' }}>
      <div
        className={cn(
          'scholarship-routing-chat-pro bg-white rounded-lg shadow-2xl transition-all duration-300',
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
              onClick={handleNewChat}
              className="p-1 hover:bg-blue-700 rounded transition-colors"
              aria-label="New Chat"
              title="New Chat"
            >
              <MessageSquarePlus className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                // TODO: Implement chat history functionality
                console.log('Show chat history');
              }}
              className="p-1 hover:bg-blue-700 rounded transition-colors"
              aria-label="Chat History"
              title="Chat History"
            >
              <History className="w-5 h-5" />
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
            {selectedPlan === 'basic' ? (
              <ChatboxBasic
                messages={messages}
                inputValue={inputValue}
                isThinking={isThinking}
                loadingStage={loadingStage}
                messagesEndRef={messagesEndRef}
                onInputChange={setInputValue}
                onSend={handleSend}
                onStop={handleStop}
                onQuickReply={handleQuickReply}
                onViewScholarshipDetails={handleViewScholarshipDetails}
                onAskScholarship={handleAskScholarship}
                onScholarshipNameClick={handleScholarshipNameClick}
              />
            ) : (
              <ChatboxPro
                messages={messages}
                inputValue={inputValue}
                isThinking={isThinking}
                loadingStage={loadingStage}
                messagesEndRef={messagesEndRef}
                onInputChange={setInputValue}
                onSend={handleSend}
                onStop={handleStop}
                onQuickReply={handleQuickReply}
                onViewScholarshipDetails={handleViewScholarshipDetails}
                onAskScholarship={handleAskScholarship}
                onScholarshipNameClick={handleScholarshipNameClick}
                useProfile={useProfile}
                onUseProfileChange={setUseProfile}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}