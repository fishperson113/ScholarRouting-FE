import { Fragment } from 'react';
import {
  Send,
  Smile,
  Paperclip,
  MoreVertical,
  Eye,
  MessageSquare,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown/dropdown';

export interface ScholarshipInfo {
  name: string;
  id: string;
}

export interface Message {
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
  
  const boldRegex = /\*\*(.+?)\*\*/g;
  let match;
  
  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    
    parts.push(
      <strong key={`bold-${keyIndex++}`} className="font-semibold">
        {match[1]}
      </strong>
    );
    
    lastIndex = match.index + match[0].length;
  }
  
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  
  return parts.length > 0 ? parts : [text];
}

// Component to render formatted scholarship text with clickable scholarship names
export function FormattedScholarshipMessage({ 
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

    if (trimmedLine.startsWith('*')) {
      const content = trimmedLine.substring(1).trim();
      const scholarshipNameMatch = content.match(/^\*\*([^*]+)\*\*/);
      
      if (scholarshipNameMatch) {
        const scholarshipName = scholarshipNameMatch[1];
        const restOfContent = content.substring(scholarshipNameMatch[0].length);
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
        elements.push(
          <div key={`line-${keyIndex++}`} className="mb-1 text-sm ml-6 flex">
            <span className="mr-2">•</span>
            <span className="flex-1">{parseInlineMarkdown(content)}</span>
          </div>
        );
      }
    } else {
      elements.push(
        <div key={`line-${keyIndex++}`} className="mb-1 text-sm">
          {parseInlineMarkdown(trimmedLine)}
        </div>
      );
    }
  });

  return <div className="space-y-0.5">{elements}</div>;
}

interface ChatboxBaseProps {
  messages: Message[];
  inputValue: string;
  isThinking: boolean;
  loadingStage: number;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
  onQuickReply: (reply: string) => void;
  onViewScholarshipDetails: (scholarshipId: string) => void;
  onAskScholarship: (scholarshipName: string) => void;
  onScholarshipNameClick: (scholarshipName: string, scholarshipId?: string) => void;
  quickReplySuggestions?: Array<{ emoji: string; text: string; gradient: string }>;
}

export function ChatboxBase({
  messages,
  inputValue,
  isThinking,
  loadingStage,
  messagesEndRef,
  onInputChange,
  onSend,
  onStop,
  onQuickReply,
  onViewScholarshipDetails,
  onAskScholarship,
  onScholarshipNameClick,
  quickReplySuggestions,
}: ChatboxBaseProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSend();
    }
  };

  return (
    <>
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
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
                    onScholarshipClick={onScholarshipNameClick}
                    onViewDetails={onViewScholarshipDetails}
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
                      onClick={() => onQuickReply(scholarship.name)}
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
                          onClick={() => onViewScholarshipDetails(scholarship.id)}
                          className="cursor-pointer"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View scholarship details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onAskScholarship(scholarship.name)}
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
                    onClick={() => onQuickReply(name)}
                    className="px-4 py-1.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium hover:bg-blue-200 transition-colors text-left"
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
          </Fragment>
        ))}

        {/* Thinking indicator */}
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

        {/* Quick Reply Suggestions */}
        {messages.length === 1 && quickReplySuggestions && (
          <div className="space-y-3 px-2">
            <div className="text-xs font-medium text-gray-500 text-center mb-3">
              Try asking me:
            </div>
            {quickReplySuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => onQuickReply(suggestion.text)}
                className={cn(
                  "w-full px-4 py-3 text-gray-800 rounded-xl text-sm text-left border transition-all duration-200 shadow-sm hover:shadow-md group",
                  suggestion.gradient
                )}
              >
                <div className="flex items-start gap-3">
                  <span className="font-semibold text-base mt-0.5 group-hover:scale-110 transition-transform">
                    {suggestion.emoji}
                  </span>
                  <span className="flex-1 leading-relaxed">{suggestion.text}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 sm:p-4 bg-white border-t border-gray-200 rounded-b-lg">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            className="hidden sm:block p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
            aria-label="Emoji"
          >
            <Smile className="w-5 h-5 text-gray-500" />
          </button>
          <button
            className="hidden sm:block p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
            aria-label="Attach"
          >
            <Paperclip className="w-5 h-5 text-gray-500" />
          </button>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your message..."
            className="flex-1 min-w-0 px-3 sm:px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          {isThinking ? (
            <button
              onClick={onStop}
              className="flex-shrink-0 p-2 sm:p-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
              aria-label="Stop"
            >
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white rounded-sm" />
            </button>
          ) : (
            <button
              onClick={onSend}
              className="flex-shrink-0 p-2 sm:p-3 bg-blue-900 text-white rounded-full hover:bg-blue-800 transition-colors"
              aria-label="Send"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
        </div>
      </div>
    </>
  );
}
