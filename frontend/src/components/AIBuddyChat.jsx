import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Send, 
  X, 
  Trash2, 
  Minimize2, 
  MessageSquare, 
  Sparkles, 
  ShoppingCart, 
  Search, 
  Lock, 
  ArrowRight,
  ChevronDown,
  Info
} from 'lucide-react';
import { Button } from './ui/Button';

export function AIBuddyChat() {
  const { isAuthenticated, user } = useAuthStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Ahoy! I'm your AI Buddy. 🚢 Ready to help you navigate our store! I can search for products, add items to your cart, check your orders, and more. How can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [socket, setSocket] = useState(null);
  const [connectionError, setConnectionError] = useState(null);

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  // Handle Socket.io connection
  useEffect(() => {
    if (!isAuthenticated) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      setIsConnected(false);
      return;
    }

    // Connect to same-origin socket via the Vite proxy (/socket.io)
    const newSocket = io({
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000
    });

    newSocket.on('connect', () => {
      console.log('AI Buddy WebSocket connected successfully');
      setIsConnected(true);
      setConnectionError(null);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('AI Buddy WebSocket disconnected:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('AI Buddy WebSocket connection error:', error);
      setConnectionError(error.message || 'Authentication error: Invalid Token');
      setIsConnected(false);
    });

    newSocket.on('message', (msg) => {
      console.log('Received message from AI Buddy:', msg);
      
      // Update typing state
      setIsTyping(false);

      // Add to messages list
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: msg,
          timestamp: new Date()
        }
      ]);

      // Dynamic Integration: If message contains signals of cart changes or products added,
      // invalidate the React Query cart query to refresh the cart badge and items automatically!
      const lowerMsg = msg.toLowerCase();
      if (
        lowerMsg.includes('added') && 
        (lowerMsg.includes('cart') || lowerMsg.includes('shopping cart'))
      ) {
        console.log('AI Buddy added item to cart. Invalidating React Query cart cache...');
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['cart'] });
        }, 800); // Give the backend service a split second to persist
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, queryClient]);

  // Send message handler
  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    // Check if socket is connected
    if (!socket || !isConnected) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'user',
          text: inputText,
          timestamp: new Date()
        },
        {
          sender: 'bot',
          text: "⚠️ Opps! I'm currently disconnected from my control deck. Please make sure you are logged in and try reloading the page.",
          timestamp: new Date()
        }
      ]);
      setInputText('');
      return;
    }

    const textToSend = inputText;
    setInputText('');

    // Add user message to UI
    setMessages(prev => [
      ...prev,
      {
        sender: 'user',
        text: textToSend,
        timestamp: new Date()
      }
    ]);

    // Show bot typing animation
    setIsTyping(true);

    // Send to Socket.io
    socket.emit('message', textToSend);
  };

  // Clear chat logs
  const handleClearChat = () => {
    setMessages([
      {
        sender: 'bot',
        text: `Chat cleared! I'm ready for a fresh start, Captain ${user?.name || ''}! 🌊 How can I help you navigate the store?`,
        timestamp: new Date()
      }
    ]);
  };

  const handleQuickAction = (actionText) => {
    setInputText(actionText);
    // Autofocus and submit can be done, but let the user review or send immediately:
    setTimeout(() => {
      // Simulate sending
      setMessages(prev => [
        ...prev,
        {
          sender: 'user',
          text: actionText,
          timestamp: new Date()
        }
      ]);
      setIsTyping(true);
      socket?.emit('message', actionText);
    }, 100);
  };
  const formatMessageText = (text) => {
    if (!text) return '';
    
    // Safety check for errors
    if (text.startsWith('⚠️') || text.startsWith('Authentication error')) {
      return <span className="text-red-500 font-medium">{text}</span>;
    }

    // Split text by code blocks
    const parts = text.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        // Code Block
        const code = part.slice(3, -3).trim();
        // Remove optional language identifier
        const cleanCode = code.replace(/^[a-zA-Z]+\n/, '');
        return (
          <pre key={index} className="bg-slate-950 text-slate-100 p-3 rounded-lg text-xs font-mono my-2 overflow-x-auto border border-slate-800 shadow-inner">
            <code>{cleanCode}</code>
          </pre>
        );
      }

      // Inline code and bold styling
      let formattedText = part;
      
      // Escape HTML
      formattedText = formattedText
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      // Replace bold `**text**`
      formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-950 dark:text-white">$1</strong>');
      
      // Replace inline code `` `code` ``
      formattedText = formattedText.replace(/`(.*?)`/g, '<code class="bg-gray-100 dark:bg-zinc-900 px-1 py-0.5 rounded text-xs font-mono border border-gray-200 dark:border-zinc-700 font-semibold text-primary dark:text-primary-foreground">$1</code>');

      // Replace newlines with <br /> and bullets with list items
      const lines = formattedText.split('\n');
      let insideList = false;
      const parsedLines = [];

      lines.forEach((line, lineIdx) => {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
          if (!insideList) {
            insideList = true;
            parsedLines.push('<ul class="list-disc pl-5 space-y-1 my-2 text-gray-800 dark:text-gray-100">');
          }
          parsedLines.push(`<li class="leading-relaxed text-gray-800 dark:text-gray-100">${trimmedLine.substring(2)}</li>`);
        } else {
          if (insideList) {
            insideList = false;
            parsedLines.push('</ul>');
          }
          parsedLines.push(`<p class="leading-relaxed my-1 min-h-[1rem] text-gray-800 dark:text-gray-100">${line}</p>`);
        }
      });

      if (insideList) {
        parsedLines.push('</ul>');
      }

      return (
        <span 
          key={index} 
          dangerouslySetInnerHTML={{ __html: parsedLines.join('') }} 
        />
      );
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* CHAT WINDOW (ANIMATED) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 40, x: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 40, x: 20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 26 }}
            className="w-96 max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-8rem)] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-4 transition-all"
          >
            {/* GRADIENT PREMIUM HEADER */}
            <div className="bg-gradient-to-r from-[#2874f0] via-[#3c82f6] to-[#fb641b] px-4 py-3 flex items-center justify-between shadow-md shrink-0">
              <div className="flex items-center gap-3">
                {/* stylized digital boat avatar */}
                <div className="relative h-9 w-9 rounded-full bg-white flex items-center justify-center shadow-md animate-bounce-slow">
                  <svg viewBox="0 0 24 24" className="w-5.5 h-5.5 text-[#2874f0] fill-none stroke-current" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 17h20c0 0-2 4-10 4S2 17 2 17z" />
                    <path d="M12 3v14" />
                    <path d="M12 3a8.5 8.5 0 0 1 8.5 7.5c0 1.5-1.5 2.5-8.5 3" />
                  </svg>
                  {/* Glowing Connection Dot */}
                  {isAuthenticated && (
                    <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${isConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]'} animate-pulse`} />
                  )}
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm flex items-center gap-1.5">
                    AI Buddy
                    <Sparkles className="h-3.5 w-3.5 text-[#ffe11b]" />
                  </h3>
                  <p className="text-[10.5px] text-white/90 font-medium">
                    {isAuthenticated ? (isConnected ? 'Online • Shop Navigator' : 'Connecting...') : 'Offline'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {isAuthenticated && (
                  <button 
                    onClick={handleClearChat}
                    title="Clear history"
                    className="p-1.5 hover:bg-white/15 rounded-lg text-white/90 hover:text-white transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/15 rounded-lg text-white/90 hover:text-white transition-colors cursor-pointer"
                >
                  <Minimize2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* CHAT MESSAGES BODY */}
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/70 dark:bg-zinc-950"
            >
              {!isAuthenticated ? (
                /* RENDER UNAUTHENTICATED LOG IN CARD */
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-5">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                    <Lock className="h-8 w-8" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-base text-gray-900 dark:text-gray-50">AIBuddy is Locked</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[240px] mx-auto leading-relaxed">
                      Please log in to chat with AI Buddy so he can access your customized shopping cart and orders.
                    </p>
                  </div>
                  <Button 
                    onClick={() => {
                      setIsOpen(false);
                      navigate('/login');
                    }}
                    className="w-full bg-primary hover:bg-primary/95 text-white py-2 text-xs flex items-center justify-center gap-2 rounded-xl transition-all shadow-md active:scale-98 cursor-pointer"
                  >
                    Go to Login
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                /* RENDER ACTIVE CONVERSATION */
                <>
                  {messages.map((msg, idx) => {
                    const isBot = msg.sender === 'bot';
                    return (
                      <div 
                        key={idx}
                        className={`flex ${isBot ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-2 duration-200`}
                      >
                        <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs shadow-md leading-relaxed border ${
                          isBot 
                            ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 border-gray-100 dark:border-zinc-700/60 rounded-tl-sm' 
                            : 'bg-primary text-white border-transparent rounded-tr-sm'
                        }`}>
                          {/* Rich Text Format */}
                          <div className="space-y-1 text-gray-800 dark:text-gray-100">
                            {formatMessageText(msg.text)}
                          </div>
                          
                          {/* Timestamp */}
                          <div className={`text-[9px] mt-1.5 text-right ${
                            isBot ? 'text-gray-400 dark:text-gray-500' : 'text-white/70'
                          }`}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* TYPING LOADER */}
                  {isTyping && (
                    <div className="flex justify-start animate-in fade-in duration-200">
                      <div className="bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700/60 rounded-2xl rounded-tl-sm px-4 py-3 shadow-md flex items-center gap-2">
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Buddy is thinking</span>
                        <div className="flex gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* REF FOR SCROLL */}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* QUICK ACTIONS SUGGESTIONS (ONLY WHEN LOGGED IN) */}
            {isAuthenticated && isConnected && messages.length <= 2 && (
              <div className="px-4 py-2.5 bg-slate-100 dark:bg-zinc-900 border-t border-border flex flex-wrap gap-1.5 max-h-24 overflow-y-auto shrink-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <button 
                  onClick={() => handleQuickAction('Search for shoes')}
                  className="bg-white dark:bg-zinc-800 border border-gray-250 dark:border-zinc-700 text-[10px] px-2.5 py-1 rounded-full text-gray-750 dark:text-gray-200 hover:border-primary dark:hover:border-primary hover:text-primary dark:hover:text-primary-foreground transition-all cursor-pointer shadow-sm font-medium"
                >
                  🔍 Search shoes
                </button>
                <button 
                  onClick={() => handleQuickAction('Add product with ID prod-1 to my cart')}
                  className="bg-white dark:bg-zinc-800 border border-gray-255 dark:border-zinc-700 text-[10px] px-2.5 py-1 rounded-full text-gray-750 dark:text-gray-200 hover:border-primary dark:hover:border-primary hover:text-primary dark:hover:text-primary-foreground transition-all cursor-pointer shadow-sm font-medium"
                >
                  🛒 Add prod-1 to cart
                </button>
                <button 
                  onClick={() => handleQuickAction('What can you do?')}
                  className="bg-white dark:bg-zinc-800 border border-gray-255 dark:border-zinc-700 text-[10px] px-2.5 py-1 rounded-full text-gray-750 dark:text-gray-200 hover:border-primary dark:hover:border-primary hover:text-primary dark:hover:text-primary-foreground transition-all cursor-pointer shadow-sm font-medium"
                >
                  💡 Help instructions
                </button>
              </div>
            )}

            {/* CONNECTIONS STATUS MESSAGE BOX */}
            {isAuthenticated && connectionError && (
              <div className="px-4 py-1.5 bg-red-50 dark:bg-red-950/30 border-t border-red-100 dark:border-red-900/40 text-[10px] text-red-500 flex items-center gap-1.5 shrink-0">
                <Info className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">Error: {connectionError}. Please re-login.</span>
              </div>
            )}

            {/* INPUT PANEL (ONLY ENABLED WHEN LOGGED IN) */}
            <form 
              onSubmit={handleSendMessage}
              className="p-3 border-t border-border bg-white dark:bg-zinc-800 flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                disabled={!isAuthenticated}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={isAuthenticated ? "Ask AI Buddy to do something..." : "Please login to chat"}
                className="flex-1 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-primary dark:focus:border-primary transition-colors disabled:opacity-50 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 font-medium"
              />
              <button
                type="submit"
                disabled={!isAuthenticated || !inputText.trim() || isTyping}
                className="h-8.5 w-8.5 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary/95 transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:scale-100 cursor-pointer"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING BOAT LOGO BUTTON */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`relative h-15 w-15 rounded-full flex items-center justify-center shadow-2xl cursor-pointer select-none transition-all duration-300 ${
          isOpen 
            ? 'bg-accent text-white shadow-accent/40' 
            : 'bg-primary text-white shadow-primary/40'
        }`}
      >
        {/* Pulsing ring animation in background */}
        <span className="absolute -inset-1 rounded-full bg-inherit opacity-25 animate-ping-slow pointer-events-none" />
        
        {isOpen ? (
          <ChevronDown className="h-7 w-7 animate-in fade-in zoom-in duration-300" />
        ) : (
          <div className="relative">
            {/* Premium custom boat icon */}
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-white fill-none stroke-current animate-bounce-slow" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 17h20c0 0-2 4-10 4S2 17 2 17z" className="fill-white/10" />
              <path d="M12 3v14" />
              <path d="M12 3a8.5 8.5 0 0 1 8.5 7.5c0 1.5-1.5 2.5-8.5 3" className="fill-white/5" />
              <circle cx="12" cy="10" r="1" className="fill-[#ffe11b]" />
            </svg>
            {/* Sparkle badge */}
            <span className="absolute -top-1.5 -right-1.5 bg-accent text-white rounded-full p-0.5 shadow-md flex items-center justify-center animate-pulse">
              <Sparkles className="h-3 w-3 fill-current text-[#ffe11b]" />
            </span>
          </div>
        )}
      </motion.button>
    </div>
  );
}
