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
  name: string;
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
  const [loadingChats, setLoadingChats] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch existing chats
  useEffect(() => {
    (async () => {
      const token = localStorage.getItem('token');
      try {
        const resp = await axios.get<{ id: string; created_at: string }[]>(
          `${BASE_URL}/chats/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setChats(
          resp.data.map((c, i) => ({
            id: c.id,
            name: `Chat ${i + 1}`,
            active: false,
          }))
        );
      } catch (err) {
        console.error('Error fetching chats', err);
      } finally {
        setLoadingChats(false);
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
      setChats((prev) => [
        ...prev,
        { id: resp.data.id, name: `Chat ${prev.length + 1}`, active: false },
      ]);
    } catch (err) {
      console.error('Error creating chat', err);
    } finally {
      setCreating(false);
    }
  };

  // Delete chat
  const handleDeleteChat = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this chat?')) return;
    setDeletingId(chatId);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${BASE_URL}/chats/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChats((prev) => prev.filter((c) => c.id !== chatId));
      if (activeChat === chatId) setActiveChat(null);
    } catch (err) {
      console.error('Error deleting chat', err);
    } finally {
      setDeletingId(null);
    }
  };

  // **Navigate** to the chat URL when clicked
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
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Chats</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Button
          onClick={createNewChat}
          disabled={creating}
          className="mb-4 flex items-center gap-2"
          variant="outline"
        >
          <PlusCircle className="h-4 w-4" />
          {creating ? 'Creating…' : 'New Chat'}
        </Button>

        <ScrollArea className="flex-1">
          {loadingChats ? (
            <p className="text-center text-sm text-gray-500">Loading chats…</p>
          ) : (
            <div className="space-y-2">
              {chats.map((chat) => (
                <div key={chat.id} className="group relative">
                  <Button
                    variant={chat.active ? 'secondary' : 'ghost'}
                    className="w-full justify-start gap-2 pr-8"
                    onClick={() => selectChat(chat.id)}
                  >
                    <MessageCircle className="h-4 w-4" />
                    {chat.name}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={deletingId === chat.id}
                    className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => handleDeleteChat(e, chat.id)}
                  >
                    {deletingId === chat.id ? '…' : <Trash2 className="h-4 w-4 text-primary" />}
                  </Button>
                </div>
              ))}
              {chats.length === 0 && (
                <p className="text-center text-sm text-gray-500">
                  No chats yet. Create one above.
                </p>
              )}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
