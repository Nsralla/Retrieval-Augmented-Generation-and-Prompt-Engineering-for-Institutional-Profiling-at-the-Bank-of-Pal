// pages/chat/Chat.tsx
import React, { useState, useRef } from "react";
import { ChatInput } from "@/components/custom/chatinput";
import { PreviewMessage, ThinkingMessage } from "@/components/custom/message";
import { useScrollToBottom } from "@/components/custom/use-scroll-to-bottom";
import { message } from "@/interfaces/interfaces";
import { Overview } from "@/components/custom/overview";
import { Header } from "@/components/custom/header";
import { Sidebar } from "@/components/custom/sidebar";
import { v4 as uuidv4 } from "uuid";

const socket = new WebSocket("ws://localhost:8090"); // change to your websocket endpoint

export function Chat() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(o => !o);

  const [messagesContainerRef, messagesEndRef] = useScrollToBottom<HTMLDivElement>();
  const [messages, setMessages] = useState<message[]>([]);
  const [question, setQuestion] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messageHandlerRef = useRef<((e: MessageEvent) => void) | null>(null);

  const cleanupMessageHandler = () => {
    if (messageHandlerRef.current) {
      socket.removeEventListener("message", messageHandlerRef.current);
      messageHandlerRef.current = null;
    }
  };

  async function handleSubmit(text?: string) {
    if (socket.readyState !== WebSocket.OPEN || isLoading) return;
    const messageText = text || question;
    setIsLoading(true);
    cleanupMessageHandler();

    const traceId = uuidv4();
    setMessages(prev => [...prev, { content: messageText, role: "user", id: traceId }]);
    socket.send(messageText);
    setQuestion("");

    try {
      const handler = (event: MessageEvent) => {
        setIsLoading(false);
        if (event.data.includes("[END]")) {
          cleanupMessageHandler();
          return;
        }
        setMessages(prev => {
          const last = prev[prev.length - 1];
          const newContent = last.role === "assistant"
            ? last.content + event.data
            : event.data;
          const newMsg = { content: newContent, role: "assistant", id: traceId };
          return last.role === "assistant"
            ? [...prev.slice(0, -1), newMsg]
            : [...prev, newMsg];
        });
      };
      messageHandlerRef.current = handler;
      socket.addEventListener("message", handler);
    } catch (err) {
      console.error("WebSocket error:", err);
      setIsLoading(false);
    }
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={toggleSidebar} />

      {/* Overlay */}
      {sidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
        />
      )}

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header with menu callback */}
        <Header onMenuClick={toggleSidebar} />

        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          {messages.length === 0 && <Overview />}
          {messages.map(msg => (
            <PreviewMessage key={msg.id} message={msg} />
          ))}
          {isLoading && <ThinkingMessage />}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Section: centered with max width */}
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
