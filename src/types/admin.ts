// Admin related types

export type ConversationStatus = 'active' | 'taken_over' | 'closed';

export type MessageRole = 'user' | 'bot' | 'admin';

export type Message = {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  createdAt: string;
};

export type Conversation = {
  id: string;
  userId: string;
  userName?: string;
  lastMessage: string;
  status: ConversationStatus;
  createdAt: string;
  updatedAt: string;
  takenOverBy?: string;
  takenOverAt?: string;
};

export type DashboardStats = {
  totalUsers: number;
  totalConversations: number;
  activeConversations: number;
};

export type ConversationDetail = {
  conversation: Conversation;
  messages: Message[];
};
