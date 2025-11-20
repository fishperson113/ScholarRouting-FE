import { ChatboxBase, Message } from './chatbox-base';

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
  return (
    <ChatboxBase
      {...props}
      quickReplySuggestions={PRO_SUGGESTIONS}
    />
  );
}
