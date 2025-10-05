import { useEffect, useRef, useState } from "react";
import { socket } from "../utils/socket";
import ChatMessage from "../custom-components/ChatMessage";
import ChatInput from "../custom-components/ChatInput";
import { jwtDecode } from "jwt-decode";

interface Message {
  senderId: string;
  senderName: string;
  receiverId: string;
  content: string;
  timestamp: number;
}

interface TokenPayload {
  id: string;
  username: string;
}

const Chat = () => {
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<TokenPayload[]>([]);
  const [currentChatUser, setCurrentChatUser] = useState<TokenPayload | null>(
    null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const currentChatUserRef = useRef<TokenPayload | null>(null);

  // Load current user & register socket
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const decoded = jwtDecode<TokenPayload>(token);
    setUserId(decoded.id);
    setUsername(decoded.username);

    socket.emit("registerUser", token);

    socket.on("onlineUsers", (users: TokenPayload[]) => {
      setOnlineUsers(users.filter((u) => u.id !== decoded.id));
    });

    // Always listen for messages
    socket.on("receiveMessage", (msg: Message) => {
      setMessages((prev) => {
        // If the message belongs to the current conversation, append
        if (
          currentChatUserRef.current &&
          (msg.senderId === currentChatUserRef.current.id ||
            msg.receiverId === currentChatUserRef.current.id)
        ) {
          return [...prev, msg];
        }
        return prev;
      });
    });

    return () => {
      socket.off("onlineUsers");
      socket.off("receiveMessage");
    };
  }, []);
  const startConversation = (user: TokenPayload) => {
    setCurrentChatUser(user);
    currentChatUserRef.current = user;

    // Load previous messages
    socket.emit("loadConversation", { userId, otherId: user.id });
    socket.once("conversationLoaded", (msgs: Message[]) => setMessages(msgs));
  };

  const handleSend = (text: string) => {
    if (!text.trim() || !currentChatUser) return;
    const msg: Message = {
      senderId: userId,
      senderName: username,
      receiverId: currentChatUser.id,
      content: text,
      timestamp: Date.now(),
    };
    socket.emit("sendMessage", msg);
    // setMessages((prev) => [...prev, msg]);
  };

  return (
    <div className="flex h-[80vh] max-w-4xl mx-auto border rounded overflow-hidden">
      {/* Online Users Sidebar */}
      <div className="w-1/3 border-r p-4 overflow-y-auto">
        <h2 className="font-bold mb-4">Online Users</h2>
        {onlineUsers.map((user) => (
          <div
            key={user.id}
            className={`p-2 cursor-pointer hover:bg-gray-200 ${
              currentChatUser?.id === user.id ? "bg-gray-300" : ""
            }`}
            onClick={() => startConversation(user)}
          >
            {user.username}
          </div>
        ))}
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col p-4">
        {currentChatUser ? (
          <>
            <h2 className="font-bold mb-2">{currentChatUser.username}</h2>
            <div className="flex-1 overflow-y-auto border rounded p-2 mb-2">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`mb-2 flex flex-col ${
                    msg.senderId === userId ? "items-end" : "items-start"
                  }`}
                >
                  <p
                    className={`text-xs text-gray-400 mb-1 ${
                      msg.senderId === userId ? "text-right" : "text-left"
                    }`}
                  >
                    {msg.senderId === userId ? "You" : msg.senderName}
                  </p>

                  <ChatMessage
                    text={`${msg.content}`}
                    isUser={msg.senderId === userId}
                  />
                </div>
              ))}
            </div>
            <ChatInput onSend={handleSend} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select a user to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
