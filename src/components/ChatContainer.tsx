import React, { useState, useRef, useEffect } from "react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import FileUpload from "./FileUpload";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import useStore from "@/useStore";
import { set } from "date-fns";

interface Message {
  content: string;
  isBot: boolean;
  timestamp: Date;
}

const ChatContainer = ({ chatId }: { chatId?: string }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [botReply, setBotReply] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const botMessage = useStore((state) => state.botMessage);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (chatId) {
      loadChatHistory();
    } else {
      setMessages([
        {
          content: "How can I help you today?",
          isBot: true,
          timestamp: new Date(),
        },
      ]);
    }
  }, [chatId]);

  useEffect(() => {
    if (botMessage) {
      setIsLoading(true)
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          content: botMessage,
          isBot: true,
          timestamp: new Date(),
        },
      ]);
      saveBotMessage(botMessage);
      useStore.getState().setBotMessage("");
      setIsLoading(false)
    }
  }, [botMessage]);

  const loadChatHistory = async () => {
    try {
      const { data: messages, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("chat_id", parseInt(chatId || "0", 10))
        .order("created_at", { ascending: true });

      if (error) throw error;

      if (messages) {
        setMessages(
          messages.map((msg) => ({
            content: msg.content,
            isBot: msg.is_bot,
            timestamp: new Date(msg.created_at),
          }))
        );
      }
    } catch (error) {
      toast.error("Failed to load chat history");
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Add user message to UI
    const userMessage = { content, isBot: false, timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);

    try {
      // If this is a new chat, create a chat history first
      let currentChatId = chatId ? parseInt(chatId, 10) : null;

      if (!currentChatId) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        const { data: newChat, error: chatError } = await supabase
          .from("chat_histories")
          .insert([
            {
              title: content.slice(0, 50),
              user_id: user.id,
            },
          ])
          .select()
          .single();

        if (chatError) throw chatError;
        currentChatId = newChat.id;
        navigate(`/chat/${currentChatId}`);
      }

      // Save user message
      await supabase.from("chat_messages").insert({
        chat_id: currentChatId,
        content,
        is_bot: false,
      });

     
    } catch (error) {
      toast.error("Failed to send message");
      setIsLoading(false);
    }
  };

  const saveBotMessage = async (content: string) => {
    let currentChatId = chatId;

    // Save bot message
    await supabase.from("chat_messages").insert({
      chat_id: parseInt(currentChatId),
      content,
      is_bot: true,
    });
  };

  const handleFileUpload = async (files: File[]) => {
    toast.success(`Uploaded ${files.length} file(s)`);
    const uploadMessage = `Uploaded: ${files.map((f) => f.name).join(", ")}`;

    // Add upload message to chat
    const message = {
      content: uploadMessage,
      isBot: false,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, message]);

    // Save upload message if we have a chat
    if (chatId) {
      try {
        await supabase.from("chat_messages").insert({
          chat_id: parseInt(chatId, 10),
          content: uploadMessage,
          is_bot: false,
        });
      } catch (error) {
        toast.error("Failed to save upload message");
      }
    }
  };

  return (
    <div className="flex flex-col h-[90vh] max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <ChatMessage key={index} {...message} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t space-y-4">
        <FileUpload onFileUpload={handleFileUpload} />
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default ChatContainer;
