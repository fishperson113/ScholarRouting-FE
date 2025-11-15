// CRM Dashboard types

export type ConversationStatus = 'active' | 'inactive' | 'old';

// Backend API response types
export type CrmStatsResponse = {
  success: boolean;
  data: {
    total_users: number;
    total_chats: number;
    chats_today: number;
    active_users: number;
    timestamp: string;
  };
};

export type CrmUsersResponse = {
  success: boolean;
  data: {
    user_id: string;
    email: string;
    display_name: string;
    chat_count: number;
    last_chat_at: string;
    created_at: string | null;
  }[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
};

export type UserChatsResponse = {
  success: boolean;
  user_id: string;
  data: {
    id: string;
    query: string;
    answer: string;
    timestamp: string;
    plan: string;
    scholarship_names: string[];
  }[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
};

// Frontend display types
export type CrmUser = {
  userId: string;
  userName: string;
  email: string;
  messageCount: number;
  lastActivity: string;
  lastMessage: string;
  status: ConversationStatus;
  plan: string;
};

export type ChatMessage = {
  id: string;
  query: string;
  answer: string;
  timestamp: string;
  plan: string;
  scholarshipNames: string[];
};

export type UserChatHistory = {
  userId: string;
  userName: string;
  email: string;
  chatHistory: ChatMessage[];
};

export type CrmStats = {
  totalUsers: number;
  activeUsers: number;
  totalMessages: number;
  avgMessagesPerUser: number;
  chatsToday: number;
};
