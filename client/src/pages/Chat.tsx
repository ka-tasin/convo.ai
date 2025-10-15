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
  isChatGPT?: boolean;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
            msg.receiverId === currentChatUserRef.current.id ||
            msg.senderId === "chatgpt")
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
    setMessages([]);

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
  };

  const getMessageDisplayName = (msg: Message) => {
    if (msg.senderId === "chatgpt") {
      return "ChatGPT";
    }
    return msg.senderId === userId ? "You" : msg.senderName;
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

        {/* ChatGPT Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-bold text-blue-800 mb-2">ChatGPT Assistant</h3>
          <p className="text-sm text-blue-600">
            To ask ChatGPT, start your message with <code>@chatgpt</code>,{" "}
            <code>@ai</code>, or <code>@gpt</code>, or simply ask a question
            ending with ?
          </p>
          <p className="text-xs text-blue-500 mt-2">
            Both you and {currentChatUser?.username || "the other user"} will
            see ChatGPT's responses.
          </p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentChatUser ? (
          <>
            <div className="p-4 border-b bg-white">
              <h2 className="font-bold">{currentChatUser.username}</h2>
              <p className="text-sm text-gray-500">
                Chat with {currentChatUser.username} and ChatGPT
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {messages.length === 0 ? (
                <div className="text-center text-gray-400 mt-8">
                  <p>No messages yet. Start a conversation!</p>
                  <p className="text-sm mt-2">
                    Tip: Ask ChatGPT by starting with @chatgpt or asking a
                    question
                  </p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`mb-4 flex flex-col ${
                      msg.senderId === userId
                        ? "items-end"
                        : msg.senderId === "chatgpt"
                        ? "items-center"
                        : "items-start"
                    }`}
                  >
                    <p
                      className={`text-xs text-gray-500 mb-1 ${
                        msg.senderId === userId ? "text-right" : "text-left"
                      }`}
                    >
                      {getMessageDisplayName(msg)}
                      <span className="ml-2 text-gray-400">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </p>

                    <ChatMessage
                      text={msg.content}
                      isUser={msg.senderId === userId}
                      isChatGPT={msg.senderId === "chatgpt"}
                    />
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t bg-white">
              <ChatInput onSend={handleSend} />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <p>Select a user to start chatting</p>
              <p className="text-sm mt-2">
                ChatGPT is available in all conversations
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
