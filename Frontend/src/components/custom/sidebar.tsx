// src/components/Sidebar.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '@/api';
import { Button } from '@/components/ui/button';
import { PlusCircle, MessageCircle, X, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChatItem {
  id: string;
  active: boolean;
}

export function Sidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();

  const [chats, setChats] = useState<ChatItem[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // 1) Fetch existing chats once
  useEffect(() => {
    (async () => {
      const token = localStorage.getItem('token');
      try {
        const resp = await axios.get<{ id: string; created_at: string }[]>(
          `${BASE_URL}/chats/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // Only store id & active flag; name is computed in render
        setChats(resp.data.map((c) => ({ id: c.id, active: false })));
      } catch (err) {
        console.error('Error fetching chats', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 2) Create new chat
  const createNewChat = async () => {
    setCreating(true);
    try {
      const token = localStorage.getItem('token');
      const resp = await axios.post<{ id: string }>(
        `${BASE_URL}/chats/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChats((prev) => [...prev, { id: resp.data.id, active: false }]);
    } catch (err) {
      console.error('Error creating chat', err);
    } finally {
      setCreating(false);
    }
  };

  // 3) Delete chat
  const handleDeleteChat = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this chat?')) return;

    setDeletingId(chatId);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${BASE_URL}/chats/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

       setChats((prev) => {
        const updated = prev.filter((c) => c.id !== chatId);

        // if that was the last chat, redirect & close
        if (updated.length === 0) {
          navigate('/');   // or wherever you want to send them
          onClose();
        }

        return updated;
      });

      if (activeChat === chatId) setActiveChat(null);
    } catch (err) {
      console.error('Error deleting chat', err);
    } finally {
      setDeletingId(null);
    }
  };

  // 4) Select & navigate
  const selectChat = (chatId: string) => {
    setActiveChat(chatId);
    setChats((prev) =>
      prev.map((c) => ({ ...c, active: c.id === chatId }))
    );
    navigate(`/chat/${chatId}`);
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
            <p className="text-center text-sm text-gray-500">Loading chats…</p>
          ) : (
            <div className="space-y-2">
              {chats.length === 0 && (
                <p className="text-center text-sm text-gray-500">
                  No chats yet. Create one above.
                </p>
              )}
              {chats.map((chat, idx) => {
                const displayName = `Chat ${idx + 1}`;
                return (
                  <div key={chat.id} className="group relative">
                    <Button
                      variant={chat.active ? 'secondary' : 'ghost'}
                      className="w-full justify-start gap-2 pr-8"
                      onClick={() => selectChat(chat.id)}
                    >
                      <MessageCircle className="h-4 w-4" />
                      {displayName}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={deletingId === chat.id}
                      className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => handleDeleteChat(e, chat.id)}
                    >
                      {deletingId === chat.id ? '…' : (
                        <Trash2 className="h-4 w-4 text-primary" />
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
