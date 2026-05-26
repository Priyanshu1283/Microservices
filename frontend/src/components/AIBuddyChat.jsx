import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Send, Trash2, Minimize2, Sparkles, Lock, ChevronDown, Info } from 'lucide-react';

export function AIBuddyChat() {
  const { isAuthenticated, user } = useAuthStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [socket, setSocket] = useState(null);
  const [connectionError, setConnectionError] = useState(null);

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const socketRef = useRef(null);

  // Set dynamic welcome message based on login state
  useEffect(() => {
    if (isAuthenticated) {
      setTimeout(() => {
        setMessages([
          {
            sender: 'bot',
            text: `Welcome back, Captain, I am fully connected and ready to navigate our store. I can search products, add items to your cart, and track orders for you. How can I help you today?`,
            timestamp: new Date()
          }
        ]);
      }, 0);
    } else {
      setTimeout(() => {
        setMessages([
          {
            sender: 'bot',
            text: "Ahoy! I'm your AI Buddy. 🚢 Since you are browsing as a guest, please feel free to ask me questions. To use my advanced features like **searching products** and **adding items to your cart**, please log in first!",
            timestamp: new Date()
          }
        ]);
      }, 0);
    }
  }, [isAuthenticated, user]);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  // Handle Socket.io connection (only when authenticated)
  useEffect(() => {
    if (!isAuthenticated) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setTimeout(() => setSocket(null), 0);
      }
      setTimeout(() => setIsConnected(false), 0);
      return;
    }

    // Connect directly to the AI Buddy backend socket at port 3005
    const newSocket = io('http://localhost:3005', {
      withCredentials: true,
      transports: ['polling', 'websocket'], // Polling first to avoid raw websocket connection errors in console
      reconnectionAttempts: 3,
      reconnectionDelay: 3000,
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

    setTimeout(() => {
      setSocket(newSocket);
      socketRef.current = newSocket;
    }, 0);

    return () => {
      newSocket.disconnect();
      if (socketRef.current === newSocket) {
        socketRef.current = null;
        setTimeout(() => setSocket(null), 0);
      }
    };
  }, [isAuthenticated, queryClient]);

  // Local Guest Mode Response Generator
  const getGuestAIResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    if (input.includes('search') || input.includes('find') || input.includes('product') || input.includes('item') || input.includes('show')) {
      return "I can certainly search our catalog for you! 🔍 However, searching and displaying live items require secure database access. Please **log in** to your account so I can find products and show them directly inside our chat!";
    }
    
    if (input.includes('cart') || input.includes('add') || input.includes('buy') || input.includes('purchase')) {
      return "I would love to help you add items to your cart! 🛒 To let me manage your shopping cart, please **log in** to your account. I can then add any product for you instantly!";
    }
    
    if (input.includes('order') || input.includes('track') || input.includes('status') || input.includes('history')) {
      return "I can track your purchases and show your delivery status! 📦 Please **log in** so I can access your secure order history and help you track your packages.";
    }
    
    if (input.includes('hello') || input.includes('hi') || input.includes('hey') || input.includes('yo')) {
      return "Hello! I am your AI Buddy, the captain of this storefront. 🚢 Since you're currently browsing as a guest, please **log in** so I can assist you with advanced actions like **searching products**, **adding items to your cart**, and **tracking orders**!";
    }
    
    return "I am here to help you navigate this store! To unlock my advanced capabilities—like **searching our catalog**, **adding items to your cart**, or **checking your order status**—please **log in** to your account. What would you like to do first?";
  };

  // Send message handler
  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

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

    if (!isAuthenticated) {
      // Guest Mode: Simulate AI response locally after 800ms
      setTimeout(() => {
        setIsTyping(false);
        const responseText = getGuestAIResponse(textToSend);
        setMessages(prev => [
          ...prev,
          {
            sender: 'bot',
            text: responseText,
            timestamp: new Date()
          }
        ]);
      }, 800);
      return;
    }

    // Authenticated Mode: Send to Socket.io
    if (!socket || !isConnected) {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: "⚠️ Oops! I'm currently disconnected from my control deck. Please verify if the backend service is running and try reloading.",
          timestamp: new Date()
        }
      ]);
      return;
    }

    socket.emit('message', textToSend);
  };

  // Clear chat logs
  const handleClearChat = () => {
    setMessages([
      {
        sender: 'bot',
        text: isAuthenticated 
          ? `Chat cleared! I'm ready for a fresh start, Captain 🌊 How can I help you navigate the store?`
          : `Chat cleared! I'm ready for a fresh start! 🌊 Please remember that you are browsing as a guest. Log in to unlock my full capabilities!`,
        timestamp: new Date()
      }
    ]);
  };

  // Click quick action suggestion
  const handleQuickAction = (actionText) => {
    setInputText(actionText);
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          sender: 'user',
          text: actionText,
          timestamp: new Date()
        }
      ]);
      setIsTyping(true);
      
      if (!isAuthenticated) {
        // Guest mode response simulated
        setTimeout(() => {
          setIsTyping(false);
          const responseText = getGuestAIResponse(actionText);
          setMessages(prev => [
            ...prev,
            {
              sender: 'bot',
              text: responseText,
              timestamp: new Date()
            }
          ]);
        }, 800);
      } else {
        socket?.emit('message', actionText);
      }
    }, 100);
  };

  // Formatting utility for AI text (converts simple markdown bold **text** and lists)
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
      formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-955 dark:text-white">$1</strong>');
      
      // Replace inline code `` `code` ``
      formattedText = formattedText.replace(/`(.*?)`/g, '<code class="bg-gray-100 dark:bg-zinc-900 px-1 py-0.5 rounded text-xs font-mono border border-gray-200 dark:border-zinc-700 font-semibold text-primary dark:text-primary-foreground">$1</code>');

      // Replace newlines with <br /> and bullets with list items
      const lines = formattedText.split('\n');
      let insideList = false;
      const parsedLines = [];

      lines.forEach((line) => {
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
                    {isAuthenticated ? (isConnected ? 'Online • Shop Navigator' : 'Connecting...') : 'Online • Guest Assistant'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={handleClearChat}
                  title="Clear history"
                  className="p-1.5 hover:bg-white/15 rounded-lg text-white/90 hover:text-white transition-colors cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
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
              {/* RENDER CONVERSATION THREAD */}
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
            </div>

            {/* QUICK ACTIONS SUGGESTIONS */}
            {messages.length <= 2 && (
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

            {/* CONNECTIONS STATUS MESSAGE BOX (ONLY WHEN LOGGED IN AND DISCONNECTED) */}
            {isAuthenticated && connectionError && (
              <div className="px-4 py-1.5 bg-red-50 dark:bg-red-950/30 border-t border-red-100 dark:border-red-900/40 text-[10px] text-red-500 flex items-center gap-1.5 shrink-0">
                <Info className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">Error: {connectionError}. Please check connection.</span>
              </div>
            )}

            {/* Guest mode Log-in Prompt Banner */}
            {!isAuthenticated && (
              <div className="px-4 py-2 bg-amber-50/70 dark:bg-amber-950/20 border-t border-amber-100 dark:border-amber-900/30 text-[10px] text-amber-700 dark:text-amber-300 flex items-center justify-between gap-1.5 shrink-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-1.5 truncate">
                  <Lock className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate font-medium">Log in to add products to your cart and search live products!</span>
                </div>
                <button 
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/login');
                  }}
                  className="text-xs font-bold text-primary dark:text-primary-foreground underline shrink-0 hover:text-accent cursor-pointer ml-1"
                >
                  Login
                </button>
              </div>
            )}

            {/* INPUT PANEL (ALWAYS ENABLED) */}
            <form 
              onSubmit={handleSendMessage}
              className="p-3 border-t border-border bg-white dark:bg-zinc-800 flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={isAuthenticated ? "Ask AI Buddy to do something..." : "Chat as guest or ask a question..."}
                className="flex-1 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-primary dark:focus:border-primary transition-colors text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 font-medium"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isTyping}
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
