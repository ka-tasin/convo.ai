import { useEffect, useState } from "react";
import { socket } from "../utils/socket";
import ChatMessage from "../custom-components/ChatMessage";
import ChatInput from "../custom-components/ChatInput";
import { jwtDecode } from "jwt-decode";

interface Message {
  senderId: string;
  senderName: string;
  receiverId: string;
  content: string;
}

interface TokenPayload {
  id: string;
  username: string;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<TokenPayload[]>([]);
  const [receiverId, setReceiverId] = useState("");
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const decoded = jwtDecode<TokenPayload>(token);
    setUserId(decoded.id);
    setUsername(decoded.username);

    // Register user with the server
    socket.emit("registerUser", token);

    // Listen for online users
    socket.on("onlineUsers", (users: TokenPayload[]) => {
      setOnlineUsers(users.filter((u) => u.id !== decoded.id)); // exclude self
    });

    // Listen for incoming messages
    socket.on("receiveMessage", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("onlineUsers");
      socket.off("receiveMessage");
    };
  }, []);

  const handleSend = (text: string) => {
    if (!text.trim() || !receiverId) return;

    const message: Message = {
      senderId: userId,
      receiverId,
      content: text,
      senderName: username,
    };
    socket.emit("sendMessage", message);

    // Add your own message locally
    setMessages((prev) => [...prev, message]);
  };

  return (
    <div className="p-8 flex flex-col h-[80vh] max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Logged in as {username}</h2>

      <div className="mb-2">
        <select
          value={receiverId}
          onChange={(e) => setReceiverId(e.target.value)}
          className="border p-2 rounded w-full"
        >
          <option value="">Select a user to chat</option>
          {onlineUsers.map((user) => (
            <option key={user.id} value={user.id}>
              {user.username}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto border rounded-lg p-4 space-y-2">
        {messages.map((msg, idx) => (
          <ChatMessage
            key={idx}
            text={`${msg.senderId === userId ? "You" : msg.senderName}: ${
              msg.content
            }`}
            isUser={msg.senderId === userId}
          />
        ))}
      </div>

      <ChatInput onSend={handleSend} />
    </div>
  );
};

export default Chat;
