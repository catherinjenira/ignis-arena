import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Bot, User, Sparkles } from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "stadium";
  text: string;
  timestamp: string;
}

interface StadiumBrainChatProps {
  onSendMessage: (message: string) => Promise<string>;
  stadiumState: any;
}

export default function StadiumBrainChat({ onSendMessage, stadiumState }: StadiumBrainChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      sender: "stadium",
      text: "System initialized. I am Ignis Arena - your Autonomous Stadium Central Intelligence. You can speak to me naturally about parking, security perimeters, grid energy, or stadium emotional weather. How may I orchestrate your tournament today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestionChips = [
    "How are you doing today?",
    "Give me an energy grid status report.",
    "Is there any security risk at the gates?",
    "Show me the stadium green score."
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isTyping) return;

    const userText = inputText;
    setInputText("");

    // Add user message
    const userMsg: Message = {
      id: Math.random().toString(),
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const reply = await onSendMessage(userText);
      const stadiumMsg: Message = {
        id: Math.random().toString(),
        sender: "stadium",
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, stadiumMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleChipClick = (chip: string) => {
    setInputText(chip);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col h-full justify-between shadow-lg relative overflow-hidden">
      
      {/* Absolute top line decoration */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />

      {/* Header */}
      <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
        <Bot size={18} className="text-cyan-600 animate-pulse" />
        <div>
          <h3 className="text-xs font-mono font-bold tracking-widest text-slate-700">
            STADIUM CORE TRANSCRIPT
          </h3>
          <p className="text-[9px] font-mono text-cyan-600 uppercase tracking-widest font-semibold">
            DIRECT INTERACTION LAYER ACTIVE
          </p>
        </div>
      </div>

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto my-4 space-y-4 pr-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent min-h-[220px]">
        {messages.map((m) => {
          const isUser = m.sender === "user";
          return (
            <div
              key={m.id}
              className={`flex gap-3 max-w-[85%] ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
            >
              {/* Avatar */}
              <div
                className={`h-8 w-8 rounded-lg border flex items-center justify-center shrink-0 shadow-sm ${
                  isUser
                    ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                    : "bg-cyan-50 border-cyan-200 text-cyan-600"
                }`}
              >
                {isUser ? <User size={14} /> : <Bot size={14} />}
              </div>

              {/* Balloon */}
              <div
                className={`rounded-xl p-3 border text-xs leading-relaxed ${
                  isUser
                    ? "bg-indigo-50/80 border-indigo-100 text-indigo-900"
                    : "bg-slate-50 border-slate-200/85 text-slate-700"
                }`}
              >
                <p>{m.text}</p>
                <span className="text-[8px] font-mono text-slate-400 block text-right mt-1.5 uppercase">
                  {m.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex gap-3 max-w-[85%] mr-auto">
            <div className="h-8 w-8 rounded-lg bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600 shrink-0">
              <Bot size={14} className="animate-spin" />
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-500 flex items-center gap-1">
              <span className="animate-pulse">Synthesizing Stadium Voice...</span>
              <span className="h-1.5 w-1.5 bg-cyan-500 rounded-full animate-bounce delay-100" />
              <span className="h-1.5 w-1.5 bg-cyan-500 rounded-full animate-bounce delay-200" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested chips and input */}
      <div>
        {/* Suggestion Chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-3 scrollbar-none">
          {suggestionChips.map((chip) => (
            <button
              key={chip}
              onClick={() => handleChipClick(chip)}
              className="px-2.5 py-1 text-[10px] font-mono border border-slate-200 bg-slate-50 text-slate-600 rounded-lg hover:border-cyan-400 hover:text-cyan-700 transition-colors whitespace-nowrap cursor-pointer"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input box */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask Stadium Core..."
            aria-label="Ask Stadium Core"
            className="flex-1 bg-white border border-slate-200 focus:border-cyan-500 focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            aria-label="Send message"
            className="p-3 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 text-cyan-700 disabled:opacity-40 rounded-xl transition-colors cursor-pointer"
          >
            <Send size={12} />
          </button>
        </form>
      </div>

    </div>
  );
}
