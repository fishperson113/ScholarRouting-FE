import { api } from './api-client';
import type {
  CrmStats,
  ConversationThread,
  ConversationDetail,
  ChatMessage,
} from '@/types/crm';

// CRM API Layer - Ready for backend integration
export const crmApi = {
  // Dashboard Stats
  getStats: (): Promise<CrmStats> => {
    return api.get('/crm/stats');
  },

  // Conversations
  getThreads: (status?: string): Promise<ConversationThread[]> => {
    const params = status ? { status } : {};
    return api.get('/crm/threads', { params });
  },

  getThreadById: (id: string): Promise<ConversationDetail> => {
    return api.get(`/crm/threads/${id}`);
  },

  // Messages
  sendMessage: (threadId: string, content: string): Promise<ChatMessage> => {
    return api.post(`/crm/threads/${threadId}/messages`, { content });
  },

  // Search
  searchThreads: (query: string): Promise<ConversationThread[]> => {
    return api.get('/crm/threads/search', { params: { q: query } });
  },
};
