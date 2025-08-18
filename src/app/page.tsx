"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, MessageCircle } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface KnowledgeChunk {
  id: string;
  topic: string;
  keywords: string[];
  response: string;
  followUps?: string[];
  weight?: number;
}

interface ConversationContext {
  lastTopic?: string;
  mentionedTopics: string[];
  userName?: string;
}

const PortfolioChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [context, setContext] = useState<ConversationContext>({ mentionedTopics: [] });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Knowledge base - Replace this with your actual information
  const knowledgeBase: KnowledgeChunk[] = [
    {
      id: 'intro',
      topic: 'introduction',
      keywords: ['hello', 'hi', 'hey', 'who are you', 'introduction', 'about', 'yourself'],
      response: "Hi there! 👋 I'm Senghuy's digital twin - a chatbot version of them! I'm here to tell you all about Senghuy's skills, projects, and experiences. What would you like to know?",
      followUps: ['Ask about my projects', 'Tell me about my skills', 'What\'s my background?']
    },
    {
      id: 'skills',
      topic: 'skills',
      keywords: ['skills', 'technologies', 'programming', 'languages', 'tech stack', 'tools', 'frameworks'],
      response: "I'm passionate about full-stack development! My main skills include:\n\n🐍 Python (Django, FastAPI, ML/AI)\n⚛️ React & TypeScript\n🗄️ PostgreSQL & MongoDB\n☁️ AWS & Docker\n🤖 Machine Learning (RAG, LLMs)\n\nI love learning new technologies and currently exploring AI integration in web apps!",
      followUps: ['Want to see my projects?', 'Ask about my AI experience', 'Tell me about my learning journey']
    },
    {
      id: 'projects',
      topic: 'projects',
      keywords: ['projects', 'work', 'portfolio', 'built', 'created', 'developed', 'examples'],
      response: "Here are some projects I'm proud of:\n\n🤖 **RAG Chatbot** - Personal AI assistant using Mistral-7B\n💼 **Task Manager App** - React + Node.js with real-time updates\n📊 **Data Visualization Dashboard** - Python + D3.js analytics tool\n🌐 **E-commerce Platform** - Full-stack with payment integration\n\nEach project taught me something new and pushed my boundaries!",
      followUps: ['Want technical details?', 'Ask about my development process', 'What challenges did I face?']
    },
    {
      id: 'experience',
      topic: 'experience',
      keywords: ['experience', 'background', 'career', 'work history', 'job', 'professional'],
      response: "I have 3+ years of development experience, ranging from freelance projects to startup work. I've worked with:\n\n🏢 Startups (full-stack development)\n👥 Team collaboration & code reviews\n📈 Project management & client communication\n🎯 Agile development methodologies\n\nI believe in writing clean, maintainable code and continuous learning!",
      followUps: ['What industries have I worked in?', 'Ask about my teamwork style', 'Tell me about my achievements']
    },
    {
      id: 'ai_ml',
      topic: 'ai',
      keywords: ['ai', 'machine learning', 'ml', 'rag', 'llm', 'artificial intelligence', 'models'],
      response: "AI/ML is my newest passion! 🧠 I've been diving deep into:\n\n🔍 **RAG Systems** - Built my own with Mistral-7B\n📚 **Vector Databases** - Experience with embeddings & similarity search\n🤖 **LLM Integration** - API usage & fine-tuning concepts\n📊 **Data Processing** - ETL pipelines for ML workflows\n\nI love combining traditional web dev with AI capabilities!",
      followUps: ['Show me AI projects', 'What\'s next in my AI journey?', 'Ask about my learning resources']
    },
    {
      id: 'contact',
      topic: 'contact',
      keywords: ['contact', 'email', 'linkedin', 'github', 'hire', 'reach out', 'connect'],
      response: "I'd love to connect! Here's how you can reach me:\n\n📧 **Email:** alex@example.com\n💼 **LinkedIn:** /in/alex-developer\n🐱 **GitHub:** /alex-codes\n🌐 **Portfolio:** alex-portfolio.dev\n\nAlways open to discussing new opportunities, collaborations, or just chatting about tech!",
      followUps: ['What type of work am I looking for?', 'Tell me about my availability', 'Ask about collaboration']
    },
    {
      id: 'personality',
      topic: 'personality',
      keywords: ['personality', 'interests', 'hobbies', 'fun', 'outside work', 'personal'],
      response: "When I'm not coding, you'll find me:\n\n🎮 Gaming (love indie games & puzzle games)\n📚 Reading tech blogs & sci-fi novels\n☕ Exploring new coffee shops (I'm a bit of a coffee snob!)\n🏃 Running & staying active\n🎵 Listening to lo-fi while coding\n\nI believe the best developers are curious about everything, not just code!",
      followUps: ['What games do I play?', 'Ask about my favorite books', 'Tell me about my coding setup']
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Welcome message
    const welcomeMessage: Message = {
      id: 'welcome',
      content: "Hey! I'm a chatbot version of Senghuy's portfolio. I can tell you about their skills, projects, experience, and more. What would you like to know?",
      sender: 'bot',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, []);

  const findBestMatch = (query: string): KnowledgeChunk | null => {
    const normalizedQuery = query.toLowerCase();
    let bestMatch: KnowledgeChunk | null = null;
    let highestScore = 0;

    for (const chunk of knowledgeBase) {
      let score = 0;
      
      // Check for keyword matches
      for (const keyword of chunk.keywords) {
        if (normalizedQuery.includes(keyword.toLowerCase())) {
          score += keyword.length; // Longer keywords get higher weight
        }
      }
      
      // Bonus for exact topic match
      if (normalizedQuery.includes(chunk.topic)) {
        score += 10;
      }

      // Context bonus - if we were just talking about this topic
      if (context.lastTopic === chunk.topic) {
        score += 5;
      }

      if (score > highestScore) {
        highestScore = score;
        bestMatch = chunk;
      }
    }

    return highestScore > 0 ? bestMatch : null;
  };

  const generateFallbackResponse = (query: string): string => {
    const fallbacks = [
      "That's an interesting question! I don't have specific info on that, but I'd love to tell you about my projects, skills, or experience. What interests you most?",
      "Hmm, I'm not sure about that one! But I can share details about my development background, recent projects, or technical skills. What would you like to explore?",
      "I don't have that information handy, but I'm full of stories about coding adventures, project challenges, and tech discoveries! What aspect of my journey interests you?",
      "Great question, though I don't have those details! I can tell you about my programming experience, AI projects, or development philosophy. What sounds interesting?"
    ];
    
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate thinking time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    const match = findBestMatch(input);
    let botResponse: string;
    let followUps: string[] = [];

    if (match) {
      botResponse = match.response;
      followUps = match.followUps || [];
      
      // Update context
      setContext(prev => ({
        lastTopic: match.topic,
        mentionedTopics: [...prev.mentionedTopics, match.topic].slice(-5), // Keep last 5
        userName: prev.userName
      }));
    } else {
      botResponse = generateFallbackResponse(input);
    }

    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: botResponse,
      sender: 'bot',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botMessage]);
    setIsTyping(false);

    // Add follow-up suggestions if available
    if (followUps.length > 0) {
      setTimeout(() => {
        const followUpMessage: Message = {
          id: (Date.now() + 2).toString(),
          content: `💡 You might also want to ask:\n${followUps.map(f => `• ${f}`).join('\n')}`,
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, followUpMessage]);
      }, 500);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickResponse = async (response: string) => {
    if (isTyping) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: response,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Simulate thinking time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    const match = findBestMatch(response);
    let botResponse: string;
    let followUps: string[] = [];

    if (match) {
      botResponse = match.response;
      followUps = match.followUps || [];
      
      // Update context
      setContext(prev => ({
        lastTopic: match.topic,
        mentionedTopics: [...prev.mentionedTopics, match.topic].slice(-5), // Keep last 5
        userName: prev.userName
      }));
    } else {
      botResponse = generateFallbackResponse(response);
    }

    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: botResponse,
      sender: 'bot',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botMessage]);
    setIsTyping(false);

    // Add follow-up suggestions if available
    if (followUps.length > 0) {
      setTimeout(() => {
        const followUpMessage: Message = {
          id: (Date.now() + 2).toString(),
          content: `💡 You might also want to ask:\n${followUps.map(f => `• ${f}`).join('\n')}`,
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, followUpMessage]);
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <MessageCircle className="w-12 h-12 text-purple-400 mr-3" />
            <h1 className="text-4xl font-bold text-white">Senghuy's Portfolio Bot</h1>
          </div>
          <p className="text-purple-200 text-lg">Chat with my digital twin to learn about my skills and experience!</p>
        </div>

        {/* Chat Container */}
        <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden">
          {/* Messages Area */}
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${
                  message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.sender === 'user'
                      ? 'bg-purple-500'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600'
                  }`}
                >
                  {message.sender === 'user' ? (
                    <User className="w-5 h-5 text-white" />
                  ) : (
                    <Bot className="w-5 h-5 text-white" />
                  )}
                </div>
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/20 text-white backdrop-blur-sm'
                  }`}
                >
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                    {message.content}
                  </pre>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-white/20 backdrop-blur-sm px-4 py-3 rounded-2xl">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Buttons */}
          <div className="px-6 py-3 border-t border-white/10">
            <div className="flex flex-wrap gap-2">
              {['Tell me about your skills', 'Show me your projects', 'What\'s your experience?', 'How can I contact you?'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleQuickResponse(suggestion)}
                  disabled={isTyping}
                  className="px-3 py-1 text-sm bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors duration-200 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-6 border-t border-white/10">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about Senghuy's skills, projects, or experience..."
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/60 resize-none focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                  rows={1}
                  disabled={isTyping}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl hover:from-purple-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
              >
                <Send className="w-5 h-5" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-purple-200/80">
            See you soon • 
            <a href="#" className="text-purple-400 hover:text-purple-300 ml-1">
              SenghuyJR11
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PortfolioChatbot;