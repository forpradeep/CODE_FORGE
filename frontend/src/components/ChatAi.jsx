import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import axiosClient from "../utils/axiosClient";
import { Send, Bot, User, Sparkles, AlertCircle } from 'lucide-react';

function ChatAi({ problem }) {
  const [messages, setMessages] = useState([
    { 
      role: 'model', 
      parts: [{ text: `Hello! I'm your AI coding assistant for **${problem?.title || 'this challenge'}**. Ask me for algorithmic hints, time complexity analysis, or debugging edge cases without spoiling the solution!` }] 
    }
  ]);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset } = useForm();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const onSubmit = async (data) => {
    if (!data.message?.trim()) return;

    const userText = data.message;
    const updatedMessages = [...messages, { role: 'user', parts: [{ text: userText }] }];
    setMessages(updatedMessages);
    reset();
    setLoading(true);

    try {
      const response = await axiosClient.post("/ai/chat", {
        messages: updatedMessages,
        title: problem?.title,
        description: problem?.description,
        testCases: problem?.visibleTestCases,
        startCode: problem?.startCode
      });

      setMessages(prev => [...prev, { 
        role: 'model', 
        parts: [{ text: response.data?.message || "Here is a hint to consider: think about the constraints and edge cases." }] 
      }]);
    } catch (error) {
      console.error("API Error:", error);
      setMessages(prev => [...prev, { 
        role: 'model', 
        parts: [{ text: "Sorry, I encountered an issue fetching AI assistance. Please try asking again." }] 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] select-text">
      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => {
          const isUser = msg.role === "user";
          return (
            <div key={index} className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs ${
                isUser ? 'bg-primary text-primary-content font-bold' : 'bg-secondary/20 text-secondary'
              }`}>
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                isUser 
                  ? 'bg-primary text-primary-content rounded-tr-none' 
                  : 'bg-base-200/80 text-base-content border border-base-content/10 rounded-tl-none font-sans'
              }`}>
                <div className="whitespace-pre-wrap">{msg.parts[0]?.text}</div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-lg bg-secondary/20 text-secondary flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-base-200/80 rounded-2xl rounded-tl-none px-4 py-3 border border-base-content/10 text-xs flex items-center gap-2">
              <span className="loading loading-dots loading-xs text-secondary"></span>
              <span className="text-base-content/60">Thinking of guidance...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form 
        onSubmit={handleSubmit(onSubmit)} 
        className="p-3 bg-base-100 border-t border-base-content/10 flex items-center gap-2"
      >
        <input 
          placeholder="Ask for hints or explain your approach..." 
          className="input input-bordered input-sm flex-1 text-xs rounded-xl bg-base-200/50 focus:bg-base-100" 
          autoComplete="off"
          {...register("message", { required: true })}
        />
        <button 
          type="submit" 
          className="btn btn-sm btn-primary rounded-xl"
          disabled={loading}
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}

export default ChatAi;