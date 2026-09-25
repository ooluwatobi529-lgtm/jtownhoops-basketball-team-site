import { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  User,
  Sparkles,
  Flame,
  Trophy,
  Calendar,
  RefreshCw,
  Users,
  Newspaper,
  Gamepad2,
  Database,
  Clock3,
  Trash2,
} from "lucide-react";

// ─── MAIN PAGE BACKGROUND IMAGE ───
import aiBackground from "../images/mybackground4.jpg";
import { useTheme } from "../context/ThemeContext";

export default function AiAssistant() {
  const { theme } = useTheme();

  const welcomeMessage = {
    id: 1,
    sender: "ai",
    text: "Hello! I am your J-Town Hoops AI Court Analyst. I can help with players, teams, schedules, games, news, standings and recent J-Town updates. My current answers use the frontend demo data until your backend is connected.",
    time: "Just now",
    source: "J-Town AI",
  };

  const [messages, setMessages] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("jtown_ai_chat") || "null");
      return Array.isArray(saved) && saved.length ? saved : [welcomeMessage];
    } catch {
      return [welcomeMessage];
    }
  });

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [lastIntent, setLastIntent] = useState(
    localStorage.getItem("jtown_ai_last_intent") || "general"
  );
  const chatEndRef = useRef(null);

  // ─── CAROUSEL IMAGE ENGINE STATE ───
  const [currentSlide, setCurrentSlide] = useState(0);

  const carouselImages = [
    "/src/images/aipart.jpg",
    "/src/images/bigfemo.jpg",
    "/src/images/aipart2.jpg",
    "/src/images/aipart3.jpg",
    "/src/images/aipart4.jpg",
  ];

  // ─── ROTATE HEADER CAROUSEL EVERY 4 SECONDS ───
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  // ─── AUTO SCROLL CHAT ───
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  // ─── SAVE CHAT / CONVERSATION MEMORY ───
  useEffect(() => {
    localStorage.setItem("jtown_ai_chat", JSON.stringify(messages.slice(-40)));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem("jtown_ai_last_intent", lastIntent);
  }, [lastIntent]);

  // ─── TEMPORARY FRONTEND KNOWLEDGE ───
  // When your backend is ready, replace this object with API data.
  const demoData = {
    standings:
      "🏆 Current demo standings:\n1. J-Town Hoops (14-2) — Streak: 5W\n2. Eastside Wolves (13-3) — Streak: 2W\n3. Metro Titans (10-6) — Streak: 1L",
    players:
      "🔥 Demo player leaders:\n• Marcus Vance — 28.4 PPG, 6.2 APG\n• Tobi Adebayo — 18.5 PPG, 8.9 APG, 2.1 SPG",
    schedule:
      "📅 Demo upcoming match:\n• Grand Championship Finals\n• J-Town Hoops vs Eastside Wolves\n• Saturday at 7:00 PM WAT\n• City Dome Arena",
    games:
      "🏀 Game Center is ready to connect to your Games and Schedule backend. Once connected, I can answer final scores, wins/losses and recent game questions from live J-Town data.",
    teams:
      "👥 Team Center is ready to connect to your Teams backend. I will be able to return rosters, team profiles, records and related schedules.",
    news:
      "📰 News Center is ready to connect to your News backend. I will be able to summarize the latest J-Town Hoops stories and updates.",
    updates:
      "🔔 J-Town Updates will eventually combine changes from Players, Teams, Schedule, Games, News and Notifications through your backend.",
  };

  const detectIntent = (query) => {
    const q = query.toLowerCase();

    if (/(standing|leader|rank|table)/.test(q)) return "standings";
    if (/(mvp|player|stat|scorer|assist)/.test(q)) return "players";
    if (/(schedule|next match|next game|upcoming|when.*play)/.test(q)) return "schedule";
    if (/(score|result|won|win|loss|lost|game)/.test(q)) return "games";
    if (/(team|roster|club)/.test(q)) return "teams";
    if (/(news|story|headline|article)/.test(q)) return "news";
    if (/(notification|update|changed|recent)/.test(q)) return "updates";

    // Follow-up questions such as "what about after that?"
    if (
      /(what about|after that|and then|more|another|next one|tell me more)/.test(q) &&
      lastIntent !== "general"
    ) {
      return lastIntent;
    }

    return "general";
  };

  const getAiResponse = (query) => {
    const intent = detectIntent(query);

    if (intent !== "general") {
      setLastIntent(intent);
      return {
        text: demoData[intent],
        source:
          intent === "players" ? "Players" :
          intent === "teams" ? "Teams" :
          intent === "schedule" ? "Schedule" :
          intent === "games" ? "Games" :
          intent === "news" ? "News" :
          intent === "updates" ? "Notifications" :
          "League Data",
      };
    }

    return {
      text:
        "🏀 I specialize in J-Town Hoops. Try asking about a player, team, upcoming match, game result, standings, news or recent update. As we connect your backend, these answers will come from your real J-Town database.",
      source: "J-Town AI",
    };
  };

  // ─── SEND MESSAGE ───
  const handleSendMessage = (textToSend) => {
    const cleanText = textToSend.trim();
    if (!cleanText || isTyping) return;

    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: cleanText,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = getAiResponse(cleanText);

      const aiMsg = {
        id: Date.now() + 1,
        sender: "ai",
        text: response.text,
        source: response.source,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 650);
  };

  const resetConversation = () => {
    setMessages([welcomeMessage]);
    setLastIntent("general");
    setInput("");
    setIsTyping(false);
    localStorage.removeItem("jtown_ai_chat");
    localStorage.removeItem("jtown_ai_last_intent");
  };

  // ─── DYNAMIC QUICK SUGGESTIONS ───
  const defaultSuggestions = [
    { text: "Who is leading the MVP race?", icon: <Flame className="h-3.5 w-3.5 jt-accent-text" /> },
    { text: "Show me the current standings", icon: <Trophy className="h-3.5 w-3.5 jt-accent-text" /> },
    { text: "When is the next match?", icon: <Calendar className="h-3.5 w-3.5 jt-accent-text" /> },
    { text: "Explore J-Town teams", icon: <Users className="h-3.5 w-3.5 jt-accent-text" /> },
    { text: "Show latest news", icon: <Newspaper className="h-3.5 w-3.5 jt-accent-text" /> },
    { text: "Recent game results", icon: <Gamepad2 className="h-3.5 w-3.5 jt-accent-text" /> },
  ];

  const contextualSuggestions = {
    players: [
      "Tell me more about the player leaders",
      "What team do they play for?",
      "Show the standings",
    ],
    teams: [
      "Show team rosters",
      "When is the next game?",
      "Show the standings",
    ],
    schedule: [
      "What about after that?",
      "Show recent game results",
      "Show team information",
    ],
    games: [
      "What about the next game?",
      "Show the standings",
      "Latest J-Town news",
    ],
    news: [
      "Show recent updates",
      "When is the next match?",
      "Show player leaders",
    ],
    updates: [
      "Show latest news",
      "Show recent game results",
      "When is the next match?",
    ],
  };

  const suggestionChips =
    lastIntent !== "general" && contextualSuggestions[lastIntent]
      ? contextualSuggestions[lastIntent].map((item) => ({
          text: item,
          icon: <Sparkles className="h-3.5 w-3.5 jt-accent-text" />,
        }))
      : defaultSuggestions;


  return (
    // ─── MAIN BACKGROUND IMAGE CONTAINER ───
    <div
      className="min-h-[calc(100vh-5rem)] relative bg-cover bg-center bg-no-repeat bg-fixed font-space"
      style={{
        backgroundImage: `url(${aiBackground})`,
      }}
    >
      {/* ─── BACKGROUND OVERLAY ─── */}
      <div className="absolute inset-0 bg-black/30"></div>

      {/* ─── ORIGINAL PAGE CONTENT ─── */}
      <div className="relative z-10 min-h-[calc(100vh-5rem)] text-slate-900 dark:text-white transition-colors duration-300 flex flex-col">

        {/* ─── 1. HEADER BANNER WITH HERO BACKGROUND CAROUSEL ─── */}
        <div className="relative h-36 border-b border-neutral-200 dark:border-neutral-800 shadow-amber-500 overflow-hidden flex items-center justify-between px-6 z-10 font-extrabold">

          {/* Layer A: Image Carousel Slots */}
          {carouselImages.map((imgUrl, index) => (
            <div
              key={index}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out -z-20 ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
              style={{
                backgroundImage: `url('${imgUrl}')`,
              }}
            />
          ))}

          {/* Layer B: Overlay for Header Text */}
          <div className="absolute inset-0 bg-linear-to-r from-white/90 via-white/70 to-white/40 dark:from-neutral-950/95 dark:via-neutral-950/80 dark:to-neutral-900/40 -z-10" />

          {/* Header Text */}
          <div className="flex items-center gap-4">
            <div className="bg-linear-to-br from-orange-500 to-amber-600 p-3 rounded-2xl shadow-xl shadow-orange-500/20 text-white transform hover:scale-105 transition-transform">
              <Bot className="h-7 w-7" />
            </div>

            <div>
              <h1 className="font-syne font-serif font-bold text-2xl tracking-tight text-slate-950 dark:text-white flex items-center gap-2 uppercase">
                WHAT'S ON YOUR MIND

                <Sparkles className="h-5 w-5 text-orange-500 fill-orange-500" />
              </h1>

              <p className="text-xs text-slate-600 dark:text-neutral-400 font-medium tracking-wide mt-0.5">
                J-Town Hoops updates / Automated Season Tracker v4.0
              </p>
            </div>
          </div>

          {/* Reset Button */}
          <button
            onClick={resetConversation}
            className="p-2 text-slate-500 dark:text-neutral-400 bg-white/60 dark:bg-neutral-900/60 hover:text-orange-500 hover:bg-white dark:hover:bg-neutral-800 rounded-xl transition-all border border-neutral-200/50 dark:border-neutral-800 shadow-sm"
            title="Clear conversation"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {/* ─── AI STATUS STRIP ─── */}
        <div className="border-b border-neutral-800/70 bg-black/55 backdrop-blur-md">
          <div className="max-w-4xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-[10px]">
            <div className="flex items-center gap-2 text-neutral-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-50 jt-accent-bg"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full jt-accent-bg"></span>
              </span>
              J-Town AI ready
            </div>
            <div className="flex items-center gap-3 text-neutral-400">
              <span className="flex items-center gap-1"><Clock3 className="h-3 w-3" /> Conversation memory</span>
              <span className="flex items-center gap-1"><Database className="h-3 w-3" /> Frontend demo data</span>
              <span className="jt-accent-text font-bold">{theme.name}</span>
            </div>
          </div>
        </div>

        {/* ─── 2. CHAT STREAM CANVAS ─── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-w-4xl w-full mx-auto">

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 items-start ${
                msg.sender === "user" ? "flex-row-reverse" : ""
              }`}
            >
              {/* Avatar */}
              <div
                className={`p-2 rounded-xl flex-shrink-0 text-white ${
                  msg.sender === "user"
                    ? "bg-neutral-800"
                    : "bg-orange-500"
                }`}
              >
                {msg.sender === "user" ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm border whitespace-pre-line ${
                  msg.sender === "user"
                    ? "bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
                    : "bg-slate-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800"
                }`}
              >
                {msg.text}

                {msg.sender === "ai" && msg.source && (
                  <div className="mt-2 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider jt-accent-text">
                    <Database className="h-3 w-3" />
                    Source: {msg.source}
                  </div>
                )}

                <span className="block text-[10px] text-slate-400 mt-1.5 text-right font-light">
                  {msg.time}
                </span>
              </div>
            </div>
          ))}

          {/* AI Typing Animation */}
          {isTyping && (
            <div className="flex gap-3 items-start">

              <div className="p-2 rounded-xl bg-orange-500 text-white">
                <Bot className="h-4 w-4" />
              </div>

              <div className="bg-slate-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl px-4 py-3 flex space-x-1">

                <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce delay-75"></div>

                <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>

                <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>

              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* ─── 3. BOTTOM CONTROL BOARD INPUT ─── */}
        <div className="bg-slate-50 dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800 p-4 mt-auto">

          <div className="max-w-4xl mx-auto space-y-3">

            {/* Suggestion Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">

              {suggestionChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(chip.text)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-neutral-900 hover:bg-slate-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 text-xs font-semibold rounded-full text-slate-600 dark:text-neutral-400 whitespace-nowrap transition-all shadow-sm"
                >
                  {chip.icon}

                  <span>{chip.text}</span>
                </button>
              ))}

            </div>

            {/* Message Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(input);
              }}
              className="flex gap-2 items-center"
            >
              <input
                type="text"
                placeholder="Ask about players, teams, schedules, games, news or updates..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 focus:border-orange-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white"
              />

              <button
                type="submit"
                disabled={!input.trim()}
                className="jt-accent-bg disabled:opacity-40 text-white p-3 rounded-xl transition-all shadow-md flex items-center justify-center hover:brightness-110"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>

          </div>
        </div>

      </div>
    </div>
  );
}