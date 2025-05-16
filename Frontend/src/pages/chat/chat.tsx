// src/pages/chat/Chat.tsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { ChatInput } from "@/components/custom/chatinput";
import { PreviewMessage, ThinkingMessage } from "@/components/custom/message";
import { useScrollToBottom } from "@/components/custom/use-scroll-to-bottom";
import { Overview } from "@/components/custom/overview";
import { Header } from "@/components/custom/header";
import { Sidebar } from "@/components/custom/sidebar";
import { BASE_URL } from "@/api";
import { message as IMessage } from "@/interfaces/interfaces";
import { isTokenExpired } from "@/utils/auth";

// Backend now returns both user and bot messages in one call:
interface MessageResponse {
  id: number;
  chat_id: number;
  sender: "user" | "bot";
  content: string;
}

export function Chat() {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen((o) => !o);

  const [messagesContainerRef, messagesEndRef] = useScrollToBottom<HTMLDivElement>();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 1) Load history on mount / chatId change
  useEffect(() => {
    if (!chatId) return navigate("/");
    (async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token || isTokenExpired(token)) return navigate("/login");

        const resp = await axios.get<MessageResponse[]>(
          `${BASE_URL}/chats/${chatId}/messages`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setMessages(
          resp.data.map((m) => ({
            id: m.id.toString(),
            role: m.sender === "bot" ? "assistant" : "user",
            content: m.content,
          }))
        );
      } catch {
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [chatId, navigate]);

  // 2) Send a new question
  const handleSubmit = async (text?: string) => {
    const userText = (text ?? question).trim();
    if (!userText || !chatId) return;

    // Echo user immediately
    const userId = uuidv4();
    setMessages((prev) => [
      ...prev,
      { id: userId, role: "user", content: userText },
    ]);
    setQuestion("");

    // Insert thinking placeholder
    const thinkingId = uuidv4();
    setMessages((prev) => [
      ...prev,
      { id: thinkingId, role: "assistant", content: "" },
    ]);

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token")!;
      if (!token || isTokenExpired(token)) {
        navigate("/login");
        return;
      }

      // Call unified endpoint
      const resp = await axios.post<MessageResponse[]>(
        `${BASE_URL}/messages/`,
        { chat_id: parseInt(chatId, 10), user_message: userText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Extract only the bot's reply
      const bot = resp.data.find((m) => m.sender === "bot");
      if (bot) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === thinkingId
              ? { id: thinkingId, role: "assistant", content: bot.content }
              : m
          )
        );
      } else {
        // fallback error
        setMessages((prev) =>
          prev.map((m) =>
            m.id === thinkingId
              ? {
                  id: thinkingId,
                  role: "assistant",
                  content: "Sorry, no response received.",
                }
              : m
          )
        );
      }
    } catch (err) {
      console.error("Chat error:", err);
      // Replace placeholder with error text
      setMessages((prev) =>
        prev.map((m) =>
          m.id === thinkingId
            ? {
                id: thinkingId,
                role: "assistant",
                content: "Sorry, something went wrong.",
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={toggleSidebar} />
      {sidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
        />
      )}

      <div className="flex flex-col flex-1 overflow-hidden">
        <Header onMenuClick={toggleSidebar} />

        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-background"
        >
          {messages.length === 0 && !isLoading && <Overview />}

          {messages.map((msg) => (
            <PreviewMessage key={msg.id} message={msg} />
          ))}

          {isLoading && <ThinkingMessage />}

          <div ref={messagesEndRef} />
        </div>

        <div className="px-4 py-3 bg-background">
          <div className="w-full max-w-3xl mx-auto">
            <ChatInput
              question={question}
              setQuestion={setQuestion}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
