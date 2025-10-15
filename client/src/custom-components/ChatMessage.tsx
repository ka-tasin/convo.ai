interface ChatMessageProps {
  text: string;
  isUser: boolean;
  isChatGPT?: boolean;
}

const ChatMessage = ({ text, isUser, isChatGPT }: ChatMessageProps) => {
  if (isChatGPT) {
    return (
      <div className="max-w-xs md:max-w-md lg:max-w-lg bg-gradient-to-r from-green-100 to-blue-100 border border-green-200 rounded-lg p-3 mx-auto">
        <div className="flex items-center mb-1">
          <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mr-2">
            <span className="text-white text-xs font-bold">AI</span>
          </div>
          <span className="text-xs font-semibold text-green-800">
            AI Assistant
          </span>
        </div>
        <p className="text-gray-800 text-sm whitespace-pre-wrap">{text}</p>
      </div>
    );
  }

  return (
    <div
      className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg p-3 ${
        isUser ? "bg-blue-500 text-white ml-auto" : "bg-gray-200 text-gray-800"
      }`}
    >
      <p className="whitespace-pre-wrap break-words">{text}</p>
    </div>
  );
};

export default ChatMessage;
