import React, { useEffect, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from "@/components/ui/textarea";
import VoiceInput from "./VoiceInput";
import { toast } from "sonner";
import useStore from "@/useStore";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

const ChatInput = ({ onSendMessage, isLoading }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const text = useStore((state) => state.text);
  const isRecording = useStore((state) => state.isRecording);
  const botReply = useStore((state) => state.botMessage);
  const globalLoading = useStore((state) => state.isLoading);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      useStore.getState().setText(message);     
      useStore.getState().setIsLoading(true);     

      
      try {
        // const serverResponse = await fetch('http://localhost:5000/api/chatbot/prompt', {
        const serverResponse = await fetch('/api/chatbot/prompt', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message }),
        });

        if (!serverResponse.ok) {
          throw new Error('Failed to process message');
        }

        const { response } = await serverResponse.json();
        JSON.stringify({ response });
        useStore.getState().setBotMessage(response.output);
        // console.log(botReply);
        setMessage("");
        useStore.getState().setText("");
      useStore.getState().setText("");
      } catch (error) {
        toast.error('Failed to process message');
      }
      useStore.getState().setIsLoading(false);     

    }
  };

  const handleVoiceMessage = async (audioBlob: Blob) => {
    toast.info("Voice message recorded!");
    // Here you would typically:
    // 1. Convert the audio blob to text using a speech-to-text service
    // 2. Set the converted text as the message
    // 3. Optionally auto-send the message
    // For now, we'll just show a toast notification
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  useEffect(() => {
   setMessage(text);
  }, [text]);
  return (
    <form onSubmit={handleSubmit} className="flex gap-1 items-end">
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
        className="flex-1"
        disabled={globalLoading || isRecording}
        rows={3} // Adjust the number of rows as needed
      />
      <VoiceInput onVoiceMessage={handleVoiceMessage} />
      <Button type="submit" disabled={globalLoading || isRecording}>
        {globalLoading ? <Spinner size="small" className="text-gray-100"/> : <Send className="w-4 h-4" />}
      </Button>
    </form>
  );
};

export default ChatInput;
