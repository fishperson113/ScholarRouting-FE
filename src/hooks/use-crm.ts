import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { crmApi } from '@/lib/crm-api';
import type { ConversationStatus } from '@/types/crm';

// Mock data generator
const generateMockStats = () => ({
  totalThreads: 5,
  activeThreads: 2,
  totalMessages: 43,
  avgResponseTime: 2.3,
});

const generateMockThreads = () => [
  {
    id: '1',
    userId: 'user_2341',
    userName: 'John Smith',
    lastMessage: 'What scholarships are available for Co...',
    status: 'active' as ConversationStatus,
    messageCount: 8,
    lastActivity: '2 minutes ago',
    unread: true,
  },
  {
    id: '2',
    userId: 'user_5672',
    userName: 'Emily Chen',
    lastMessage: 'Can you help me with the application ...',
    status: 'active' as ConversationStatus,
    messageCount: 12,
    lastActivity: '15 minutes ago',
    unread: true,
  },
  {
    id: '3',
    userId: 'user_8823',
    userName: 'Michael Johnson',
    lastMessage: 'Thanks for the information!',
    status: 'inactive' as ConversationStatus,
    messageCount: 5,
    lastActivity: '3 hours ago',
  },
  {
    id: '4',
    userId: 'user_3421',
    userName: 'Sarah Williams',
    lastMessage: 'How do I track my application?',
    status: 'inactive' as ConversationStatus,
    messageCount: 15,
    lastActivity: '1 day ago',
  },
  {
    id: '5',
    userId: 'user_7654',
    userName: 'David Lee',
    lastMessage: 'What documents do I need?',
    status: 'old' as ConversationStatus,
    messageCount: 3,
    lastActivity: '3 days ago',
  },
];

const generateMockMessages = (threadId: string) => ({
  thread: generateMockThreads().find(t => t.id === threadId)!,
  messages: [
    {
      id: '1',
      threadId,
      sender: 'user' as const,
      content: 'Hi, I need help with scholarship applications',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: '2',
      threadId,
      sender: 'bot' as const,
      content: 'Hello! I\'d be happy to help you with scholarship applications. What specific information are you looking for?',
      timestamp: new Date(Date.now() - 3500000).toISOString(),
    },
    {
      id: '3',
      threadId,
      sender: 'user' as const,
      content: 'What scholarships are available for computer science students?',
      timestamp: new Date(Date.now() - 3400000).toISOString(),
    },
  ],
});

// Hooks with mock data (replace with real API calls later)
export const useCrmStats = () => {
  return useQuery({
    queryKey: ['crm', 'stats'],
    queryFn: async () => {
      // TODO: Replace with real API call
      // return crmApi.getStats();
      await new Promise(resolve => setTimeout(resolve, 300));
      return generateMockStats();
    },
  });
};

export const useCrmThreads = (status?: string) => {
  return useQuery({
    queryKey: ['crm', 'threads', status],
    queryFn: async () => {
      // TODO: Replace with real API call
      // return crmApi.getThreads(status);
      await new Promise(resolve => setTimeout(resolve, 300));
      const threads = generateMockThreads();
      if (!status || status === 'all') return threads;
      return threads.filter(t => t.status === status);
    },
  });
};

export const useCrmThread = (threadId: string | null) => {
  return useQuery({
    queryKey: ['crm', 'threads', threadId],
    queryFn: async () => {
      if (!threadId) return null;
      // TODO: Replace with real API call
      // return crmApi.getThreadById(threadId);
      await new Promise(resolve => setTimeout(resolve, 300));
      return generateMockMessages(threadId);
    },
    enabled: !!threadId,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ threadId, content }: { threadId: string; content: string }) => {
      // TODO: Replace with real API call
      // return crmApi.sendMessage(threadId, content);
      return Promise.resolve({
        id: Date.now().toString(),
        threadId,
        sender: 'admin' as const,
        content,
        timestamp: new Date().toISOString(),
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'threads', variables.threadId] });
      queryClient.invalidateQueries({ queryKey: ['crm', 'threads'] });
    },
  });
};
