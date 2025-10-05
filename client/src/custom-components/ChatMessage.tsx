import type { FC } from "react";

interface ChatMessageProps {
  text: string;
  isUser: boolean;
}

const ChatMessage: FC<ChatMessageProps> = ({ text, isUser }) => {
  return (
    <div
      className={`p-2 rounded-lg max-w-[80%] ${
        isUser ? "bg-blue-500 text-white ml-auto" : "bg-gray-200 text-black"
      }`}
    >
      {text}
    </div>
  );
};

export default ChatMessage;
