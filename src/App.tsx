import { useState, useRef, useEffect } from "react";
import { 
  Send, Bot, User, Loader2, FileText, 
  Database, Zap, ShieldCheck, Activity, 
  ChevronRight, Sparkles, AlertCircle, Terminal
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: string[];
  steps?: string[];
}

interface SystemStatus {
  status: "idle" | "loading" | "ready" | "error";
  error: string | null;
  chunks: number;
  files: number;
  llmReady: boolean;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Polling status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/status");
        const data = await res.json();
        setStatus(data);
      } catch (e) {
        console.error("Status check failed", e);
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    const runSteps = async () => {
      setActiveStep(0); // Vector Search
      await new Promise(r => setTimeout(r, 600));
      setActiveStep(1); // Context Processing
      await new Promise(r => setTimeout(r, 600));
      setActiveStep(2); // LLM Generation
    };

    runSteps();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input }),
      });

      const data = await response.json();

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.answer || "I don't have that information in the company documents.",
        sources: data.sources || [],
        steps: [
          "Retrieved top-5 relevant document chunks",
          "Calculated semantic similarity with Gemini Embedding-001",
          "Synthesized answer using Gemini 1.5 Flash"
        ]
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "System Fault: Failed to establish RAG connection. Please check backend logs.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      setActiveStep(null);
    }
  };

  const getLedClass = (type: "ingestion" | "llm") => {
    if (!status) return "bg-gray-700";
    if (type === "ingestion") {
      if (status.status === "loading") return "status-led-loading";
      if (status.status === "ready") return "status-led-ready";
      if (status.status === "error") return "status-led-error";
    }
    if (type === "llm") {
      return status.llmReady ? "status-led-ready" : "status-led-error";
    }
    return "bg-gray-700";
  };

  return (
    <div className="flex h-screen bg-brand-bg text-brand-text overflow-hidden">
      {/* Sidebar - Control/Stats */}
      <aside className="w-72 hidden lg:flex flex-col border-r border-brand-border bg-brand-surface/30 px-6 py-8">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-brand-accent rounded-xl flex items-center justify-center shadow-neon">
            <Zap className="text-white w-6 h-6 fill-current" />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight text-white leading-none">RAG.OS</h1>
            <span className="text-[10px] text-brand-muted font-bold tracking-[0.2em] uppercase">SWS AI v1.0</span>
          </div>
        </div>

        <nav className="flex-1 space-y-8">
          <section>
            <h3 className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-4 flex items-center gap-2">
              <Activity className="w-3 h-3" /> Core Infrastructure
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between group cursor-help">
                <span className="text-sm font-medium text-brand-muted group-hover:text-brand-text transition-colors">PDF Ingestion</span>
                <div className={`status-led ${getLedClass("ingestion")}`} />
              </div>
              <div className="flex items-center justify-between group cursor-help">
                <span className="text-sm font-medium text-brand-muted group-hover:text-brand-text transition-colors">Gemini LLM</span>
                <div className={`status-led ${getLedClass("llm")}`} />
              </div>
              <div className="flex items-center justify-between group cursor-help">
                <span className="text-sm font-medium text-brand-muted group-hover:text-brand-text transition-colors">Vector Store</span>
                <div className={`status-led ${status?.status === "ready" ? "status-led-ready" : "status-led-loading"}`} />
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-4 flex items-center gap-2">
              <Database className="w-3 h-3" /> System Stats
            </h3>
            <div className="bg-brand-surface rounded-xl p-4 border border-brand-border space-y-3 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-brand-muted">Chunks:</span>
                <span className="text-brand-cyan">{status?.chunks || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-muted">Sources:</span>
                <span className="text-brand-cyan">{status?.files || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-muted">Model:</span>
                <span className="text-brand-cyan">Gemini-1.5</span>
              </div>
            </div>
          </section>
        </nav>

        <div className="mt-auto pt-6 border-t border-brand-border">
          <div className="flex items-center gap-3 text-brand-muted hover:text-white transition-colors cursor-pointer group">
            <ShieldCheck className="w-4 h-4 group-hover:text-brand-cyan" />
            <span className="text-xs font-semibold">Security Level: Enterprise</span>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col relative">
        {/* Mobile Header */}
        <header className="lg:hidden glass px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <Zap className="text-brand-accent w-5 h-5 fill-current" />
             <h1 className="font-bold text-lg">RAG.OS</h1>
          </div>
          <div className="flex gap-2">
            <div className={`status-led ${getLedClass("ingestion")}`} />
            <div className={`status-led ${getLedClass("llm")}`} />
          </div>
        </header>

        {/* Chat Stream */}
        <main className="flex-1 overflow-y-auto px-4 md:px-12 py-8 space-y-8 scrollbar-hide">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-2xl mx-auto space-y-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-20 h-20 bg-brand-accent/10 rounded-3xl flex items-center justify-center border border-brand-accent/20"
              >
                <Sparkles className="w-10 h-10 text-brand-accent" />
              </motion.div>
              <div className="space-y-3">
                <h2 className="text-3xl font-bold text-white leading-tight">Neural Policy Engine</h2>
                <p className="text-brand-muted max-w-md mx-auto leading-relaxed">
                  Enterprise-grade RAG system for SWS AI internal documents. 
                  Get grounded answers sourced from secure policies.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                {[
                  "What is the annual leave policy?", 
                  "What are the WFH guidelines?",
                  "Describe IT Security policy",
                  "Performance review timeline"
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => setInput(q)}
                    className="text-left py-3 px-5 text-sm rounded-xl bg-brand-surface border border-brand-border hover:border-brand-accent hover:bg-brand-accent/5 transition-all text-brand-text group flex items-center justify-between"
                  >
                    {q}
                    <ChevronRight className="w-4 h-4 text-brand-muted group-hover:text-brand-accent transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: msg.role === "user" ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] md:max-w-[80%] rounded-2xl p-6 relative overflow-hidden ${
                    msg.role === "user"
                      ? "bg-brand-accent shadow-neon text-white"
                      : "bg-brand-surface border border-brand-border"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-1.5 rounded-lg ${msg.role === "user" ? "bg-white/20" : "bg-brand-accent/20"}`}>
                      {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-brand-accent" />}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                      {msg.role === "user" ? "Human" : "Neural Assistant"}
                    </span>
                  </div>

                  <p className={`text-sm md:text-base leading-relaxed ${msg.role === "user" ? "text-white" : "text-brand-text"}`}>
                    {msg.content}
                  </p>
                  
                  {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-6 pt-6 border-t border-brand-border/50"
                    >
                      <div className="flex items-center gap-2 text-[10px] font-bold text-brand-cyan mb-3 uppercase tracking-widest">
                        <Terminal className="w-3 h-3" /> Grounding Evidence
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {msg.sources.map((source, i) => (
                          <div
                            key={i}
                            className="bg-brand-bg px-3 py-1.5 rounded-lg border border-brand-border flex items-center gap-2"
                          >
                            <FileText className="w-3 h-3 text-brand-muted" />
                            <span className="text-[11px] font-mono whitespace-nowrap">{source}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </main>

        {/* Dynamic Tool Visualizer */}
        <div className="px-8 pb-4">
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="w-full max-w-4xl mx-auto glass rounded-2xl p-6 mb-4 flex flex-col md:flex-row gap-6 relative"
              >
                <div className="flex-1 space-y-4">
                   <div className="flex items-center gap-3">
                      <Loader2 className="w-5 h-5 text-brand-accent animate-spin" />
                      <h4 className="text-sm font-bold uppercase tracking-widest text-brand-cyan">Processing RAG Pipeline</h4>
                   </div>
                   <div className="grid grid-cols-3 gap-4">
                      {[
                        { icon: Database, label: "Vector Search" },
                        { icon: Activity, label: "Context Pack" },
                        { icon: Zap, label: "Gemini Sync" }
                      ].map((step, i) => (
                        <div key={i} className="relative">
                          <div className={`h-1 rounded-full w-full mb-3 overflow-hidden bg-brand-border`}>
                            <motion.div 
                              initial={{ x: "-100%" }}
                              animate={{ 
                                x: activeStep != null && i <= activeStep ? "0%" : "-100%"
                              }}
                              className={`h-full bg-brand-accent transition-all duration-700`}
                            />
                          </div>
                          <div className={`flex items-center gap-2 ${activeStep != null && i <= activeStep ? "text-white" : "text-brand-muted"}`}>
                            <step.icon className="w-3 h-3" />
                            <span className="text-[10px] font-bold uppercase whitespace-nowrap">{step.label}</span>
                          </div>
                        </div>
                      ))}
                   </div>
                </div>
                {status?.status === "error" && (
                   <div className="flex-shrink-0 flex items-center gap-3 text-red-400 bg-red-400/10 px-4 py-2 rounded-xl border border-red-500/20">
                     <AlertCircle className="w-5 h-5" />
                     <div className="text-[10px] font-bold">FAULT DETECTED IN INGESTION</div>
                   </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Control Input */}
        <footer className="p-8 pt-0 relative z-20">
          <div className="max-w-4xl mx-auto relative group">
            <div className="absolute inset-0 bg-brand-accent/20 blur-2xl rounded-full opacity-0 group-focus-within:opacity-100 transition-all duration-500" />
            <div className="relative glass rounded-2xl flex items-center p-2 group-focus-within:border-brand-accent/50 transition-all duration-300">
               <div className="pl-4 pr-2 text-brand-muted">
                 <Terminal className="w-5 h-5" />
               </div>
               <input
                 type="text"
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 onKeyDown={(e) => e.key === "Enter" && handleSend()}
                 placeholder="Input query for policy database..."
                 className="flex-1 bg-transparent py-4 px-2 outline-none text-brand-text placeholder:text-brand-muted font-medium text-sm md:text-base"
               />
               <button
                 onClick={handleSend}
                 disabled={isLoading || !input.trim() || status?.status === "loading"}
                 className="bg-brand-accent hover:bg-brand-accent/80 text-white w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-30 shadow-neon"
               >
                 <Send className="w-5 h-5" />
               </button>
            </div>
          </div>
          <div className="flex justify-center gap-6 mt-4 text-[9px] font-bold text-brand-muted uppercase tracking-[0.3em] opacity-40">
            <span>Neural RAG Network</span>
            <span>•</span>
            <span>256-Bit Embedding</span>
            <span>•</span>
            <span>Zero Hallucination Mode</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
