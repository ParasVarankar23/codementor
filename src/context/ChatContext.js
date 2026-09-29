// context/ChatContext.jsx
"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  deleteDoc,
  serverTimestamp,
  getDocs,
  getDoc,
  writeBatch
} from "firebase/firestore";
import axios from "axios";

// Create context
const ChatContext = createContext();

// Helper function to extract code from message
const extractCodeFromMessage = (message) => {
  const codeBlockRegex = /```(?:\w+)?\n([\s\S]*?)```/;
  const match = message.match(codeBlockRegex);
  if (match) {
    return match[1].trim();
  }
  return null;
};

// Provider component
export function ChatProvider({ children }) {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chatsLoading, setChatsLoading] = useState(true);
  const [aiTyping, setAiTyping] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("javascript");

  // Load user's chats
  useEffect(() => {
    if (!user) {
      setChats([]);
      setCurrentChatId(null);
      setMessages([]);
      setChatsLoading(false);
      return;
    }

    setChatsLoading(true);
    const chatsRef = collection(db, "chats");
    const q = query(
      chatsRef,
      where("userId", "==", user.uid),
      orderBy("updatedAt", "desc")
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const chatsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        }));
        setChats(chatsData);
        setChatsLoading(false);
      },
      (error) => {
        console.error("Error loading chats:", error);
        setChatsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Load messages when current chat changes
  useEffect(() => {
    if (!user || !currentChatId) {
      setMessages([]);
      return;
    }

    const messagesRef = collection(db, "chats", currentChatId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const messagesData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            timestamp: data.timestamp?.toDate() || new Date(),
          };
        });
        setMessages(messagesData);
      },
      (error) => {
        console.error("Error loading messages:", error);
      }
    );

    return () => unsubscribe();
  }, [currentChatId, user]);

  // Create a new chat
  const createNewChat = useCallback(async (title = "New Chat") => {
    if (!user) return null;

    try {
      setLoading(true);
      const chatsRef = collection(db, "chats");
      const newChat = {
        userId: user.uid,
        title: title,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        messageCount: 0,
      };

      const docRef = await addDoc(chatsRef, newChat);
      setCurrentChatId(docRef.id);
      setLoading(false);
      return docRef.id;
    } catch (error) {
      console.error("Error creating chat:", error);
      setLoading(false);
      return null;
    }
  }, [user]);

  // Send a user message
  const sendMessage = useCallback(async (content, type = "user", metadata = {}) => {
    if (!user) return null;

    let chatId = currentChatId;
    
    // Create new chat if none exists
    if (!chatId) {
      chatId = await createNewChat();
      if (!chatId) return null;
    }

    try {
      setLoading(true);
      
      // Remove undefined values from metadata
      const cleanMetadata = Object.fromEntries(
        Object.entries(metadata).filter(([_, v]) => v !== undefined && v !== null)
      );
      
      // Add message to subcollection
      const messagesRef = collection(db, "chats", chatId, "messages");
      const messageData = {
        content,
        type,
        timestamp: serverTimestamp(),
        ...cleanMetadata,
      };

      const messageRef = await addDoc(messagesRef, messageData);

      // Update chat's updatedAt and messageCount
      const chatRef = doc(db, "chats", chatId);
      const chatDoc = await getDoc(chatRef);
      const currentCount = chatDoc.data()?.messageCount || 0;
      
      await updateDoc(chatRef, {
        updatedAt: serverTimestamp(),
        messageCount: currentCount + 1,
      });

      setLoading(false);
      return messageRef.id;
    } catch (error) {
      console.error("Error sending message:", error);
      setLoading(false);
      return null;
    }
  }, [user, currentChatId, createNewChat]);

  // Send AI message
  const sendAIMessage = useCallback(async (content, metadata = {}) => {
    if (!user || !currentChatId) return null;

    try {
      // Remove undefined values from metadata
      const cleanMetadata = Object.fromEntries(
        Object.entries(metadata).filter(([_, v]) => v !== undefined && v !== null)
      );
      
      const messagesRef = collection(db, "chats", currentChatId, "messages");
      const messageData = {
        content,
        type: "ai",
        timestamp: serverTimestamp(),
        ...cleanMetadata,
      };

      const messageRef = await addDoc(messagesRef, messageData);

      // Update chat's updatedAt and messageCount
      const chatRef = doc(db, "chats", currentChatId);
      const chatDoc = await getDoc(chatRef);
      const currentCount = chatDoc.data()?.messageCount || 0;
      
      await updateDoc(chatRef, {
        updatedAt: serverTimestamp(),
        messageCount: currentCount + 1,
      });

      return messageRef.id;
    } catch (error) {
      console.error("Error sending AI message:", error);
      return null;
    }
  }, [user, currentChatId]);

  // Highlight lines in the editor
  const highlightLines = useCallback((lines) => {
    if (typeof window !== 'undefined' && window.monacoEditor && window.monacoEditor.highlightLines) {
      window.monacoEditor.highlightLines(lines);
    }
  }, []);

  // Clear all highlights
  const clearHighlights = useCallback(() => {
    if (typeof window !== 'undefined' && window.monacoEditor && window.monacoEditor.clearHighlights) {
      window.monacoEditor.clearHighlights();
    }
  }, []);

  // Clear temporary highlights (used after speech ends)
  const clearTemporaryHighlights = useCallback(() => {
    if (typeof window !== 'undefined' && window.monacoEditor && window.monacoEditor.clearTemporaryHighlights) {
      window.monacoEditor.clearTemporaryHighlights();
    }
  }, []);

  // Send message to AI - Uses generate-code API
  const sendToAI = useCallback(async (message, currentCode = "", currentLanguage = "javascript") => {
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    setAiTyping(true);

    try {
      // Send user message to Firebase
      await sendMessage(message, "user", { 
        language: currentLanguage, 
        code: currentCode 
      });

      // Call the generate-code API
      console.log("📤 Calling generate-code API:", { message, currentLanguage });
      
      const response = await axios.post("/api/generate-code", {
        message,
        language: currentLanguage
      });

      console.log("📥 Generate-code response:", response.data);

      const { data } = response.data;

      // Update current language
      if (data.language) {
        setCurrentLanguage(data.language);
      }

      // Highlight lines if any (with a small delay to ensure editor is ready)
      if (data.highlightedLines && data.highlightedLines.length > 0) {
        setTimeout(() => {
          highlightLines(data.highlightedLines);
        }, 500);
      }

      // Save AI response to Firebase
      await sendAIMessage(data.displayMessage || data.explanation, {
        generatedCode: data.code,
        language: data.language,
        explanation: data.explanation,
        highlightedLines: data.highlightedLines
      });

      setAiTyping(false);
      
      return { 
        success: true, 
        data
      };

    } catch (error) {
      console.error("Error in sendToAI:", error);
      
      await sendAIMessage("😔 Sorry, I encountered an error. Please try again.", {
        error: true
      });

      setAiTyping(false);
      return { success: false, error: error.message };
    }
  }, [user, sendMessage, sendAIMessage, highlightLines]);

