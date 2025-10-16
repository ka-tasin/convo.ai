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

interface User extends TokenPayload {
  isOnline: boolean;
}

interface UnreadMessages {
  [userId: string]: number; // Track count of unread messages per user
}

const Chat = () => {
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<TokenPayload[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [currentChatUser, setCurrentChatUser] = useState<TokenPayload | null>(
    null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState<UnreadMessages>({});
  const currentChatUserRef = useRef<TokenPayload | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load unread messages from localStorage on component mount
  useEffect(() => {
    const savedUnreads = localStorage.getItem("unreadMessages");
    if (savedUnreads) {
      setUnreadMessages(JSON.parse(savedUnreads));
    }
  }, []);

  // Save unread messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("unreadMessages", JSON.stringify(unreadMessages));
  }, [unreadMessages]);

  // Debug useEffect - remove this in production
  useEffect(() => {
    const debugHandler = (event: string, data: unknown) => {
      console.log(`Socket event: ${event}`, data);
    };

    socket.on("receiveMessage", (data) => debugHandler("receiveMessage", data));
    socket.on("conversationLoaded", (data) =>
      debugHandler("conversationLoaded", data)
    );

    return () => {
      socket.off("receiveMessage", debugHandler);
      socket.off("conversationLoaded", debugHandler);
    };
  }, []);

  // Play notification sound
  const playNotificationSound = () => {
    // Create a simple notification sound using the Web Audio API
    try {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.2
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch {
      console.log("Audio context not supported");
    }
  };

  // Load current user & register socket
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const decoded = jwtDecode<TokenPayload>(token);
    setUserId(decoded.id);
    setUsername(decoded.username);

    console.log("Registering user:", decoded.id, decoded.username);
    socket.emit("registerUser", token);

    // Load all users when component mounts
    socket.emit("getAllUsers");

    socket.on("allUsers", (users: User[]) => {
      console.log("All users received:", users);
      setAllUsers(users.filter((u) => u.id !== decoded.id));
    });

    socket.on("onlineUsers", (users: TokenPayload[]) => {
      console.log("Online users received:", users);
      const onlineUserIds = users.map((u) => u.id);
      setOnlineUsers(users.filter((u) => u.id !== decoded.id));

      // Update allUsers with online status
      setAllUsers((prev) =>
        prev.map((user) => ({
          ...user,
          isOnline: onlineUserIds.includes(user.id),
        }))
      );
    });

    // Handle conversation loading
    const handleConversationLoaded = (msgs: Message[]) => {
      console.log("Conversation loaded:", msgs);
      setMessages(msgs);
    };

    socket.on("conversationLoaded", handleConversationLoaded);

    // Handle incoming messages
    const handleReceiveMessage = (msg: Message) => {
      console.log("Received message:", msg);

      // Hide loading state when AI responds
      if (msg.senderId === "ai") {
        console.log("AI response received, hiding thinking indicator");
        setIsAIThinking(false);
      }

      // Check if this message is for the current user but NOT in the current conversation
      const isMessageForCurrentUser =
        msg.receiverId === userId || msg.senderId === "ai";
      const isFromCurrentChatUser =
        msg.senderId === currentChatUserRef.current?.id;
      const isNotCurrentConversation =
        !isFromCurrentChatUser && msg.senderId !== "ai";

      if (isMessageForCurrentUser && isNotCurrentConversation) {
        // Increment unread count for this sender
        setUnreadMessages((prev) => ({
          ...prev,
          [msg.senderId]: (prev[msg.senderId] || 0) + 1,
        }));

        // Play notification sound
        playNotificationSound();
      }

      setMessages((prev) => {
        // Check if this message belongs to the current conversation
        const isCurrentConversation =
          (msg.senderId === userId &&
            msg.receiverId === currentChatUserRef.current?.id) ||
          (msg.senderId === currentChatUserRef.current?.id &&
            msg.receiverId === userId) ||
          (msg.senderId === "ai" &&
            (msg.receiverId === userId ||
              msg.receiverId === currentChatUserRef.current?.id));

        console.log("Is current conversation:", isCurrentConversation, {
          msgSender: msg.senderId,
          msgReceiver: msg.receiverId,
          userId,
          currentChatUserId: currentChatUserRef.current?.id,
        });

        if (isCurrentConversation) {
          // Avoid duplicates
          const exists = prev.some(
            (m) =>
              Math.abs(m.timestamp - msg.timestamp) < 1000 &&
              m.content === msg.content &&
              m.senderId === msg.senderId
          );

          if (!exists) {
            console.log("Adding new message to conversation");
            return [...prev, msg];
          } else {
            console.log("Message already exists, skipping");
          }
        } else {
          console.log("Message not for current conversation, skipping");
        }
        return prev;
      });
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("allUsers");
      socket.off("onlineUsers");
      socket.off("conversationLoaded", handleConversationLoaded);
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [userId]);

  const startConversation = (user: TokenPayload) => {
    console.log("Starting conversation with:", user);
    setCurrentChatUser(user);
    currentChatUserRef.current = user;
    setMessages([]);
    setIsAIThinking(false);

    // Clear unread messages for this user
    setUnreadMessages((prev) => {
      const newUnreads = { ...prev };
      delete newUnreads[user.id];
      return newUnreads;
    });

    // Load previous messages for this conversation
    socket.emit("loadConversation", { userId, otherId: user.id });
  };

  const handleSend = (text: string) => {
    if (!text.trim() || !currentChatUser) return;

    // Check if this is an AI question - use includes instead of startsWith for better detection
    const isAskingAI =
      text.toLowerCase().includes("@chatgpt") ||
      text.toLowerCase().includes("@ai") ||
      text.toLowerCase().includes("@gpt") ||
      text.toLowerCase().includes("@assistant") ||
      text.trim().endsWith("?");

    console.log("Sending message, isAskingAI:", isAskingAI, "Content:", text);

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
      console.log("Showing AI thinking indicator");
      setIsAIThinking(true);

      // Safety timeout - hide loading after 15 seconds if no response
      setTimeout(() => {
        if (isAIThinking) {
          console.log("AI response timeout reached");
          setIsAIThinking(false);

          // Optional: Show timeout message
          const timeoutMsg: Message = {
            senderId: "ai",
            senderName: "AI Assistant",
            receiverId: userId,
            content:
              "I'm having trouble responding right now. Please try again.",
            timestamp: Date.now(),
            isChatGPT: true,
          };
          setMessages((prev) => [...prev, timeoutMsg]);
        }
      }, 15000);
    }
  };

  const getMessageDisplayName = (msg: Message) => {
    if (msg.senderId === "ai") {
      return "AI Assistant";
    }
    return msg.senderId === userId ? "You" : msg.senderName;
  };

  const isUserOnline = (userId: string) => {
    return onlineUsers.some((user) => user.id === userId);
  };

  return (
    <div className="flex h-[90vh] bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Users Sidebar */}
      <div className="w-80 bg-gray-800/50 backdrop-blur-sm flex flex-col border-r border-gray-700/50">
        {/* Header */}
        <div className="p-6 border-b border-gray-700/50">
          <h2 className="font-semibold text-gray-200 flex items-center justify-between">
            <span className="flex items-center text-lg">
              <div className="w-3 h-3 bg-green-400 rounded-full mr-3 shadow-lg shadow-green-400/30 animate-pulse"></div>
              All Users
            </span>
            <span className="text-sm text-gray-300 bg-gray-700/50 px-3 py-1.5 rounded-full border border-gray-600/50">
              {allUsers.length}
            </span>
          </h2>
          <p className="text-xs text-gray-400 mt-2">
            Online: {onlineUsers.length} • Offline:{" "}
            {allUsers.length - onlineUsers.length}
          </p>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {allUsers.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              <div className="w-20 h-20 bg-gray-700/30 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-600/30 backdrop-blur-sm">
                <span className="text-3xl">👥</span>
              </div>
              <p className="text-sm font-medium text-gray-300">
                No users found
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Other users will appear here when they register
              </p>
            </div>
          ) : (
            allUsers.map((user) => (
              <div
                key={user.id}
                className={`flex items-center p-4 rounded-2xl cursor-pointer transition-all duration-300 backdrop-blur-sm border ${
                  currentChatUser?.id === user.id
                    ? "bg-blue-500/20 border-blue-400/40 shadow-2xl shadow-blue-500/20"
                    : "bg-gray-700/30 border-gray-600/30 hover:bg-gray-600/40 hover:border-gray-500/40 hover:shadow-lg"
                } relative`}
                onClick={() => startConversation(user)}
              >
                {/* Unread message badge */}
                {unreadMessages[user.id] > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg border border-red-300/50 z-10">
                    {unreadMessages[user.id] > 9
                      ? "9+"
                      : unreadMessages[user.id]}
                  </div>
                )}

                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-base font-semibold mr-4 transition-all duration-300 shadow-lg ${
                    currentChatUser?.id === user.id
                      ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-blue-500/25"
                      : user.isOnline
                      ? "bg-gradient-to-br from-green-500 to-green-600 text-white shadow-green-500/25"
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
                    {unreadMessages[user.id] > 0 && (
                      <span className="ml-2 text-red-400 text-xs">
                        ({unreadMessages[user.id]} new)
                      </span>
                    )}
                  </span>
                  <span
                    className={`text-xs flex items-center mt-1 ${
                      currentChatUser?.id === user.id
                        ? "text-blue-300/70"
                        : user.isOnline
                        ? "text-green-400"
                        : "text-gray-400"
                    }`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full mr-2 shadow ${
                        user.isOnline
                          ? "bg-green-400 shadow-green-400/30"
                          : "bg-gray-500 shadow-gray-500/30"
                      }`}
                    ></div>
                    {user.isOnline ? "Online" : "Offline"}
                  </span>
                </div>
                {!user.isOnline && (
                  <div className="text-xs text-gray-500 bg-gray-600/30 px-2 py-1 rounded-lg border border-gray-500/30">
                    💤
                  </div>
                )}
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
              Message anyone - they'll see it when online. Use{" "}
              <code className="bg-gray-600/50 px-2 py-1 rounded-lg text-blue-300 border border-gray-500/30 text-xs">
                @ai
              </code>{" "}
              for AI help
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
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center mr-4 shadow-lg ${
                      isUserOnline(currentChatUser.id)
                        ? "bg-gradient-to-br from-green-500 to-green-600"
                        : "bg-gradient-to-br from-gray-600 to-gray-700"
                    }`}
                  >
                    <span className="text-white text-base font-semibold">
                      {currentChatUser.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-100 text-xl">
                      {currentChatUser.username}
                    </h2>
                    <p className="text-sm text-gray-400 flex items-center mt-1">
                      <div
                        className={`w-2 h-2 rounded-full mr-2 ${
                          isUserOnline(currentChatUser.id)
                            ? "bg-green-400"
                            : "bg-gray-500"
                        }`}
                      ></div>
                      {isUserOnline(currentChatUser.id)
                        ? "Online"
                        : "Offline - will see messages when back"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-400">
                  <div
                    className={`w-2 h-2 rounded-full mr-2 ${
                      isUserOnline(currentChatUser.id)
                        ? "bg-green-400"
                        : "bg-gray-500"
                    }`}
                  ></div>
                  {isUserOnline(currentChatUser.id) ? "Online" : "Offline"}
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
                    {isUserOnline(currentChatUser.id)
                      ? "Send a message or ask the AI assistant using @ai"
                      : "They're offline but will see your messages when they come online"}
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
              <div className="mb-3">
                {!isUserOnline(currentChatUser.id) && (
                  <div className="text-xs text-yellow-400 bg-yellow-400/10 px-3 py-2 rounded-lg border border-yellow-400/20 backdrop-blur-sm text-center">
                    💤 {currentChatUser.username} is offline - they'll see your
                    messages when they come online
                  </div>
                )}
              </div>
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
                Choose someone to start chatting. Message anyone - they'll see
                it when they come online.
              </p>
              {Object.keys(unreadMessages).length > 0 && (
                <div className="mt-4 text-sm text-green-400 bg-green-400/10 px-4 py-2 rounded-lg border border-green-400/20">
                  You have {Object.keys(unreadMessages).length} conversation(s)
                  with unread messages
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
