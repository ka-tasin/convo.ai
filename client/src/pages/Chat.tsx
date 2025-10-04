import { useEffect, useState } from "react";
import type { FC } from "react";
import io from "socket.io-client";
import ChatMessage from "../custom-components/ChatMessage";
import ChatInput from "../custom-components/ChatInput";

const socket = io("http://localhost:5000");

const Chat: FC = () => {
  const [messages, setMessages] = useState<
    { sender: string; content: string }[]
  >([]);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const name = prompt("Enter your username") || "Anonymous";
    setUsername(name);
  }, []);

  useEffect(() => {
    socket.on("receiveMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });
    return () => {
      socket.off("receiveMessage");
    };
  }, []);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    const message = { sender: username, content: text };
    socket.emit("sendMessage", message);
  };

  return (
    <div className="p-8 flex flex-col h-[80vh] max-w-2xl mx-auto">
      <div className="flex-1 overflow-y-auto border rounded-lg p-4">
        {messages.map((msg, idx) => (
          <ChatMessage
            key={idx}
            text={`${msg.sender}: ${msg.content}`}
            isUser={msg.sender === username}
          />
        ))}
      </div>
      <ChatInput onSend={handleSend} />
    </div>
  );
};

export default Chat;
