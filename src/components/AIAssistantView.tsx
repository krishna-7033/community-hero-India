import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Trash2, HelpCircle, ArrowRight, MessageSquare, Plus, Check, Loader2, Bot, User } from "lucide-react";
import { ChatMessage } from "../types";

export default function AIAssistantView() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [recentQuestions, setRecentQuestions] = useState<string[]>([
    "How is severity determined?",
    "How do I report a pothole?",
    "Who receives my complaint?",
    "Can I track my report?"
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const suggestions = [
    { question: "How do I report a pothole?", label: "Report a pothole" },
    { question: "How is severity determined?", label: "Severity standards" },
    { question: "Who receives my complaint?", label: "Department routing" },
    { question: "Can I track my report?", label: "Tracking status" }
  ];

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const newUserMessage: ChatMessage = {
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setUserInput("");
    setIsTyping(true);

    // Save to recents if not already there
    if (!recentQuestions.includes(textToSend)) {
      setRecentQuestions((prev) => [textToSend, ...prev.slice(0, 5)]);
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: textToSend })
      });

      if (!res.ok) {
        throw new Error("Chat request failed.");
      }

      const data = await res.json();
      const botResponse: ChatMessage = {
        sender: "assistant",
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setMessages((prev) => [...prev, botResponse]);
    } catch (err) {
      console.error(err);
      const errorResponse: ChatMessage = {
        sender: "assistant",
        text: "I apologize, but I am having trouble connecting to my central systems right now. Please verify your connection or try again shortly.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setUserInput("");
    setIsTyping(false);
  };

  return (
    <div id="ai-assistant-view" className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      {/* Container holding Sidebar + Chat Window */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-160px)] min-h-[500px] bg-white border border-slate-100/80 rounded-[32px] overflow-hidden shadow-soft">
        
        {/* Sidebar Panel Left (3 columns on large screens) */}
        <div className="hidden lg:flex lg:col-span-3 bg-[#F8FAFC] border-r border-slate-100 p-5 flex-col justify-between overflow-hidden">
          <div className="space-y-6 flex-1 overflow-hidden flex flex-col">
            {/* New Chat Button */}
            <button
              id="btn-new-chat"
              onClick={startNewChat}
              className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs shadow-sm flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-blue-600" />
              <span>New Chat</span>
            </button>

            {/* Recent Questions section */}
            <div className="flex-1 overflow-y-auto space-y-3 flex flex-col">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Recent Questions
              </span>
              <div className="space-y-2 flex-1">
                {recentQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(q)}
                    className="w-full text-left p-2.5 rounded-xl bg-white/70 hover:bg-white border border-slate-100/80 hover:border-slate-200 text-slate-600 hover:text-slate-900 text-xs truncate transition-all flex items-center space-x-2 cursor-pointer"
                    title={q}
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{q}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Prompt Engine Indicator */}
          <div className="bg-blue-50/50 border border-blue-100/50 p-4 rounded-2xl space-y-1.5 mt-4">
            <span className="text-[10px] font-mono font-bold text-blue-600 uppercase tracking-widest block">AI ENGINE</span>
            <p className="text-[11px] text-slate-500 leading-relaxed">Powered by Gemini 3.5-flash with real-time municipal status tracking context.</p>
          </div>
        </div>

        {/* Main Chat Panel Right (9 columns) */}
        <div className="lg:col-span-9 flex flex-col justify-between h-full bg-white relative overflow-hidden">
          
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {messages.length === 0 ? (
              /* Welcome Page Splash */
              <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-8 py-8">
                <div className="space-y-3">
                  <div className="mx-auto bg-gradient-to-br from-blue-500 to-cyan-500 text-white p-4 rounded-3xl shadow-lg w-fit">
                    <Bot className="w-8 h-8" />
                  </div>
                  <h2 className="font-display font-black text-2xl text-slate-900 tracking-tight">
                    How can I assist you today?
                  </h2>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    I am the Community Hero AI Helper. Ask me anything about local civic services, pothole repairs, how the platform automatically routes your issues, or what determines incident severity levels.
                  </p>
                </div>

                {/* Suggestions Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                  {suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      id={`chat-suggestion-${idx}`}
                      onClick={() => handleSendMessage(s.question)}
                      className="bg-[#F8FAFC] hover:bg-blue-50/30 border border-slate-100 hover:border-blue-100 p-4 rounded-2xl text-left transition-all hover:scale-[1.01] flex items-center justify-between group cursor-pointer"
                    >
                      <div className="space-y-1">
                        <span className="block text-[9px] font-mono font-bold text-slate-400 uppercase group-hover:text-blue-500">Quick Query</span>
                        <span className="block text-xs font-bold text-slate-800">{s.label}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Message Thread */
              <div className="space-y-6">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start space-x-3 max-w-3xl ${
                      m.sender === "user" ? "ml-auto flex-row-reverse space-x-reverse" : ""
                    }`}
                  >
                    {/* Avatar */}
                    <div className={`p-2.5 rounded-xl text-white shadow-sm shrink-0 ${
                      m.sender === "user" ? "bg-slate-800" : "bg-blue-600"
                    }`}>
                      {m.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    {/* Chat Bubble Card */}
                    <div className={`p-4 rounded-2xl text-sm ${
                      m.sender === "user"
                        ? "bg-slate-900 text-white rounded-tr-none shadow-md shadow-slate-950/5"
                        : "bg-slate-100/80 text-slate-800 rounded-tl-none border border-slate-100"
                    }`}>
                      <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                      <span className={`block text-[9px] font-mono mt-2 text-right ${
                        m.sender === "user" ? "text-slate-400" : "text-slate-400"
                      }`}>
                        {m.timestamp}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex items-start space-x-3 max-w-3xl">
                    <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-sm shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-slate-100/80 border border-slate-100 p-4 rounded-2xl rounded-tl-none flex items-center space-x-1.5 py-5 px-6">
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Form Input Area bottom */}
          <div className="p-4 sm:p-5 border-t border-slate-100 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(userInput);
              }}
              className="flex items-center space-x-3"
            >
              <input
                type="text"
                id="chat-input"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Ask your community helper anything..."
                className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all bg-slate-50/50"
              />
              <button
                type="submit"
                id="btn-send-message"
                disabled={!userInput.trim() || isTyping}
                className={`p-3 rounded-2xl text-white shadow-md transition-all flex items-center justify-center ${
                  !userInput.trim() || isTyping
                    ? "bg-slate-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/10 cursor-pointer"
                }`}
              >
                {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
