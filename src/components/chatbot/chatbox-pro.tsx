import { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { ChatboxBase, Message } from './chatbox-base';
import { cn } from '@/utils/cn';

interface ChatboxProProps {
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
  useProfile?: boolean;
  onUseProfileChange?: (useProfile: boolean) => void;
}

const PRO_SUGGESTIONS = [
  {
    emoji: '🎓',
    text: "Find full-ride Data Science Master's scholarships in the US",
    gradient: 'bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-blue-200 hover:border-blue-300',
  },
  {
    emoji: '🌍',
    text: "Help me find some master's scholarships of Mathematics for women",
    gradient: 'bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border-purple-200 hover:border-purple-300',
  },
  {
    emoji: '📊',
    text: 'Suggest scholarships suitable for GPA 3.0/4.0',
    gradient: 'bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border-green-200 hover:border-green-300',
  },
];

export function ChatboxPro(props: ChatboxProProps) {
  const [useProfile, setUseProfile] = useState(props.useProfile ?? false);

  useEffect(() => {
    if (props.useProfile !== undefined) {
      setUseProfile(props.useProfile);
    }
  }, [props.useProfile]);

  const handleToggleProfile = () => {
    const newValue = !useProfile;
    setUseProfile(newValue);
    props.onUseProfileChange?.(newValue);
  };

  return (
    <>
      {/* Profile Toggle Banner */}
      <div className="px-4 pt-3 pb-2 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-purple-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <User className="w-4 h-4 text-purple-600" />
            <span className="text-sm text-gray-700">Use my personal academy information for personalized results</span>
          </div>
          <button
            onClick={handleToggleProfile}
            className={cn(
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              useProfile ? 'bg-blue-600' : 'bg-gray-300'
            )}
            role="switch"
            aria-checked={useProfile}
            aria-label="Toggle profile usage"
          >
            <span
              className={cn(
                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                useProfile ? 'translate-x-6' : 'translate-x-1'
              )}
            />
          </button>
        </div>
        {useProfile && (
          <div className="mt-2 text-xs text-blue-700 bg-blue-100 px-3 py-1.5 rounded-md">
            ✓ Chatbot will use your GPA, major, and preferences for better response
          </div>
        )}
      </div>

      <ChatboxBase
        {...props}
        quickReplySuggestions={PRO_SUGGESTIONS}
      />
    </>
  );
}
