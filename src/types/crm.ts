// CRM Dashboard types

export type ConversationStatus = 'active' | 'inactive' | 'old';

export type ConversationThread = {
  id: string;
  userId: string;
  userName: string;
  lastMessage: string;
  status: ConversationStatus;
  messageCount: number;
  lastActivity: string;
  unread?: boolean;
};

export type ChatMessage = {
  id: string;
  threadId: string;
  sender: 'user' | 'bot' | 'admin';
  content: string;
  timestamp: string;
};

export type ConversationDetail = {
  thread: ConversationThread;
  messages: ChatMessage[];
};

export type CrmStats = {
  totalThreads: number;
  activeThreads: number;
  totalMessages: number;
  avgResponseTime: number; // in minutes
};