// In context/ChatContext.jsx

// Fix code with AI - Uses fix-code API (OpenRouter + Gemini)
const fixCodeWithAI = useCallback(async (codeToFix, errorMessage = "") => {
  if (!user) {
    return { success: false, error: "User not authenticated" };
  }

  setAiTyping(true);

  try {
    // Send user message
    const userMessage = errorMessage || "Please help fix my code";
    await sendMessage(userMessage, "user", { 
      language: currentLanguage, 
      code: codeToFix,
      type: "fix-request"
    });

    // Call the fix-code API which uses OpenRouter + Gemini
    console.log("🔧 Calling fix-code API with:", { 
      codeLength: codeToFix.length, 
      language: currentLanguage,
      errorMessage 
    });
    
    const response = await axios.post("/api/fix-code", {
      code: codeToFix,
      language: currentLanguage,
      errorMessage
    });

    console.log("📥 Fix-code API response:", response.data);

    const { data } = response.data;

    // Check if the API returned successfully
    if (!data) {
      throw new Error("No data received from fix-code API");
    }

    console.log("✅ Fix-code API result:", {
      wasFixed: data.wasFixed,
      hasFixedCode: !!data.fixedCode,
      explanationLength: data.explanation?.length
    });

    // Highlight fixed lines if any
    if (data.highlightedLines && data.highlightedLines.length > 0) {
      setTimeout(() => {
        highlightLines(data.highlightedLines);
      }, 500);
    }

    // Construct the AI message with proper formatting
    let aiMessage = "";
    
    if (data.wasFixed && data.fixedCode) {
      // Code was fixed - show the fixed code with buttons
      aiMessage = `🎯 **I fixed your ${currentLanguage} code!**\n\nHere's the corrected version:\n\n\`\`\`${currentLanguage}\n${data.fixedCode}\n\`\`\`\n\n${data.displayMessage || ''}\n\nWhat would you like to do next? 👇`;
    } else {
      // No fixes needed or couldn't fix
      aiMessage = data.displayMessage || "I've analyzed your code.";
    }

    // Send AI response to Firebase
    await sendAIMessage(aiMessage, {
      fixedCode: data.fixedCode, // This will be undefined if no fix was made
      originalCode: codeToFix,
      showFixButtons: data.wasFixed && !!data.fixedCode, // Only show buttons if code was actually fixed
      explanation: data.explanation,
      errors: data.errors,
      highlightedLines: data.highlightedLines
    });

    setAiTyping(false);
    
    return { 
      success: true, 
      fixedCode: data.fixedCode,
      message: aiMessage,
      displayMessage: data.displayMessage,
      explanation: data.explanation,
      errors: data.errors,
      highlightedLines: data.highlightedLines,
      wasFixed: data.wasFixed
    };
  } catch (error) {
    console.error("Error in fixCodeWithAI:", error);
    
    // Send error message
    const errorMessage = "😔 Sorry, I couldn't fix your code right now. Please try again.";
    await sendAIMessage(errorMessage, {
      error: true
    });

    setAiTyping(false);
    return { success: false, error: error.message };
  }
}, [user, sendMessage, sendAIMessage, currentLanguage, highlightLines]);
  // Delete a chat and all its messages
  const deleteChat = useCallback(async (chatId) => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Delete all messages in the chat
      const messagesRef = collection(db, "chats", chatId, "messages");
      const messagesSnapshot = await getDocs(messagesRef);
      
      const batch = writeBatch(db);
      messagesSnapshot.docs.forEach((messageDoc) => {
        batch.delete(doc(db, "chats", chatId, "messages", messageDoc.id));
      });
      
      // Delete the chat document
      batch.delete(doc(db, "chats", chatId));
      
      await batch.commit();

      if (currentChatId === chatId) {
        setCurrentChatId(null);
        clearHighlights(); // Clear highlights when chat is deleted
      }

      setLoading(false);
    } catch (error) {
      console.error("Error deleting chat:", error);
      setLoading(false);
    }
  }, [user, currentChatId, clearHighlights]);

  // Rename a chat
  const renameChat = useCallback(async (chatId, newTitle) => {
    if (!user) return;

    try {
      const chatRef = doc(db, "chats", chatId);
      await updateDoc(chatRef, {
        title: newTitle,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error renaming chat:", error);
    }
  }, [user]);

  // Set current chat
  const setCurrentChat = useCallback((chatId) => {
    setCurrentChatId(chatId);
    clearHighlights(); // Clear highlights when switching chats
  }, [clearHighlights]);

  // Clear current chat
  const clearCurrentChat = useCallback(() => {
    setCurrentChatId(null);
    setMessages([]);
    clearHighlights(); // Clear highlights when clearing chat
  }, [clearHighlights]);

  // Format messages for display
  const getFormattedMessages = useCallback(() => {
    return messages.map(msg => {
      const formatted = {
        id: msg.id,
        type: msg.type,
        message: msg.content,
        timestamp: msg.timestamp?.toLocaleTimeString() || new Date().toLocaleTimeString(),
      };
      
      // Add optional fields only if they exist
      if (msg.fixedCode) formatted.fixedCode = msg.fixedCode;
      if (msg.originalCode) formatted.originalCode = msg.originalCode;
      if (msg.showFixButtons) formatted.showFixButtons = msg.showFixButtons;
      if (msg.generatedCode) formatted.generatedCode = msg.generatedCode;
      if (msg.language) formatted.language = msg.language;
      if (msg.explanation) formatted.explanation = msg.explanation;
      if (msg.highlightedLines) formatted.highlightedLines = msg.highlightedLines;
      
      return formatted;
    });
  }, [messages]);

  const value = {
    // State
    chats,
    currentChatId,
    messages: getFormattedMessages(),
    rawMessages: messages,
    loading,
    chatsLoading,
    aiTyping,
    currentLanguage,
    
    // Chat management
    createNewChat,
    deleteChat,
    renameChat,
    setCurrentChatId: setCurrentChat,
    clearCurrentChat,
    
    // Message functions
    sendMessage,
    sendAIMessage,
    sendToAI,
    fixCodeWithAI,
    
    // Highlight functions
    highlightLines,
    clearHighlights,
    clearTemporaryHighlights,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

// Custom hook to use chat context
export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};