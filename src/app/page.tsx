"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot } from 'lucide-react';


interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: string;
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
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Knowledge base - Senghuy's information
  const knowledgeBase: KnowledgeChunk[] = [
    {
      id: 'intro',
      topic: 'introduction',
      keywords: ['hello', 'hi', 'hey', 'who are you', 'introduction', 'about', 'yourself'],
      response:
        "Hi there! I'm Senghuy's digital twin - a chatbot version of him! I'm here to tell you all about Senghuy's academic journey, research, and experiences. What would you like to know?",
      followUps: ['Ask about my studies', 'Tell me about my research', "What's my background?"],
    },
    {
      id: 'education',
      topic: 'education',
      keywords: ['education', 'studies', 'university', 'degree', 'master', 'school', 'academic'],
      response:
        "I'm currently pursuing a Master's degree in Digital Anti-Aging Healthcare at Inje University, South Korea. I started my program in September 2024, focusing on applying AI technologies to preventive care, digital wellness, and smart aging systems.\n\nI'm originally from Battambang province in Cambodia and came to South Korea through the Global Korea Scholarship (GKS) program. My academic interests lie at the intersection of artificial intelligence, digital healthcare platforms, and aging-related innovations.",
      followUps: ['Tell me about my research', 'Ask about my scholarship', 'What are my specializations?'],
    },
    {
      id: 'research',
      topic: 'research',
      keywords: ['research', 'ai', 'artificial intelligence', 'specialization', 'computer vision', 'machine learning', 'healthcare'],
      response:
        "My research specializations include:\n\n**Computer vision** for facial analysis and personal color detection\n**Multimodal AI** for health-related diagnostics and smart applications\n**Reinforcement learning** in mental wellness support systems\n**Real-time health tracking** using AI-generated feedback loops\n\nI focus on developing AI that is not only technically strong but also practical and respectful to real human lives.",
      followUps: ['What are my current projects?', 'Tell me about my goals', 'Ask about my thesis'],
    },
    {
      id: 'background',
      topic: 'background',
      keywords: ['background', 'cambodia', 'battambang', 'gks', 'scholarship', 'korea', 'province'],
      response:
        "I'm originally from Battambang province in Cambodia. I came to South Korea through the Global Korea Scholarship (GKS) program, which has given me the incredible opportunity to pursue my Master's degree at Inje University.\n\nThis scholarship has opened doors for me to study digital healthcare and AI applications in one of the world's leading technology hubs.",
      followUps: ['Ask about my life in Korea', 'Tell me about my goals', 'What do I enjoy doing?'],
    },
    {
      id: 'daily_routine',
      topic: 'routine',
      keywords: ['daily', 'routine', 'schedule', 'day', 'morning', 'evening', 'lifestyle'],
      response:
        "I maintain a structured yet flexible daily routine:\n\n**Morning:** Wake up around 6:30 AM, start with prayer and meditation, do bodyweight workouts, and review daily goals\n**Afternoon:** Attend classes, work on research and coding, take walks around campus\n**Evening:** Prepare dinner, study Korean, read, and edit videos for content creation\n**Before sleep:** Reflect on the day and pray\n\nI believe in balancing productivity, wellness, and spiritual growth.",
      followUps: ['Ask about my hobbies', 'Tell me about my goals', 'What languages do I speak?'],
    },
    {
      id: 'hobbies',
      topic: 'hobbies',
      keywords: ['hobbies', 'interests', 'fun', 'korean', 'cooking', 'drawing', 'video', 'youtube'],
      response:
        "Beyond academics, I enjoy:\n\n**Learning Korean** - Currently at TOPIK Level 3, aiming for Level 5\n**Exploring Korean cities** and culture during weekends\n**Cooking** easy but healthy meals, often inspired by Korean convenience foods\n**Digital drawing** as a relaxing offline activity\n**Video editing** for future content on YouTube\n\nI'm also planning to launch a YouTube channel documenting my life, studies, and tech projects in Korea.",
      followUps: ['Tell me about my goals', 'Ask about my Korean studies', 'What are my projects?'],
    },
    {
      id: 'goals',
      topic: 'goals',
      keywords: ['goals', 'future', 'plans', 'thesis', 'youtube', 'app', 'research paper'],
      response:
        "My goals span both personal and academic areas:\n\n**Short-term:**\nComplete my Master's thesis on AI applications in digital anti-aging healthcare\nReach TOPIK Level 5 proficiency in Korean\nDevelop a mobile app supporting daily wellness and anti-aging habits\nLaunch a YouTube channel about student life in Korea\n\n**Long-term:**\nBecome a recognized researcher in digital health and smart aging systems\nBuild a platform integrating AI, behavioral science, and lifestyle data\nPromote ethical AI use in healthcare\nMentor others from Cambodia who want to study abroad",
      followUps: ['Ask about my research', 'Tell me about my app idea', "What's my philosophy?"],
    },
    {
      id: 'philosophy',
      topic: 'philosophy',
      keywords: ['philosophy', 'principle', 'ethics', 'values', 'purpose', 'life'],
      response:
        "If there's one principle that guides my life, it's this: to combine purpose, simplicity, and technology to improve how we live and age.\n\nI place strong emphasis on ethics, time management, and building meaningful systems. My goal is to develop AI that serves real human needs while respecting human dignity and promoting wellbeing.",
      followUps: ['Tell me about my research', 'Ask about my daily routine', 'What are my goals?'],
    },
    {
      id: 'contact',
      topic: 'contact',
      keywords: ['contact', 'reach', 'connect', 'email', 'social', 'collaboration'],
      response:
        "I'd love to connect with others interested in digital healthcare, AI research, or academic collaboration. I'm always open to discussing research opportunities, sharing experiences about studying in Korea, or connecting with fellow researchers in the field.\n\nFeel free to reach out if you're interested in my work or have questions about pursuing graduate studies in Korea!",
      followUps: ['Ask about my research', 'Tell me about my goals', 'What do I study?'],
    },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

  const generateFallbackResponse = (): string => {
    const fallbacks = [
      "That's an interesting question! I don't have specific info on that, but I'd love to tell you about my research, academic journey, or goals. What interests you most?",
      "Hmm, I'm not sure about that one! But I can share details about my studies at Inje University, research in digital healthcare, or life in Korea. What would you like to explore?",
      "I don't have that information handy, but I'm full of stories about my academic adventures, research projects, and cultural experiences! What aspect interests you?",
      "Great question, though I don't have those details! I can tell you about my AI research, Korean language learning, or future plans. What sounds interesting?",
    ];

    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const findBestMatch = (query: string): KnowledgeChunk | null => {
    const normalizedQuery = query.toLowerCase();
    let bestMatch: KnowledgeChunk | null = null;
    let highestScore = 0;

    for (const chunk of knowledgeBase) {
      let score = 0;

      for (const keyword of chunk.keywords) {
        if (normalizedQuery.includes(keyword.toLowerCase())) {
          score += keyword.length;
        }
      }

      if (normalizedQuery.includes(chunk.topic)) {
        score += 10;
      }

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

  // Get dynamic suggestions based on context
  const getDynamicSuggestions = (): string[] => {
    const lastTopic = context.lastTopic;
    const mentionedTopics = context.mentionedTopics;

    // Default suggestions for first interaction
    if (messages.length === 0) {
      return [
        'Tell me about your studies',
        "What's your research about?",
        'What are your goals?',
        'How can I connect with you?',
      ];
    }

    // Dynamic suggestions based on last topic
    switch (lastTopic) {
      case 'education':
        return [
          'What are your specializations?',
          'Tell me about your research',
          'Ask about my life in Korea',
          'What are your goals?',
        ];
      case 'research':
        return [
          'What are my current projects?',
          'Tell me about my goals',
          'Ask about my daily routine',
          'How can I connect with you?',
        ];
      case 'background':
        return [
          'What do I enjoy doing?',
          'Tell me about my goals',
          'Ask about my studies',
          "What's your daily routine?",
        ];
      case 'daily_routine':
        return [
          'Ask about my hobbies',
          'What languages do I speak?',
          'Tell me about my research',
          'What are your goals?',
        ];
      case 'hobbies':
        return [
          'Ask about my Korean studies',
          'What are my projects?',
          'Tell me about my goals',
          "What's your research?",
        ];
      case 'goals':
        return [
          'Ask about my research',
          'Tell me about my app idea',
          "What's my philosophy?",
          'How can I connect with you?',
        ];
      case 'philosophy':
        return [
          'Tell me about my research',
          'Ask about my daily routine',
          'What are your goals?',
          'What do you study?',
        ];
      case 'contact':
        return [
          'Ask about my research',
          'Tell me about my goals',
          'What do I study?',
          'What are your hobbies?',
        ];
      default:
        // General suggestions when we don't have specific context
        const notMentioned = ['education', 'research', 'goals', 'hobbies', 'philosophy'].filter(
          (topic) => !mentionedTopics.includes(topic),
        );

        if (notMentioned.includes('education'))
          return [
            'Tell me about your studies',
            "What's your background?",
            'Ask about my research',
            'What are your goals?',
          ];
        if (notMentioned.includes('research'))
          return [
            "What's your research about?",
            'Tell me about your goals',
            'Ask about my hobbies',
            'How can I connect?',
          ];
        if (notMentioned.includes('goals'))
          return [
            'What are your goals?',
            'Tell me about my philosophy',
            'Ask about my projects',
            'What do you enjoy?',
          ];
        if (notMentioned.includes('hobbies'))
          return [
            'What do you enjoy doing?',
            'Ask about my Korean studies',
            'Tell me about research',
            "What's your routine?",
          ];

        return [
          'Tell me more about yourself',
          "What's your background?",
          'What are your interests?',
          'How can I connect with you?',
        ];
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    // Expand interface after first message
    if (messages.length === 0) {
      setTimeout(() => setIsExpanded(true), 100);
    }

    setIsTyping(true);

    // Simulate thinking time
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));

    const match = findBestMatch(input);
    let botResponse: string;
    let followUps: string[] = [];

    if (match) {
      botResponse = match.response;
      followUps = match.followUps || [];

      setContext((prev) => ({
        lastTopic: match.topic,
        mentionedTopics: [...prev.mentionedTopics, match.topic].slice(-5),
        userName: prev.userName,
      }));
    } else {
      botResponse = generateFallbackResponse();
    }

    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: botResponse,
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, botMessage]);
    setIsTyping(false);

    // Add follow-up suggestions if available
    if (followUps.length > 0) {
      setTimeout(() => {
        const followUpMessage: Message = {
          id: (Date.now() + 2).toString(),
          content: `You might also want to ask:\n${followUps.map((f) => `• ${f}`).join('\n')}`,
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, followUpMessage]);
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
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Expand interface after first message
    if (messages.length === 0) {
      setTimeout(() => setIsExpanded(true), 100);
    }

    setIsTyping(true);

    // Simulate thinking time
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));

    const match = findBestMatch(response);
    let botResponse: string;
    let followUps: string[] = [];

    if (match) {
      botResponse = match.response;
      followUps = match.followUps || [];

      setContext((prev) => ({
        lastTopic: match.topic,
        mentionedTopics: [...prev.mentionedTopics, match.topic].slice(-5),
        userName: prev.userName,
      }));
    } else {
      botResponse = generateFallbackResponse();
    }

    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: botResponse,
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, botMessage]);
    setIsTyping(false);

    // Add follow-up suggestions if available
    if (followUps.length > 0) {
      setTimeout(() => {
        const followUpMessage: Message = {
          id: (Date.now() + 2).toString(),
          content: `You might also want to ask:\n${followUps.map((f) => `• ${f}`).join('\n')}`,
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, followUpMessage]);
      }, 500);
    }
  };

  const MessageBubble = ({ message }: { message: Message }) => (
    <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4 animate-fadeIn`}>
      <div className={`flex items-start max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            message.sender === 'user'
              ? 'bg-gradient-to-br from-teal-500 to-cyan-500 text-white ml-3'
              : 'bg-slate-700 text-slate-200 mr-3'
          }`}
        >
          {message.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
        </div>
        <div>
          <div
            className={`px-4 py-3 rounded-2xl ${
              message.sender === 'user'
                ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-tr-md'
                : 'bg-slate-700 text-slate-100 rounded-tl-md'
            }`}
          >
            <pre className="text-sm md:text-base leading-relaxed font-sans whitespace-pre-wrap">{message.content}</pre>
          </div>
          <div className={`text-xs text-slate-400 mt-1 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
            {message.timestamp}
          </div>
        </div>
      </div>
    </div>
  );

  const LoadingIndicator = () => (
    <div className="flex justify-start mb-4">
      <div className="flex items-start">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 text-slate-200 mr-3 flex items-center justify-center">
          <Bot size={16} />
        </div>
        <div className="bg-slate-700 px-4 py-3 rounded-2xl rounded-tl-md">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 flex flex-col">
      {/* Header */}
      <div className="bg-slate-900/60 backdrop-blur-sm border-b border-slate-700 px-2 md:px-4 py-4 flex-shrink-0">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center mr-3">
            <Bot className="text-white" size={18} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-teal-300 via-cyan-200 to-indigo-300">Senghuy's AI Assistant</h1>
            <div className="mt-1">
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-800/80 border border-slate-700 text-slate-300">Portfolio Chat</span>
            </div>
            <p className="text-sm md:text-base text-slate-400">Digital Healthcare Researcher</p>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 min-h-0 flex flex-col relative overflow-hidden">
        {/* Messages Container */}
        <div
          className={`flex-1 min-h-0 transition-all duration-700 ease-in-out ${
            isExpanded ? 'px-2 sm:px-3 md:px-4 py-4' : 'flex items-center justify-center px-2 sm:px-3 md:px-4 py-6'
          }`}
        >
          <div
            className={`transition-all duration-700 ease-in-out ${
              isExpanded ? 'w-full h-full max-w-4xl mx-auto' : 'w-full max-w-2xl mx-auto'
            }`}
          >
            {/* Welcome Message - Only show when no messages */}
            {messages.length === 0 && (
              <div className="text-center mb-8 animate-fadeIn">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bot className="text-white" size={24} />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-100 mb-2">Welcome to Senghuy's Portfolio</h2>
                <p className="text-slate-300 mb-6">
                  Chat with my digital twin to learn about my research and academic journey!
                </p>
              </div>
            )}

            {/* Messages */}
            <div
              className={`${isExpanded ? 'h-full min-h-0 overflow-y-auto scroll-smooth overscroll-contain no-scrollbar' : ''} ${
                messages.length > 0 ? 'mb-4' : ''
              }`}
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              <div className="space-y-1">
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
                {isTyping && <LoadingIndicator />}
                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>
        </div>

        {/* Input Container */}
        <div
          className={`flex-shrink-0 transition-all duration-700 ease-in-out ${
            isExpanded ? 'px-2 sm:px-3 md:px-4 pt-0 pb-0' : 'px-2 sm:px-3 md:px-4 py-6 pb-0'
          }`}
        >
          <div
            className={`transition-all duration-700 ease-in-out ${
              isExpanded ? 'w-full max-w-4xl mx-auto' : 'max-w-2xl mx-auto'
            }`}
          >
            {/* Suggestions */}
            <div className="mb-4 transition-all flex-shrink-0">
              <div
                className={`w-full max-w-full min-h-[36px] overflow-x-auto no-scrollbar ${
                  messages.length === 0
                    ? 'flex flex-wrap justify-center gap-2'
                    : 'flex flex-nowrap items-center justify-start md:justify-center gap-2 pr-2'
                }`}
              >
                {getDynamicSuggestions().map((s, i) => (
                  <button
                    key={s}
                    onClick={() => handleQuickResponse(s)}
                    disabled={isTyping}
                    className={`${
                      messages.length === 0
                        ? 'px-4 py-2 text-sm md:text-base'
                        : 'px-2.5 py-1 text-xs md:text-sm'
                    } rounded-full whitespace-nowrap bg-slate-800/90 border border-slate-700 text-slate-100 hover:bg-slate-700/90 hover:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 animate-chipIn`}
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 rounded-2xl shadow-lg border border-slate-700 p-4">
              <div className="flex items-end space-x-3">
                <div className="flex-1">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about research, studies, or goals…"
                    className="w-full resize-none border-0 focus:outline-none text-slate-100 placeholder-slate-400 bg-transparent text-sm md:text-base overflow-y-auto no-scrollbar"
                    rows={1}
                    style={{ minHeight: '24px', maxHeight: '120px' }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                    }}
                  />
                </div>
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className={`p-3.5 rounded-xl transition-all duration-200 ${
                    input.trim() !== '' && !isTyping
                      ? 'bg-slate-500 text-white hover:bg-slate-400 focus:ring-2 focus:ring-slate-300/60 transform hover:scale-105 shadow-lg'
                      : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Static Notice */}
      <div className="text-center text-xs text-slate-500 py-2">
        Note: This is a static, rule-based demo. It is not yet connected to a live AI API.
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }

        @keyframes chipIn {
          from { opacity: 0; transform: translateY(4px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-chipIn { animation: chipIn .25s cubic-bezier(0.2, 0.8, 0.2, 1) both; }

        /* Hide scrollbars but keep scrollability */
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default PortfolioChatbot;
