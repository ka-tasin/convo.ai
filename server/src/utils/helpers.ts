export function getPortfolioAIResponse(question: string): string {
  const lowerQuestion = question.toLowerCase().trim();

  // Enhanced response database for portfolio
  const portfolioResponses: Record<string, string> = {
    // Greetings
    hello:
      "👋 Hello! I'm the AI assistant in this portfolio project. I can demonstrate real-time AI chat integration!",
    hi: "😊 Hi there! This demo shows AI messaging between users - perfect for testing the app.",
    hey: "👋 Hey! Welcome to the chat demo. Try asking me various questions to see the AI in action!",

    // About the AI
    "how are you":
      "🎯 I'm running in portfolio mode! This demonstrates AI integration without API dependencies.",
    "who are you":
      "🤖 I'm a demo AI assistant showcasing real-time chat features. In production, I'd use OpenAI GPT!",
    "what are you":
      "🚀 I'm part of a portfolio project demonstrating: real-time messaging, user auth, and AI integration!",
    "what can you do":
      "💡 I can: Answer questions, chat with multiple users, demonstrate real-time features - all in this portfolio demo!",

    // Project info
    portfolio:
      "📁 This is a portfolio project featuring: React + TypeScript + Socket.io + Node.js + AI integration!",
    demo: "🎮 You're experiencing the demo! Real AI would be enabled in production with an OpenAI API key.",
    project:
      "💼 This chat app demonstrates full-stack skills: real-time messaging, authentication, and scalable architecture.",

    // Technical questions
    "how does this work":
      "🔧 Tech stack: React frontend, Node.js/Express backend, Socket.io for real-time messaging, JWT auth!",
    "what technology":
      "⚙️ Built with: React, TypeScript, Node.js, Express, Socket.io, MongoDB, JWT, and AI integration!",
    "source code":
      "📚 This project showcases clean, maintainable code structure and production-ready patterns.",

    // Fun facts
    "who is obama":
      "🇺🇸 Barack Obama was the 44th US President (2009-2017). This demo shows AI knowledge responses!",
    "where is tajmahal":
      "🏛️ Taj Mahal is in Agra, India - a beautiful marble mausoleum! Demo AI can answer geography questions.",
    "tell me a joke":
      "😄 Why do programmers prefer dark mode? Because light attracts bugs! This shows AI humor integration.",
    "capital of france":
      "🗼 Paris is the capital of France! The AI can handle geography and trivia questions.",
    weather:
      "🌤️ I'm in demo mode, but this could integrate with weather APIs in production!",

    // Help
    help: "❓ Try asking about: people, places, tech, jokes, or how this app works! Great for demo purposes.",
    commands:
      "💬 Use @ai, @chatgpt, or end with ? to talk to me. Perfect for testing the AI features!",

    // Time
    time: `⏰ Current time: ${new Date().toLocaleTimeString()}. Demo shows real-time messaging capabilities!`,
    date: `📅 Today is ${new Date().toLocaleDateString()}. The app handles real-time data efficiently.`,

    // Features
    features:
      "⭐ Features: Real-time chat, online users, AI integration, JWT auth, responsive design!",
    "real time":
      "⚡ Yes! This uses Socket.io for instant messaging between users - no page refresh needed!",

    // Offline messaging
    "offline message":
      "💤 You can message offline users! They'll see your messages when they come back online.",
    "message offline":
      "📨 Messages to offline users are stored and delivered when they reconnect. Perfect for async communication!",

    // Additional responses from original code
    "how do":
      "🔍 That's a great \"how-to\" question! In production, I'd provide step-by-step guidance using AI intelligence.",
    "how to":
      "🔍 That's a great \"how-to\" question! In production, I'd provide step-by-step guidance using AI intelligence.",
    "what is":
      "📚 I can explain concepts in demo mode! Production AI would give detailed explanations.",
    "what are":
      "📚 I can explain concepts in demo mode! Production AI would give detailed explanations.",
    "who is":
      "👤 I can identify people in demo mode! Real AI would provide comprehensive biographies.",
    "who are":
      "👤 I can identify people in demo mode! Real AI would provide comprehensive biographies.",
    "where is":
      "🗺️ I can locate places in demo mode! Production would use geolocation APIs.",
  };

  // Exact matches first
  for (const [key, response] of Object.entries(portfolioResponses)) {
    if (lowerQuestion === key) {
      return response;
    }
  }

  // Partial matches for more specific queries
  for (const [key, response] of Object.entries(portfolioResponses)) {
    if (lowerQuestion.includes(key) && key.length > 3) {
      return response;
    }
  }

  // Smart responses for common patterns
  if (lowerQuestion.includes("how do") || lowerQuestion.includes("how to")) {
    const topic = lowerQuestion.replace(/how\s+(do|to)\s+/, "").trim();
    return `🔍 That's a great \"how-to\" question about "${topic}"! In production, I'd provide step-by-step guidance using AI intelligence.`;
  }

  if (lowerQuestion.includes("what is") || lowerQuestion.includes("what are")) {
    const topic = lowerQuestion.replace(/what\s+(is|are)\s+/, "").trim();
    return `📚 About "${topic}" - I can explain concepts in demo mode! Production AI would give detailed explanations.`;
  }

  if (lowerQuestion.includes("who is") || lowerQuestion.includes("who are")) {
    const person = lowerQuestion.replace(/who\s+(is|are)\s+/, "").trim();
    return `👤 "${person}" - Demo AI can identify people! Real AI would provide comprehensive biographies.`;
  }

  if (lowerQuestion.includes("where is")) {
    const place = lowerQuestion.replace("where is", "").trim();
    return `🗺️ "${place}" - I can locate places in demo mode! Production would use geolocation APIs.`;
  }

  if (lowerQuestion.includes("when is")) {
    const event = lowerQuestion.replace("when is", "").trim();
    return `📅 "${event}" - I can discuss dates and events! Production AI would provide accurate timing information.`;
  }

  if (lowerQuestion.includes("why is") || lowerQuestion.includes("why are")) {
    const topic = lowerQuestion.replace(/why\s+(is|are)\s+/, "").trim();
    return `🤔 "${topic}" - Great analytical question! Production AI would provide detailed explanations and reasoning.`;
  }

  if (lowerQuestion.endsWith("?")) {
    // Categorize question types for better responses
    if (lowerQuestion.includes("best") || lowerQuestion.includes("recommend")) {
      return "⭐ That's a recommendation question! Production AI would analyze options and suggest the best choice based on your needs.";
    }

    if (
      lowerQuestion.includes("difference between") ||
      lowerQuestion.includes("vs")
    ) {
      return "🔍 Comparative question! Production AI would highlight key differences and help you make informed decisions.";
    }

    if (lowerQuestion.includes("should i") || lowerQuestion.includes("can i")) {
      return "💭 Decision-making question! Production AI would weigh pros and cons to guide your choice.";
    }

    return "❓ Great question! This demonstrates the AI's ability to handle inquiries in a chat environment.";
  }

  // Check for greetings without exact matches
  const greetingWords = [
    "hello",
    "hi",
    "hey",
    "greetings",
    "good morning",
    "good afternoon",
    "good evening",
  ];
  if (greetingWords.some((word) => lowerQuestion.includes(word))) {
    return "👋 Hello! Thanks for testing this portfolio chat application. How can I help you explore the features?";
  }

  // Check for thank you messages
  if (lowerQuestion.includes("thank") || lowerQuestion.includes("thanks")) {
    return "🙏 You're welcome! This demo shows how AI can provide helpful and polite responses in a chat interface.";
  }

  // Check for goodbye messages
  if (
    lowerQuestion.includes("bye") ||
    lowerQuestion.includes("goodbye") ||
    lowerQuestion.includes("see you")
  ) {
    return "👋 Goodbye! Thanks for testing the portfolio chat app. Feel free to come back and explore more features!";
  }

  // Default portfolio responses
  const defaultResponses = [
    "🎯 Thanks for testing this portfolio project! I'm demonstrating AI chat integration.",
    "🚀 This demo shows real-time messaging with AI capabilities - perfect for showcasing full-stack skills!",
    "💼 In a production environment, this would use OpenAI GPT for intelligent responses.",
    "👨‍💻 This portfolio project demonstrates: real-time features, clean architecture, and AI integration patterns.",
    "🔧 Nice question! This showcases the AI response system in a full-stack application.",
    "⭐ You're experiencing the demo version! The real AI would provide more nuanced answers.",
    "🤖 I'm here to help demonstrate chat functionality! Try asking about the project or technical details.",
    "💡 This portfolio showcases: WebSocket communication, user authentication, and AI assistant integration!",
    "🎮 You're chatting with the demo AI! In production, this would connect to advanced language models.",
    "📱 This responsive chat interface demonstrates modern web development practices and real-time features.",
  ];

  return (
    defaultResponses[Math.floor(Math.random() * defaultResponses.length)] ??
    "🤖 I'm here to help! This portfolio project demonstrates real-time AI chat capabilities."
  );
}
