interface ChatMessageProps {
  text: string;
  isUser: boolean;
  isChatGPT?: boolean;
}

const ChatMessage = ({ text, isUser, isChatGPT }: ChatMessageProps) => {
  if (isChatGPT) {
    return (
      <div className="max-w-2xl bg-gray-700/30 border border-gray-600/30 rounded-2xl p-5 backdrop-blur-sm shadow-lg">
        <div className="flex items-center mb-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
            <span className="text-white text-xs font-bold">AI</span>
          </div>
          <span className="text-sm font-semibold text-gray-300">
            AI Assistant
          </span>
        </div>
        <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
          {text}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`max-w-2xl rounded-2xl px-5 py-3 backdrop-blur-sm shadow-lg ${
        isUser
          ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-500/25"
          : "bg-gray-700/30 text-gray-200 border border-gray-600/30"
      }`}
    >
      <p className="whitespace-pre-wrap break-words leading-relaxed text-sm">
        {text}
      </p>
    </div>
  );
};

export default ChatMessage;
