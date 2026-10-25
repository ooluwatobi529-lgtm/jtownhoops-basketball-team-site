
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bot,
  Send,
  User,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  LockKeyhole,
  LogIn,
  UserPlus,
  Wifi,
  WifiOff,
  Database,
  AlertCircle,
  Trophy,
  Flame,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

import aiBackground from "../images/mybackground4.jpg";
import aiPart from "../images/aipart.jpg";
import bigFemo from "../images/bigfemo.jpg";
import aiPart2 from "../images/aipart2.jpg";
import aiPart3 from "../images/aipart3.jpg";

// ============================================================
// J-TOWN HOOPS AI — REGISTERED MEMBERS ONLY
// ============================================================

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://jtownhoops-backend-1.onrender.com"
)
  .replace(/\/+$/, "")
  .replace(/\/api\/v1$/, "");

const CHAT_URL = `${API_URL}/api/v1/ai/chat`;
const STATUS_URL = `${API_URL}/api/v1/ai/status`;

const TOKEN_KEY = "jtown-hoops-token";
const CHAT_PREFIX = "jtown-ai-member-chat-v1";

const carouselImages = [
  aiPart,
  bigFemo,
  aiPart2,
  aiPart3,
];

const getTime = () =>
  new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

const makeId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const welcomeMessage = () => ({
  id: makeId(),
  sender: "ai",
  text:
    "🏀 Welcome to J-Town Hoops AI! I'm your basketball assistant. Ask me about basketball, training, teams, players, schedules, registration, or J-Town Hoops. Let's talk basketball!",
  time: getTime(),
  source: "J-Town AI",
});

const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

const getChatKey = (user) => {
  const id = user?.id || user?._id;

  return id
    ? `${CHAT_PREFIX}:${id}`
    : null;
};

const loadMessages = (key) => {
  if (!key) return [welcomeMessage()];

  try {
    const saved = JSON.parse(
      localStorage.getItem(key) || "null"
    );

    if (Array.isArray(saved) && saved.length) {
      const valid = saved.filter(
        (item) =>
          item &&
          ["user", "ai"].includes(item.sender) &&
          typeof item.text === "string"
      );

      if (valid.length) return valid.slice(-30);
    }
  } catch {
    // Continue without stored conversation.
  }

  return [welcomeMessage()];
};

// ============================================================
// DISPLAY BASIC MARKDOWN
// ============================================================

