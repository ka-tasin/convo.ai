import type { FC } from "react";

interface ChatMessageProps {
  text: string;
  isUser: boolean;
}

const ChatMessage: FC<ChatMessageProps> = ({ text, isUser }) => {
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-2`}>
      <div
        className={`p-3 rounded-lg max-w-xs ${
          isUser ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-900"
        }`}
      >
        {text}
      </div>
    </div>
  );
};

export default ChatMessage;
