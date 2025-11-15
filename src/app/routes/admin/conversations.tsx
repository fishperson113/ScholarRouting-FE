import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { adminApi } from '@/lib/admin-api';
import { paths } from '@/config/paths';

export const Conversations = () => {
  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['admin', 'conversations'],
    queryFn: adminApi.getConversations,
  });

  if (isLoading) {
    return <div className="text-center py-12">Loading conversations...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Conversations</h1>
        <div className="text-sm text-gray-600">
          {conversations.length} total conversations
        </div>
      </div>

      {/* Conversations List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {conversations.map((conv) => (
              <tr key={conv.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {conv.userName || conv.userId}
                  </div>
                  <div className="text-sm text-gray-500">{conv.userId}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 max-w-md">
                  <div className="truncate">{conv.lastMessage}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={conv.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(conv.updatedAt).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Link
                    to={paths.admin.conversationDetail.getHref(conv.id)}
                    className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                  >
                    Join Chat
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {conversations.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No conversations found
          </div>
        )}
      </div>
    </div>
  );
};

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

export default Conversations;