function MessageContent({ text }) {
  return (
    <div className="whitespace-pre-wrap break-words leading-relaxed">
      {String(text)
        .split(/(\*\*[^*]+\*\*)/g)
        .map((part, index) =>
          part.startsWith("**") &&
          part.endsWith("**") ? (
            <strong key={index}>
              {part.slice(2, -2)}
            </strong>
          ) : (
            <span key={index}>{part}</span>
          )
        )}
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function AiAssistant() {
  const { user, isSignedIn } = useAuth();
  const { theme } = useTheme();

  const chatKey = getChatKey(user);
  const token = getToken();

  const canChat = Boolean(
    isSignedIn &&
    user &&
    token
  );

  const [messages, setMessages] = useState([
    welcomeMessage(),
  ]);

  const [loadedChatKey, setLoadedChatKey] =
    useState(null);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const [connectionStatus, setConnectionStatus] =
    useState("checking");

  const [errorMessage, setErrorMessage] = useState("");
  const [sessionExpired, setSessionExpired] =
    useState(false);

  const chatEndRef = useRef(null);
  const requestRef = useRef(null);
  const busyRef = useRef(false);

  // ==========================================================
  // IMAGE CAROUSEL
  // ==========================================================

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(
        (previous) =>
          (previous + 1) % carouselImages.length
      );
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  // ==========================================================
  // RESTORE CHAT FOR CURRENT MEMBER
  // ==========================================================

  useEffect(() => {
    requestRef.current?.abort();
    requestRef.current = null;
    busyRef.current = false;

    setIsTyping(false);
    setErrorMessage("");
    setSessionExpired(false);

    setMessages(loadMessages(chatKey));
    setLoadedChatKey(chatKey);
  }, [chatKey]);

  // ==========================================================
  // CHECK BACKEND CONNECTION
  // ==========================================================

  useEffect(() => {
    if (!canChat) {
      setConnectionStatus("offline");
      return;
    }

    const controller = new AbortController();

    const checkConnection = async () => {
      try {
        const response = await fetch(STATUS_URL, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Connection unavailable");
        }

        const data = await response.json();

        if (!controller.signal.aborted) {
          setConnectionStatus(
            data.configured ? "online" : "offline"
          );
        }
      } catch {
        if (!controller.signal.aborted) {
          setConnectionStatus("offline");
        }
      }
    };

    setConnectionStatus("checking");
    checkConnection();

    return () => controller.abort();
  }, [canChat]);

  // ==========================================================
  // SAVE MEMBER CONVERSATION
  // ==========================================================

  useEffect(() => {
    if (
      !chatKey ||
      loadedChatKey !== chatKey
    ) {
      return;
    }

    try {
      localStorage.setItem(
        chatKey,
        JSON.stringify(messages.slice(-30))
      );
    } catch {
      // Browser storage is optional.
    }
  }, [messages, chatKey, loadedChatKey]);

  // ==========================================================
  // AUTO SCROLL
  // ==========================================================

  useEffect(() => {
    if (canChat) {
      chatEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [messages, isTyping, canChat]);

  // ==========================================================
  // CANCEL REQUESTS ON UNMOUNT
  // ==========================================================

  useEffect(() => {
    return () => {
      requestRef.current?.abort();
    };
  }, []);

  // ==========================================================
  // SEND AUTHENTICATED AI MESSAGE
  // ==========================================================

  const handleSendMessage = async (textToSend) => {
    const cleanText = String(textToSend || "").trim();

    if (
      !cleanText ||
      busyRef.current ||
      !canChat ||
      sessionExpired ||
      loadedChatKey !== chatKey
    ) {
      return;
    }

    if (cleanText.length > 2000) {
      setErrorMessage(
        "Your message must be 2000 characters or fewer."
      );
      return;
    }

    const currentToken = getToken();

    if (!currentToken) {
      setSessionExpired(true);
      setErrorMessage(
        "Please sign in again to continue."
      );
      return;
    }

    busyRef.current = true;
    setIsTyping(true);
    setErrorMessage("");
    setInput("");

    const history = messages
      .filter(
        (msg) =>
          ["user", "ai"].includes(msg.sender) &&
          !String(msg.id).startsWith("welcome")
      )
      .slice(-12)
      .map((msg) => ({
        sender: msg.sender,
        text: msg.text.slice(0, 2000),
      }));

    const userMessage = {
      id: makeId(),
      sender: "user",
      text: cleanText,
      time: getTime(),
    };

    setMessages((previous) => [
      ...previous,
      userMessage,
    ]);

    const controller = new AbortController();
    requestRef.current = controller;

    const timeout = setTimeout(() => {
      controller.abort();
    }, 45000);

    try {
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`,
        },
        body: JSON.stringify({
          message: cleanText,
          history,
        }),
        signal: controller.signal,
      });

      if (response.status === 401) {
        setSessionExpired(true);
        throw new Error(
          "Your login session has expired. Please sign in again."
        );
      }

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "The server returned an invalid response."
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "AI request failed."
        );
      }

      if (typeof data.reply !== "string") {
        throw new Error(
          "The AI returned an invalid reply."
        );
      }

      if (controller.signal.aborted) return;

      setMessages((previous) => [
        ...previous,
        {
          id: makeId(),
          sender: "ai",
          text: data.reply,
          source: "J-Town AI",
          time: getTime(),
        },
      ]);

      setConnectionStatus("online");
    } catch (error) {
      if (controller.signal.aborted) {
        setErrorMessage(
          "The AI request was cancelled or timed out."
        );
      } else {
        setErrorMessage(
          error.message === "Failed to fetch"
            ? "Unable to reach the J-Town AI backend. Check your connection."
            : error.message
        );
      }
    } finally {
      clearTimeout(timeout);

      if (requestRef.current === controller) {
        requestRef.current = null;
        busyRef.current = false;
        setIsTyping(false);
      }
    }
  };

  // ==========================================================
  // RESET CONVERSATION
  // ==========================================================

  const resetConversation = () => {
    requestRef.current?.abort();
    requestRef.current = null;
    busyRef.current = false;

    setMessages([welcomeMessage()]);
    setInput("");
    setIsTyping(false);
    setErrorMessage("");

    if (chatKey) {
      try {
        localStorage.removeItem(chatKey);
      } catch {
        // Ignore storage errors.
      }
    }
  };

  // ==========================================================
  // QUICK BASKETBALL QUESTIONS
  // ==========================================================

  const suggestions = [
    {
      text: "How can I improve my shooting?",
      icon: <Flame className="h-4 w-4" />,
    },
    {
      text: "Tell me about J-Town Hoops teams",
      icon: <Trophy className="h-4 w-4" />,
    },
    {
      text: "What games are scheduled?",
      icon: <Sparkles className="h-4 w-4" />,
    },
    {
      text: "Explain basketball positions",
      icon: <Bot className="h-4 w-4" />,
    },
  ];

  // ==========================================================
  // MAIN PAGE
  // ==========================================================

  return (
    <div
      className="relative min-h-[calc(100vh-5rem)] bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: `url(${aiBackground})`,
      }}
    >
      <div className="absolute inset-0 bg-black/30" />

      <div className="relative z-10 flex min-h-[calc(100vh-5rem)] flex-col">

        {/* HEADER */}
        <div className="relative h-36 overflow-hidden border-b border-orange-500/30">

          {carouselImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
                index === currentSlide
                  ? "opacity-100"
                  : "opacity-0"
              }`}
              style={{
                backgroundImage: `url(${image})`,
              }}
            />
          ))}

          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/75 to-black/35" />

          <div className="relative z-10 flex h-full items-center justify-between gap-3 px-5 sm:px-8">

            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-orange-500 p-3 text-white shadow-lg shadow-orange-500/30">
                <Bot className="h-7 w-7" />
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white uppercase tracking-tight">
                  What's On Your Mind?
                </h1>

                <p className="text-xs text-neutral-300 mt-1">
                  J-Town Hoops AI Basketball Assistant
                </p>
              </div>
            </div>

            {canChat && (
              <button
                type="button"
                onClick={resetConversation}
                title="Clear conversation"
                className="cursor-pointer rounded-xl border border-white/20 bg-black/50 p-3 text-white hover:bg-orange-500 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* CONNECTION STATUS */}
        {canChat && (
          <div className="border-b border-white/10 bg-black/75 px-4 py-2">
            <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-2 text-xs text-neutral-300">

              <span className="flex items-center gap-2">
                {connectionStatus === "online" ? (
                  <Wifi className="h-4 w-4 text-green-400" />
                ) : (
                  <WifiOff className="h-4 w-4 text-amber-400" />
                )}

                {connectionStatus === "online"
                  ? "J-Town AI connected"
                  : connectionStatus === "checking"
                  ? "Checking AI connection..."
                  : "AI connection unavailable"}
              </span>

              <span className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-green-400" />
                Member: {user?.name || "J-Town Member"}
              </span>

              <span className="hidden sm:flex items-center gap-1">
                <Database className="h-3.5 w-3.5" />
                {theme?.name || "J-Town"} • GroqCloud
              </span>
            </div>
          </div>
        )}

        {/* =====================================================
            GUEST / SIGN-IN SCREEN
        ===================================================== */}

        {!canChat || sessionExpired ? (
          <div className="flex flex-1 items-center justify-center px-4 py-12">

            <div className="w-full max-w-lg rounded-3xl border border-orange-500/30 bg-neutral-950/95 p-7 sm:p-10 text-center text-white shadow-2xl backdrop-blur-xl">

              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-orange-500/40 bg-orange-500/10">
                <LockKeyhole className="h-10 w-10 text-orange-400" />
              </div>

              <h2 className="text-2xl font-extrabold">
                Members-Only AI Assistant
              </h2>

              <p className="mt-4 text-sm leading-7 text-neutral-300">
                J-Town Hoops AI is exclusively available
                to registered members who are signed in.
                Sign in to ask basketball questions,
                explore J-Town information and enjoy
                intelligent conversations.
              </p>

              {sessionExpired && (
                <div className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-200">
                  Your session has expired.
                  Please sign in again.
                </div>
              )}

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">

                <Link
                  to="/account"
                  className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-bold text-white hover:bg-orange-600 transition-colors"
                >
                  <LogIn className="h-5 w-5" />
                  Sign In
                </Link>

                <Link
                  to="/register"
                  className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-orange-500 px-5 py-3 font-bold text-orange-400 hover:bg-orange-500/10 transition-colors"
                >
                  <UserPlus className="h-5 w-5" />
                  Register
                </Link>
              </div>

              <div className="mt-7 flex items-center justify-center gap-2 text-xs text-neutral-400">
                <ShieldCheck className="h-4 w-4 text-green-400" />
                Protected by J-Town Hoops authentication
              </div>
            </div>
          </div>
        ) : (

          <>
            {/* =================================================
                AUTHENTICATED CHAT STREAM
            ================================================= */}

            <div className="mx-auto w-full max-w-4xl flex-1 space-y-4 p-4 sm:p-6">

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${
                    msg.sender === "user"
                      ? "flex-row-reverse"
                      : ""
                  }`}
                >
                  <div
                    className={`shrink-0 rounded-xl p-2 text-white ${
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

                  <div
                    className={`min-w-0 max-w-[85%] rounded-2xl border px-4 py-3 text-sm shadow-lg sm:max-w-[75%] ${
                      msg.sender === "user"
                        ? "border-neutral-600 bg-neutral-800 text-white"
                        : "border-orange-500/20 bg-neutral-950 text-neutral-100"
                    }`}
                  >
                    <MessageContent text={msg.text} />

                    {msg.source && (
                      <div className="mt-2 flex items-center gap-1 text-[10px] text-orange-400">
                        <Bot className="h-3 w-3" />
                        {msg.source}
                      </div>
                    )}

                    <p className="mt-2 text-right text-[10px] text-neutral-400">
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-orange-500 p-2 text-white">
                    <Bot className="h-4 w-4" />
                  </div>

                  <div className="flex gap-1 rounded-2xl bg-neutral-950 px-5 py-4">
                    {[0, 1, 2].map((index) => (
                      <span
                        key={index}
                        className="h-2 w-2 animate-bounce rounded-full bg-orange-500"
                        style={{
                          animationDelay: `${index * 0.2}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {errorMessage && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-950/90 p-3 text-sm text-red-100"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* =================================================
                CHAT CONTROLS
            ================================================= */}

            <div className="mt-auto border-t border-neutral-800 bg-neutral-950 p-4">
              <div className="mx-auto max-w-4xl space-y-3">

                <div className="flex gap-2 overflow-x-auto pb-2">
                  {suggestions.map((item) => (
                    <button
                      key={item.text}
                      type="button"
                      disabled={isTyping}
                      onClick={() =>
                        handleSendMessage(item.text)
                      }
                      className="flex shrink-0 cursor-pointer items-center gap-2 rounded-full border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs text-neutral-200 hover:border-orange-500 hover:text-orange-400 disabled:opacity-40 transition-colors"
                    >
                      {item.icon}
                      {item.text}
                    </button>
                  ))}
                </div>

                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    handleSendMessage(input);
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={input}
                    maxLength={2000}
                    onChange={(event) =>
                      setInput(event.target.value)
                    }
                    placeholder="Ask J-Town AI anything..."
                    className="min-w-0 flex-1 rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm text-white outline-none focus:border-orange-500"
                  />

                  <button
                    type="submit"
                    disabled={!input.trim() || isTyping}
                    className="cursor-pointer rounded-xl bg-orange-500 p-3 text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {isTyping ? (
                      <RefreshCw className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </button>
                </form>

                <p className="text-center text-[10px] text-neutral-500">
                  J-Town Hoops AI • Members Only •
                  Powered by GroqCloud •
                  AI responses may contain mistakes
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
