import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin-api';
import { useRealtimeMessages } from '@/hooks/use-realtime-messages';
import type { MessageRole } from '@/types/admin';

export const ConversationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [inputValue, setInputValue] = useState('');
  const [isTakenOver, setIsTakenOver] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversationDetail, isLoading } = useQuery({
    queryKey: ['admin', 'conversations', id],
    queryFn: () => adminApi.getConversationById(id!),
    enabled: !!id,
  });

  const { messages, appendMessage, setInitialMessages } = useRealtimeMessages(id!);

  useEffect(() => {
    if (conversationDetail?.messages) {
      setInitialMessages(conversationDetail.messages);
      setIsTakenOver(conversationDetail.conversation.status === 'taken_over');
    }
  }, [conversationDetail]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => adminApi.sendAdminMessage(id!, content),
    onSuccess: (newMessage) => {
      appendMessage(newMessage);
      setInputValue('');
    },
  });

  const takeOverMutation = useMutation({
    mutationFn: () => adminApi.takeOverChat(id!),
    onSuccess: () => {
      setIsTakenOver(true);
      queryClient.invalidateQueries({ queryKey: ['admin', 'conversations', id] });
    },
  });

  const releaseMutation = useMutation({
    mutationFn: () => adminApi.releaseChat(id!),
    onSuccess: () => {
      setIsTakenOver(false);
      queryClient.invalidateQueries({ queryKey: ['admin', 'conversations', id] });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && isTakenOver) {
      sendMessageMutation.mutate(inputValue.trim());
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading conversation...</div>;
  }

  if (!conversationDetail) {
    return <div className="text-center py-12">Conversation not found</div>;
  }

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {conversationDetail.conversation.userName || conversationDetail.conversation.userId}
            </h1>
            <p className="text-sm text-gray-500">
              Status: <StatusBadge status={conversationDetail.conversation.status} />
            </p>
          </div>
          <div className="flex gap-2">
            {!isTakenOver ? (
              <button
                onClick={() => takeOverMutation.mutate()}
                disabled={takeOverMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition"
              >
                {takeOverMutation.isPending ? 'Taking over...' : 'Take Over Chat'}
              </button>
            ) : (
              <button
                onClick={() => releaseMutation.mutate()}
                disabled={releaseMutation.isPending}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 transition"
              >
                {releaseMutation.isPending ? 'Releasing...' : 'Release Chat'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 bg-white rounded-lg shadow overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          {isTakenOver ? (
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || sendMessageMutation.isPending}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition"
              >
                Send
              </button>
            </form>
          ) : (
            <div className="text-center text-gray-500">
              Take over the chat to send messages
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MessageBubble = ({ message }: { message: { role: MessageRole; content: string; createdAt: string } }) => {
  const isUser = message.role === 'user';
  const isBot = message.role === 'bot';
  const isAdmin = message.role === 'admin';

  const bgColor = isUser ? 'bg-gray-100' : isAdmin ? 'bg-blue-100' : 'bg-green-100';
  const alignment = isUser ? 'items-start' : 'items-end';

  return (
    <div className={`flex flex-col ${alignment}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-medium text-gray-600">
          {isUser ? 'User' : isAdmin ? 'Admin' : 'Bot'}
        </span>
        <span className="text-xs text-gray-400">
          {new Date(message.createdAt).toLocaleTimeString()}
        </span>
      </div>
      <div className={`max-w-md px-4 py-2 rounded-lg ${bgColor}`}>
        <p className="text-sm text-gray-900">{message.content}</p>
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

export default ConversationDetail;
