import { useEffect, useState } from "react";
import ChatContainer from "@/components/ChatContainer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Plus } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

interface ChatHistory {
  id: number;
  title: string;
  created_at: string;
}

const Index = () => {
  const [chats, setChats] = useState<ChatHistory[]>([]);
  const navigate = useNavigate();
  const { chatId } = useParams();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const loadChats = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_histories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChats(data || []);
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  };

  useEffect(() => {
    loadChats();
  }, []);

  return (
    <div className="min-h-screen bg-chatbot-background py-1">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Chat List Sidebar */}
          <div className="bg-white rounded-lg p-4 h-[80vh] overflow-y-auto">
            <h2 className="font-bold mb-4">Chat History</h2>
            <div className="space-y-2 ">
              {chats.map((chat) => (
                <Button
                  key={chat.id}
                  variant={chatId === String(chat.id) ? "default" : "ghost"}
                  className="w-full justify-start text-left truncate"
                  onClick={() => navigate(`/chat/${chat.id}`)}
                >
                  {chat.title}
                </Button>
              ))}
            </div>
          </div>

          {/* Chat Container */}
          <div className="md:col-span-3">
            <ChatContainer chatId={chatId} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;