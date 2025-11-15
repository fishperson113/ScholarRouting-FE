import { api } from './api-client';
import type { 
  CrmStats, 
  CrmUser, 
  UserChatHistory,
  CrmStatsResponse,
  CrmUsersResponse,
  UserChatsResponse,
  ConversationStatus
} from '@/types/crm';

// Helper function to determine user status
const getUserStatus = (lastChatAt: string): ConversationStatus => {
  const lastChat = new Date(lastChatAt);
  const now = new Date();
  const hoursDiff = (now.getTime() - lastChat.getTime()) / (1000 * 60 * 60);
  
  if (hoursDiff <= 24) return 'active';
  if (hoursDiff <= 168) return 'inactive'; // 7 days
  return 'old';
};

// CRM API Layer
export const crmApi = {
  // Get dashboard statistics
  getStats: async (): Promise<CrmStats> => {
    const response: CrmStatsResponse = await api.get('/crm/stats');
    return {
      totalUsers: response.data.total_users,
      activeUsers: response.data.active_users,
      totalMessages: response.data.total_chats,
      avgMessagesPerUser: response.data.total_users > 0 
        ? Math.round(response.data.total_chats / response.data.total_users) 
        : 0,
      chatsToday: response.data.chats_today,
    };
  },

  // Get all users with chat activity
  getUsers: async (): Promise<CrmUser[]> => {
    const response: CrmUsersResponse = await api.get('/crm/users');
    
    // Fetch each user's chat to get lastMessage and plan
    const usersWithDetails = await Promise.all(
      response.data.map(async (user) => {
        try {
          const chatResponse: UserChatsResponse = await api.get(`/crm/users/${user.user_id}/chats?limit=1`);
          const latestChat = chatResponse.data[0];
          
          return {
            userId: user.user_id,
            userName: user.display_name,
            email: user.email,
            messageCount: user.chat_count,
            lastActivity: user.last_chat_at,
            lastMessage: latestChat?.query || 'No messages yet',
            status: getUserStatus(user.last_chat_at),
            plan: latestChat?.plan || 'basic',
          };
        } catch (error) {
          // If fetching chat fails, return user with defaults
          return {
            userId: user.user_id,
            userName: user.display_name,
            email: user.email,
            messageCount: user.chat_count,
            lastActivity: user.last_chat_at,
            lastMessage: 'Unable to load messages',
            status: getUserStatus(user.last_chat_at),
            plan: 'basic',
          };
        }
      })
    );
    
    return usersWithDetails;
  },

  // Get specific user's chat history
  getUserChats: async (userId: string): Promise<UserChatHistory> => {
    const response: UserChatsResponse = await api.get(`/crm/users/${userId}/chats`);
    
    // Get user info from the response or use fallback
    const userName = 'User'; // Backend doesn't provide this in chat response
    const email = ''; // Backend doesn't provide this in chat response
    
    return {
      userId: response.user_id,
      userName,
      email,
      chatHistory: response.data.map(chat => ({
        id: chat.id,
        query: chat.query,
        answer: chat.answer,
        timestamp: chat.timestamp,
        plan: chat.plan,
        scholarshipNames: chat.scholarship_names,
      })),
    };
  },
};
