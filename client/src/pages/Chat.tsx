import { useState } from "react";
import type { FC } from "react";
import ChatMessage from "../custom-components/ChatMessage";
import ChatInput from "../custom-components/ChatInput";

const Chat: FC = () => {
  const [messages, setMessages] = useState([
    { text: "Hello! I'm AI. How can I help you?", isUser: false },
  ]);

  const handleSend = (text: string) => {
    setMessages([...messages, { text, isUser: true }]);
    setMessages((prev) => [
      ...prev,
      { text, isUser: true },
      { text: "This is a static AI response.", isUser: false },
    ]);
  };

  return (
    <div className="p-8 flex flex-col h-[80vh] max-w-2xl mx-auto">
      <div className="flex-1 overflow-y-auto border rounded-lg p-4">
        {messages.map((msg, idx) => (
          <ChatMessage key={idx} text={msg.text} isUser={msg.isUser} />
        ))}
      </div>
      <ChatInput onSend={handleSend} />
    </div>
  );
};

export default Chat;
