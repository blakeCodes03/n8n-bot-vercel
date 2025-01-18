import React from "react";
import { cn } from "@/lib/utils";
import { Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ChatMessageProps {
  content: string;
  isBot: boolean;
  timestamp: Date;
}

const ChatMessage = ({ content, isBot, timestamp }: ChatMessageProps) => {
  return (
    <div
      className={cn(
        "flex w-full mb-4 animate-fade-in",
        isBot ? "justify-start" : "justify-end"
      )}
    >
      {isBot && <Bot />}{" "}
      <div
        className={cn(
          "max-w-[80%] rounded-lg p-4",
          isBot ? "bg-gray-50 text-gray-900" : "bg-gray-200 text-gray-900"
        )}
      >
        <div className="text-sm md:text-base">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>

        <span className="text-xs opacity-70 mt-2 block">
          {timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
};

export default ChatMessage;
