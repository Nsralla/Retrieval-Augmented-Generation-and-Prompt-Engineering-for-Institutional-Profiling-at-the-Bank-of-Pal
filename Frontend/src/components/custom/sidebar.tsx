// src/components/Sidebar.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { BASE_URL } from '@/api';
import { Button } from '@/components/ui/button';
import { PlusCircle, MessageCircle, X, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChatItem {
  id: string;
}

export function Sidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const { chatId: currentId } = useParams<{ chatId: string }>();

  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Load chats on mount
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const resp = await axios.get<{ id: string }[]>(
          `${BASE_URL}/chats/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setChats(resp.data);
      } catch (err) {
        console.error('Error fetching chats', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Create new chat
  const createNewChat = async () => {
    setCreating(true);
    try {
      const token = localStorage.getItem('token');
      const resp = await axios.post<{ id: string }>(
        `${BASE_URL}/chats/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChats(prev => [...prev, { id: resp.data.id }]);
    } catch (err) {
      console.error('Error creating chat', err);
    } finally {
      setCreating(false);
    }
  };

  // Delete a chat
  const handleDeleteChat = async (
    e: React.MouseEvent,
    chatId: string
  ) => {
    e.stopPropagation();

    // Prevent deleting the current active chat
    if (chatId === currentId) {
      return; // Do nothing
    }

    if (!window.confirm('Are you sure you want to delete this chat?'))
      return;

    setDeletingId(chatId);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${BASE_URL}/chats/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Compute remaining chats
      const updated = chats.filter(c => c.id !== chatId);
      setChats(updated);

      // If we just deleted the chat that's open, close sidebar then navigate
      if (String(chatId) === String(currentId)) {
        onClose();
        if (updated.length > 0) {
          navigate(`/chat/${updated[0].id}`);
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      console.error('Error deleting chat', err);
    } finally {
      setDeletingId(null);
    }
  };

  // Select & navigate immediately, then close sidebar
  const selectChat = (id: string) => {
    navigate(`/chat/${id}`);
    onClose();
  };

  return (
    <div
      className={cn(
        'fixed inset-y-0 left-0 w-64 bg-background border-r transform transition-transform duration-200 ease-in-out z-50',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      <div className="flex flex-col h-full p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Chats</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* New Chat */}
        <Button
          onClick={createNewChat}
          disabled={creating}
          className="mb-4 flex items-center gap-2"
          variant="outline"
        >
          <PlusCircle className="h-4 w-4" />
          {creating ? 'Creating…' : 'New Chat'}
        </Button>

        {/* Chat List */}
        <ScrollArea className="flex-1">
          {loading ? (
            <p className="text-center text-sm text-gray-500">
              Loading chats…
            </p>
          ) : (
            <div className="space-y-2">
              {chats.length === 0 && (
                <p className="text-center text-sm text-gray-500">
                  No chats yet.
                </p>
              )}
              {chats.map(chat => (
                <div key={chat.id} className="group relative">
                  <Button
                    variant={chat.id === currentId ? 'secondary' : 'ghost'}
                    className="w-full justify-start gap-2 pr-8"
                    onClick={() => selectChat(chat.id)}
                  >
                    <MessageCircle className="h-4 w-4" />
                    {`Chat ${chat.id}`}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={deletingId === chat.id || chat.id === currentId} // Disable if it's the current chat
                    className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100"
                    onClick={e => handleDeleteChat(e, chat.id)}
                  >
                    {deletingId === chat.id ? '…' : (
                      <Trash2 className="h-4 w-4 text-primary" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
