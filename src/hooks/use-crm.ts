import { useQuery } from '@tanstack/react-query';
import { crmApi } from '@/lib/crm-api';

// Get CRM dashboard statistics
export const useCrmStats = () => {
  return useQuery({
    queryKey: ['crm', 'stats'],
    queryFn: () => crmApi.getStats(),
  });
};

// Get all users with chat activity (with optional status filter)
export const useCrmUsers = (status?: string) => {
  return useQuery({
    queryKey: ['crm', 'users', status],
    queryFn: async () => {
      const users = await crmApi.getUsers();
      // Filter by status if provided
      if (!status || status === 'all') return users;
      return users.filter(user => user.status === status);
    },
  });
};

// Get specific user's chat history
export const useCrmUserChats = (userId: string | null) => {
  return useQuery({
    queryKey: ['crm', 'users', userId, 'chats'],
    queryFn: () => crmApi.getUserChats(userId!),
    enabled: !!userId,
  });
};
