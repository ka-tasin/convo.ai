const AILoadingMessage = () => {
  return (
    <div className="max-w-xs md:max-w-md lg:max-w-lg bg-gradient-to-r from-green-100 to-blue-100 border border-green-200 rounded-lg p-4 mx-auto">
      <div className="flex items-center mb-2">
        <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mr-2">
          <span className="text-white text-xs font-bold">AI</span>
        </div>
        <span className="text-xs font-semibold text-green-800">
          AI Assistant
        </span>
      </div>

      <div className="flex items-center space-x-3">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <div
            className="w-2 h-2 bg-green-500 rounded-full animate-pulse"
            style={{ animationDelay: "0.2s" }}
          ></div>
          <div
            className="w-2 h-2 bg-green-500 rounded-full animate-pulse"
            style={{ animationDelay: "0.4s" }}
          ></div>
        </div>
        <div className="flex-1">
          <p className="text-sm text-green-700 font-medium">
            Processing your question...
          </p>
          <p className="text-xs text-green-600">Generating response</p>
        </div>
      </div>
    </div>
  );
};

export default AILoadingMessage;
