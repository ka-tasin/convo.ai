import { useState } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
}

const ChatInput = ({ onSend }: ChatInputProps) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message);
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-4">
      <div className="flex-1 relative">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message... (Use @ai for assistance)"
          className="w-full p-4 bg-gray-700/50 border border-gray-600/30 rounded-2xl text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300 backdrop-blur-sm shadow-lg"
        />
        {message.toLowerCase().startsWith("@ai") && (
          <div className="absolute -top-8 left-0 bg-blue-500/20 text-blue-300 text-xs px-3 py-1.5 rounded-full border border-blue-500/30 backdrop-blur-sm">
            AI Assistant will respond
          </div>
        )}
      </div>
      <button
        type="submit"
        disabled={!message.trim()}
        className="px-8 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl disabled:hover:shadow-lg font-medium"
      >
        Send
      </button>
    </form>
  );
};

export default ChatInput;
