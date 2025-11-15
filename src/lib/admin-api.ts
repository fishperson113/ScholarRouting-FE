import { api } from './api-client';
import type {
  DashboardStats,
  Conversation,
  ConversationDetail,
  Message,
} from '@/types/admin';

// Admin API Layer
export const adminApi = {
  // Dashboard
  getDashboardStats: (): Promise<DashboardStats> => {
    return api.get('/admin/dashboard/stats');
  },

  // Conversations
  getConversations: (): Promise<Conversation[]> => {
    return api.get('/admin/conversations');
  },

  getConversationById: (id: string): Promise<ConversationDetail> => {
    return api.get(`/admin/conversations/${id}`);
  },

  // Messages
  sendAdminMessage: (conversationId: string, content: string): Promise<Message> => {
    return api.post(`/admin/conversations/${conversationId}/messages`, { content });
  },

  // Chat Control
  takeOverChat: (conversationId: string): Promise<{ success: boolean }> => {
    return api.post(`/admin/conversations/${conversationId}/takeover`);
  },

  releaseChat: (conversationId: string): Promise<{ success: boolean }> => {
    return api.post(`/admin/conversations/${conversationId}/release`);
  },
};
