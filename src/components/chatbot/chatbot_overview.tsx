import { useState, useRef, useEffect, Fragment } from 'react';
import {
  MessageCircle,
  X,
  Send,
  ChevronDown,
  Smile,
  Paperclip,
  Settings,
  Check,
  Zap,
  Sparkles,
  History,
  MoreVertical,
  Eye,
  MessageSquare,
  MessageSquarePlus,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { env } from '@/config/env';
import { useUser } from '@/lib/auth';
import { useNavigate } from 'react-router';
import { paths } from '@/config/paths';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown/dropdown';
import './chatbot.css';

type ChatbotPlan = 'basic' | 'pro';

interface ScholarshipInfo {
  name: string;
  id: string;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  scholarship_names?: string[];
  scholarships?: ScholarshipInfo[];
}

// Helper function to parse inline markdown (bold text with **)
function parseInlineMarkdown(text: string): (string | JSX.Element)[] {
  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  let keyIndex = 0;
  
  // Match **text** patterns
  const boldRegex = /\*\*(.+?)\*\*/g;
  let match;
  
  while ((match = boldRegex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    
    // Add bold text
    parts.push(
      <strong key={`bold-${keyIndex++}`} className="font-semibold">
        {match[1]}
      </strong>
    );
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  
  return parts.length > 0 ? parts : [text];
}

// Component to render formatted scholarship text with clickable scholarship names
function FormattedScholarshipMessage({ 
  text, 
  onScholarshipClick,
  onViewDetails,
  scholarships
}: { 
  text: string;
  onScholarshipClick?: (scholarshipName: string) => void;
  onViewDetails?: (scholarshipId: string) => void;
  scholarships?: ScholarshipInfo[];
}) {
  const lines = text.split('\n');
  const elements: JSX.Element[] = [];
  let keyIndex = 0;

  lines.forEach((line) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return;

    // Check if it's a bullet point (starts with *)
    if (trimmedLine.startsWith('*')) {
      // Remove the leading * and trim
      const content = trimmedLine.substring(1).trim();
      
      // Check if this is a scholarship name (contains bold text at the start)
      const scholarshipNameMatch = content.match(/^\*\*([^*]+)\*\*/);
      
      if (scholarshipNameMatch) {
        // This is a scholarship name - make it clickable with dropdown
        const scholarshipName = scholarshipNameMatch[1];
        const restOfContent = content.substring(scholarshipNameMatch[0].length);
        
        // Find the scholarship ID if available
        const scholarship = scholarships?.find(s => s.name === scholarshipName);
        
        elements.push(
          <div key={`line-${keyIndex++}`} className="mb-2 mt-3 text-sm flex">
            <span className="mr-2">•</span>
            <span className="flex-1 flex items-start gap-1">
              {scholarship ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors inline-flex items-center gap-1">
                      {scholarshipName}
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuItem
                      onClick={() => onViewDetails?.(scholarship.id)}
                      className="cursor-pointer"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View scholarship details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onScholarshipClick?.(scholarshipName)}
                      className="cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Ask about scholarship
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <button
                  onClick={() => onScholarshipClick?.(scholarshipName)}
                  className="font-semibold hover:text-blue-800 hover:underline cursor-pointer transition-colors"
                >
                  {scholarshipName}
                </button>
              )}
              {restOfContent && <span>{restOfContent}</span>}
            </span>
          </div>
        );
      } else {
        // This is a detail line - use bullet with left margin indentation (sub-list style)
        elements.push(
          <div key={`line-${keyIndex++}`} className="mb-1 text-sm ml-6 flex">
            <span className="mr-2">•</span>
            <span className="flex-1">{parseInlineMarkdown(content)}</span>
          </div>
        );
      }
    } else {
      // Regular text line with inline markdown support
      elements.push(
        <div key={`line-${keyIndex++}`} className="mb-1 text-sm">
          {parseInlineMarkdown(trimmedLine)}
        </div>
      );
    }
  });

  return <div className="space-y-0.5">{elements}</div>;
}

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
      };
      localStorage.setItem(CHATBOT_STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save chatbot state:', error);
    }
  }, [isOpen, showPlanSelection, selectedPlan, isMinimized, messages]);

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

  const handleSend = async () => {
    if (!inputValue.trim() || isThinking) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: "Tell me more about" +inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const query = inputValue;
    currentQueryRef.current = query; // Store the query for potential restoration
    setInputValue('');
    setIsThinking(true);
    setLoadingStage(1);

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();

    // Progressive loading stages
    loadingIntervalRef.current = setInterval(() => {
      setLoadingStage(prev => {
        if (prev < 4) return prev + 1;
        return prev;
      });
    }, 3000); // Change stage every 3 seconds

    try {
      // Send POST request to chatbot API with plan information and user_id
      const response = await fetch(`${env.API_URL}/chatbot/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query,
          plan: selectedPlan,
          user_id: user.data?.uid || null // Pass user ID for chat history storage
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error('Failed to get response from chatbot');
      }

      const data = await response.json();

      // Clear loading interval when response is received
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
        loadingIntervalRef.current = null;
      }

      // Add bot response with the answer from API
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
      // Clear loading interval on error
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
        loadingIntervalRef.current = null;
      }

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
      setLoadingStage(0);
      abortControllerRef.current = null;
      currentQueryRef.current = ''; // Clear the stored query after completion
    }
  };

  const handleQuickReply = (reply: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text: "Tell me more about " + reply,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
    sendBotRequest(reply); 
  };
  const handleReplyFromSuggestion = (reply: string) => {
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
    handleQuickReply(scholarshipName);
  };

  const handleScholarshipNameClick = (scholarshipName: string, scholarshipId?: string) => {
    // If we have the scholarship ID, we can show options
    // Otherwise, just ask about the scholarship
    if (scholarshipId) {
      // This will be handled by the dropdown in the UI
      return;
    }
    handleQuickReply(scholarshipName);
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
  
  // Tách logic gửi tin nhắn ra hàm riêng
  const sendBotRequest = async (query: string) => {
    if (isThinking) return;

    currentQueryRef.current = query; // Store the query for potential restoration
    setIsThinking(true);
    setLoadingStage(1);

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();

    // Progressive loading stages
    loadingIntervalRef.current = setInterval(() => {
      setLoadingStage(prev => {
        if (prev < 4) return prev + 1;
        return prev;
      });
    }, 3000); // Change stage every 3 seconds

    try {
      // Send POST request to chatbot API with plan information and user_id
      const response = await fetch(`${env.API_URL}/chatbot/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query, // Sử dụng query từ tham số
          plan: selectedPlan,
          user_id: user.data?.uid || null // Pass user ID for chat history storage
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error('Failed to get response from chatbot');
      }

      const data = await response.json();

      // Clear loading interval when response is received
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
        loadingIntervalRef.current = null;
      }

      // Add bot response with the answer from API
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
      // Clear loading interval on error
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
        loadingIntervalRef.current = null;
      }

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
      setLoadingStage(0);
      abortControllerRef.current = null;
      currentQueryRef.current = ''; // Clear the stored query after completion
    }
  }
  
  // SỬA ĐỔI: Cập nhật hàm handleSend gốc để gọi sendBotRequest
  const handleSendFromInput = () => {
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
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message) => (
                // SỬA ĐỔI: Bọc tin nhắn và các button học bổng (nếu có) trong React.Fragment
                // Chuyển 'key' lên Fragment
                <Fragment key={message.id}> 
                  <div
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
                        <FormattedScholarshipMessage 
                          text={message.text} 
                          onScholarshipClick={handleScholarshipNameClick}
                          onViewDetails={handleViewScholarshipDetails}
                          scholarships={message.scholarships}
                        />
                      ) : (
                        message.text
                      )}
                    </div>
                  </div>

                  {/* Scholarship buttons with dropdown menu */}
                  {message.sender === 'bot' && message.scholarships && message.scholarships.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2 justify-start pl-2">
                      {message.scholarships.map((scholarship, index) => (
                        <div key={index} className="flex items-center gap-1 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors">
                          <button
                            onClick={() => handleQuickReply(scholarship.name)}
                            className="px-4 py-1.5 text-blue-800 text-xs font-medium text-left"
                          >
                            {scholarship.name}
                          </button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                className="pr-2 pl-1 py-1.5 text-blue-800 hover:text-blue-900 transition-colors"
                                aria-label="Scholarship options"
                              >
                                <MoreVertical className="w-3.5 h-3.5" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                              <DropdownMenuItem
                                onClick={() => handleViewScholarshipDetails(scholarship.id)}
                                className="cursor-pointer"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View scholarship details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleAskScholarship(scholarship.name)}
                                className="cursor-pointer"
                              >
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Ask scholarships
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Fallback for legacy API responses */}
                  {message.sender === 'bot' && !message.scholarships && message.scholarship_names && message.scholarship_names.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2 justify-start pl-2">
                      {message.scholarship_names.map((name, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuickReply(name)}
                          className="px-4 py-1.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium hover:bg-blue-200 transition-colors text-left"
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  )}

                </Fragment> // KẾT THÚC SỬA ĐỔI
              ))}

              {/* Thinking indicator with progressive stages */}
              {isThinking && (
                <div className="flex justify-start">
                  <div className="bg-white text-gray-800 shadow-sm rounded-lg p-3 text-sm">
                    <div className="flex items-center space-x-1">
                      <span>
                        {loadingStage === 1 && 'Parsing filter user query'}
                        {loadingStage === 2 && 'Querying DB vector'}
                        {loadingStage === 3 && 'Filtering results'}
                        {loadingStage === 4 && 'Generating final results'}
                      </span>
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
                <div className="space-y-3 px-2">
                  <div className="text-xs font-medium text-gray-500 text-center mb-3">
                    Try asking me:
                  </div>
                  <button
                    onClick={() => handleReplyFromSuggestion('Find full-ride Data Science Master\'s scholarships in the US')}
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-gray-800 rounded-xl text-sm text-left border border-blue-200 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md group"
                  >
                    <div className="flex items-start gap-3">
                      <span className="font-semibold text-base mt-0.5 group-hover:scale-110 transition-transform">🎓</span>
                      <span className="flex-1 leading-relaxed">Find full-ride Data Science Master's scholarships in the US</span>
                    </div>
                  </button>
                  <button
                    onClick={() => handleReplyFromSuggestion("Help me find some master's scholarships of Mathematics for women")}
                    className="w-full px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 text-gray-800 rounded-xl text-sm text-left border border-purple-200 hover:border-purple-300 transition-all duration-200 shadow-sm hover:shadow-md group"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-purple-600 font-semibold text-base mt-0.5 group-hover:scale-110 transition-transform">🌍</span>
                      <span className="flex-1 leading-relaxed">Help me find some master's scholarships of Mathematics for women</span>
                    </div>
                  </button>
                  <button
                    onClick={() => handleReplyFromSuggestion('Suggest scholarships suitable for GPA 3.0/4.0')}
                    className="w-full px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 text-gray-800 rounded-xl text-sm text-left border border-green-200 hover:border-green-300 transition-all duration-200 shadow-sm hover:shadow-md group"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-green-600 font-semibold text-base mt-0.5 group-hover:scale-110 transition-transform">📊</span>
                      <span className="flex-1 leading-relaxed">Suggest scholarships suitable for GPA 3.0/4.0</span>
                    </div>
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
                  onKeyDown={(e) => e.key === 'Enter' && handleSendFromInput()} // SỬA ĐỔI: Gọi hàm mới
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
                    onClick={handleSendFromInput} // SỬA ĐỔI: Gọi hàm mới
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