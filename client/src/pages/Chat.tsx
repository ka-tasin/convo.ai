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
  const [isAIThinking, setIsAIThinking] = useState(false);
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
      // Hide loading state when AI responds
      if (msg.senderId === "ai") {
        setIsAIThinking(false);
      }

      setMessages((prev) => {
        // If the message belongs to the current conversation, append
        if (
          currentChatUserRef.current &&
          (msg.senderId === currentChatUserRef.current.id ||
            msg.receiverId === currentChatUserRef.current.id ||
            msg.senderId === "ai")
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
    setIsAIThinking(false); // Reset loading state

    // Load previous messages
    socket.emit("loadConversation", { userId, otherId: user.id });
    socket.once("conversationLoaded", (msgs: Message[]) => setMessages(msgs));
  };

  const handleSend = (text: string) => {
    if (!text.trim() || !currentChatUser) return;

    // Check if this is an AI question
    const isAskingAI =
      text.toLowerCase().startsWith("@chatgpt") ||
      text.toLowerCase().startsWith("@ai") ||
      text.toLowerCase().startsWith("@gpt") ||
      text.toLowerCase().startsWith("@assistant") ||
      text.trim().endsWith("?");

    const msg: Message = {
      senderId: userId,
      senderName: username,
      receiverId: currentChatUser.id,
      content: text,
      timestamp: Date.now(),
    };

    socket.emit("sendMessage", msg);

    // Show loading state for AI questions
    if (isAskingAI) {
      setIsAIThinking(true);

      // Safety timeout - hide loading after 10 seconds if no response
      setTimeout(() => {
        setIsAIThinking(false);
      }, 10000);
    }
  };

  const getMessageDisplayName = (msg: Message) => {
    if (msg.senderId === "ai") {
      return "AI Assistant";
    }
    return msg.senderId === userId ? "You" : msg.senderName;
  };

  return (
    <div className="flex h-[90vh] bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Online Users Sidebar */}
      <div className="w-80 bg-gray-800/50 backdrop-blur-sm flex flex-col border-r border-gray-700/50">
        {/* Header */}
        <div className="p-6 border-b border-gray-700/50">
          <h2 className="font-semibold text-gray-200 flex items-center justify-between">
            <span className="flex items-center text-lg">
              <div className="w-3 h-3 bg-green-400 rounded-full mr-3 shadow-lg shadow-green-400/30 animate-pulse"></div>
              Online Users
            </span>
            <span className="text-sm text-gray-300 bg-gray-700/50 px-3 py-1.5 rounded-full border border-gray-600/50">
              {onlineUsers.length}
            </span>
          </h2>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {onlineUsers.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              <div className="w-20 h-20 bg-gray-700/30 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-600/30 backdrop-blur-sm">
                <span className="text-3xl">👥</span>
              </div>
              <p className="text-sm font-medium text-gray-300">No one online</p>
              <p className="text-xs text-gray-500 mt-2">
                Others will appear here when they join
              </p>
            </div>
          ) : (
            onlineUsers.map((user) => (
              <div
                key={user.id}
                className={`flex items-center p-4 rounded-2xl cursor-pointer transition-all duration-300 backdrop-blur-sm border ${
                  currentChatUser?.id === user.id
                    ? "bg-blue-500/20 border-blue-400/40 shadow-2xl shadow-blue-500/20"
                    : "bg-gray-700/30 border-gray-600/30 hover:bg-gray-600/40 hover:border-gray-500/40 hover:shadow-lg"
                }`}
                onClick={() => startConversation(user)}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-base font-semibold mr-4 transition-all duration-300 shadow-lg ${
                    currentChatUser?.id === user.id
                      ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-blue-500/25"
                      : "bg-gradient-to-br from-gray-600 to-gray-700 text-gray-300 shadow-gray-600/25"
                  }`}
                >
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <span
                    className={`font-semibold text-sm block truncate ${
                      currentChatUser?.id === user.id
                        ? "text-blue-300"
                        : "text-gray-200"
                    }`}
                  >
                    {user.username}
                  </span>
                  <span
                    className={`text-xs flex items-center mt-1 ${
                      currentChatUser?.id === user.id
                        ? "text-blue-300/70"
                        : "text-gray-400"
                    }`}
                  >
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 shadow shadow-green-400/30"></div>
                    Online
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* AI Assistant Panel */}
        <div className="p-4 border-t border-gray-700/50">
          <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-2xl p-5 border border-gray-600/30 backdrop-blur-sm shadow-lg">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                <span className="text-white text-sm font-bold">AI</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-200 text-sm">
                  AI Assistant
                </h3>
                <div className="flex items-center mt-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 shadow shadow-green-400/40"></div>
                  <span className="text-xs text-green-400 font-medium">
                    Ready to help
                  </span>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Use{" "}
              <code className="bg-gray-600/50 px-2 py-1 rounded-lg text-blue-300 border border-gray-500/30 text-xs">
                @ai
              </code>{" "}
              to ask questions in any conversation
            </p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-900 to-gray-800">
        {currentChatUser ? (
          <>
            {/* Chat Header */}
            <div className="p-6 border-b border-gray-700/50 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                    <span className="text-white text-base font-semibold">
                      {currentChatUser.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-100 text-xl">
                      {currentChatUser.username}
                    </h2>
                    <p className="text-sm text-gray-400 flex items-center mt-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      AI Assistant available in chat
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  Online
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-gray-900 to-gray-800">
              {messages.length === 0 ? (
                <div className="text-center text-gray-400 py-16">
                  <div className="w-24 h-24 bg-gray-700/30 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-gray-600/30 backdrop-blur-sm">
                    <span className="text-4xl">💬</span>
                  </div>
                  <p className="text-lg font-medium text-gray-300 mb-3">
                    Start a conversation
                  </p>
                  <p className="text-sm text-gray-500 max-w-md mx-auto">
                    Send a message or ask the AI assistant using{" "}
                    <code className="bg-gray-700/50 px-2 py-1 rounded-lg text-blue-300 border border-gray-600/50 text-xs">
                      @ai
                    </code>
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col ${
                        msg.senderId === userId
                          ? "items-end"
                          : msg.senderId === "ai"
                          ? "items-start"
                          : "items-start"
                      }`}
                    >
                      <p
                        className={`text-xs mb-2 px-4 ${
                          msg.senderId === userId
                            ? "text-right text-gray-400"
                            : "text-left text-gray-400"
                        }`}
                      >
                        {getMessageDisplayName(msg)}
                        <span className="ml-2 text-gray-500">
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </p>

                      <ChatMessage
                        text={msg.content}
                        isUser={msg.senderId === userId}
                        isChatGPT={msg.senderId === "ai"}
                      />
                    </div>
                  ))}

                  {/* AI Thinking Indicator */}
                  {isAIThinking && (
                    <div className="flex flex-col items-start">
                      <p className="text-xs text-gray-400 mb-2 px-4">
                        AI Assistant
                        <span className="ml-2 text-gray-500">
                          {new Date().toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </p>
                      <div className="max-w-md bg-gray-700/30 border border-gray-600/30 rounded-2xl p-5 backdrop-blur-sm">
                        <div className="flex items-center space-x-3">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                            <div
                              className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"
                              style={{ animationDelay: "0.4s" }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-300 font-medium">
                            Thinking...
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-6 border-t border-gray-700/50 backdrop-blur-sm">
              <ChatInput onSend={handleSend} />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
            <div className="text-center">
              <div className="w-28 h-28 bg-gray-700/30 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-gray-600/30 backdrop-blur-sm">
                <span className="text-5xl">💭</span>
              </div>
              <p className="text-xl font-medium text-gray-300 mb-3">
                Select a conversation
              </p>
              <p className="text-gray-500 max-w-sm text-sm">
                Choose someone from the online users list to start chatting with
                AI assistance
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
