import type { FC } from "react";
import { Link } from "react-router-dom";
import { Button } from "../custom-components/Button";

const Home: FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center space-y-8">
          {/* Main Heading */}
          <div className="space-y-6">
            <h1 className="text-6xl md:text-6xl font-semibold text-white leading-tight">
              Chat with{" "}
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                AI
              </span>
              <br />
              Instantly
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Experience real-time messaging with AI assistance. Chat with
              anyone, anytime—even when they're offline. Messages delivered when
              they're back.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Link to="/chat" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto px-8 py-3 text-md bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-xl hover:shadow-2xl transition-all duration-300">
                🚀 Start Chatting Now
              </Button>
            </Link>
            <Link to="/register" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto px-8 py-3 text-md border-white/20 text-white hover:bg-white/10 backdrop-blur-sm">
                Create Account
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16 max-w-4xl mx-auto">
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
              <div className="text-3xl mb-2">💬</div>
              <h3 className="text-white font-semibold text-lg mb-2">
                Real-time Chat
              </h3>
              <p className="text-gray-400 text-sm">
                Instant messaging with online users and AI assistance
              </p>
            </div>
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
              <div className="text-3xl mb-2">🤖</div>
              <h3 className="text-white font-semibold text-lg mb-2">
                AI Powered
              </h3>
              <p className="text-gray-400 text-sm">
                Smart AI assistant ready to help with @ai commands
              </p>
            </div>
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
              <div className="text-3xl mb-2">🌙</div>
              <h3 className="text-white font-semibold text-lg mb-2">
                Always Available
              </h3>
              <p className="text-gray-400 text-sm">
                Message offline users - they'll see it when back online
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center space-y-16">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-semibold text-white">
              How It Works
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Simple, powerful messaging with AI built right in
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Step 1 */}
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500/10 to-purple-600/10 backdrop-blur-sm rounded-2xl p-8 border border-blue-500/20 h-full">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg mb-6 shadow-lg">
                  1
                </div>
                <h3 className="text-white font-semibold text-xl mb-4">
                  Choose a User
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  Select anyone from your contacts list. Green for online, gray
                  for offline—message anyone!
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-600/10 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20 h-full">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg mb-6 shadow-lg">
                  2
                </div>
                <h3 className="text-white font-semibold text-xl mb-4">
                  Start Chatting
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  Send messages instantly. Use @ai for AI assistance or chat
                  naturally with friends.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="bg-gradient-to-br from-green-500/10 to-cyan-600/10 backdrop-blur-sm rounded-2xl p-8 border border-green-500/20 h-full">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white font-bold text-lg mb-6 shadow-lg">
                  3
                </div>
                <h3 className="text-white font-semibold text-xl mb-4">
                  Stay Connected
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  Offline users receive your messages when they return. Never
                  miss a conversation!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Preview */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/50 backdrop-blur-sm rounded-3xl p-12 border border-gray-700/50">
          <div className="text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-semibold text-white">
              Ready to Experience?
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Join of users enjoying seamless AI-powered conversations
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/chat" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto px-12 py-3 text-md bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-2xl hover:shadow-3xl transition-all duration-300">
                  Try Live Demo
                </Button>
              </Link>
              <Link to="/register" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto px-12 py-3 text-md border-white/30 text-white hover:bg-white/10 backdrop-blur-sm">
                  Create Free Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">AI</span>
            </div>
            <span className="text-lg font-bold text-white">Convo.AI</span>
          </div>
          <p className="text-gray-400 max-w-md mx-auto">
            Modern chat application with AI integration. Built with React,
            TypeScript, and real-time WebSockets.
          </p>
          <div className="flex justify-center space-x-6 mt-8">
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Terms
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
