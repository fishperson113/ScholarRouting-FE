import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin-api';

export const AdminDashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard', 'stats'],
    queryFn: adminApi.getDashboardStats,
  });

  const { data: conversations = [] } = useQuery({
    queryKey: ['admin', 'conversations', 'recent'],
    queryFn: async () => {
      const all = await adminApi.getConversations();
      return all.slice(0, 10); // Get 10 most recent
    },
  });

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Users" value={stats?.totalUsers || 0} />
        <StatCard title="Total Conversations" value={stats?.totalConversations || 0} />
        <StatCard title="Active Conversations" value={stats?.activeConversations || 0} />
      </div>

      {/* Recent Conversations Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Recent Conversations</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Message
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Updated
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {conversations.map((conv) => (
                <tr key={conv.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {conv.userName || conv.userId}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-md truncate">
                    {conv.lastMessage}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={conv.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(conv.updatedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value }: { title: string; value: number }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <h3 className="text-sm font-medium text-gray-500">{title}</h3>
    <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const colors = {
    active: 'bg-green-100 text-green-800',
    taken_over: 'bg-blue-100 text-blue-800',
    closed: 'bg-gray-100 text-gray-800',
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status as keyof typeof colors] || colors.closed}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

export default AdminDashboard;
