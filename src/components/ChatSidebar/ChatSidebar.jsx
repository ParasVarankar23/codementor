// components/ChatSidebar.jsx
"use client";

import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  FaCheck,
  FaComment,
  FaEdit,
  FaHistory,
  FaPlus,
  FaRobot,
  FaSignInAlt,
  FaTimes,
  FaTrash
} from "react-icons/fa";

export default function ChatSidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const {
    chats,
    currentChatId,
    setCurrentChatId,
    createNewChat,
    deleteChat,
    renameChat,
    chatsLoading
  } = useChat();
  const router = useRouter();
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleNewChat = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    setIsCreating(true);
    await createNewChat();
    setIsCreating(false);
    onClose(); // Close sidebar on mobile after creating new chat
  };

  const handleRename = (chat) => {
    setEditingId(chat.id);
    setEditTitle(chat.title);
  };

  const saveRename = async (chatId) => {
    if (editTitle.trim()) {
      await renameChat(chatId, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleDelete = async (chatId, e) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this chat?")) {
      await deleteChat(chatId);
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  if (!user) {
    return (
      <div className={`fixed left-0 top-0 h-full w-64 bg-[#0f1117] border-r border-[#2a2e3a] transform transition-transform duration-300 z-50 ${isOpen ? "translate-x-0" : "-translate-x-full"
        }`}>
        <div className="p-4 flex flex-col items-center justify-center h-full">
          <FaRobot className="text-4xl text-[#FF5A1F] mb-4" />
          <p className="text-gray-400 text-sm text-center mb-4">
            Sign in to save your chat history
          </p>
          <button
            onClick={() => router.push("/login")}
            className="bg-linear-to-r from-teal-700 to-teal-900 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:scale-105 transition-all"
          >
            <FaSignInAlt />
            Sign In
          </button>
        </div>
        <button
          onClick={onClose}
          className={`absolute -right-8 top-4 bg-[#0f1117] p-2 rounded-r-lg border border-[#2a2e3a] border-l-0 md:hidden ${isOpen ? "" : "hidden"}`}
        >
          <FaTimes className="text-gray-400" />
        </button>
      </div>
    );
  }

  return (
    <div className={`fixed left-0 top-0 h-full w-64 bg-[#0f1117] border-r border-[#2a2e3a] transform transition-transform duration-300 z-50 flex flex-col ${isOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
      {/* Header */}
      <div className="p-4 border-b border-[#2a2e3a]">
        <div className="flex items-center gap-2 mb-3">
          <FaHistory className="text-[#FF5A1F]" />
          <h2 className="text-white font-semibold">Chat History</h2>
        </div>
        <button
          onClick={handleNewChat}
          disabled={isCreating}
          className="w-full bg-linear-to-r from-teal-700 to-teal-900 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:scale-105 transition-all disabled:opacity-50"
        >
          {isCreating ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <FaPlus />
          )}
          New Chat
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-2">
        {chatsLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-[#FF5A1F] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : chats.length === 0 ? (
          <div className="text-center py-8">
            <FaComment className="text-gray-600 text-3xl mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No chats yet</p>
            <p className="text-gray-600 text-xs mt-1">Start a new conversation</p>
          </div>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => {
                setCurrentChatId(chat.id);
                onClose(); // Close sidebar on mobile when selecting chat
              }}
              className={`group relative mb-2 p-3 rounded-lg cursor-pointer transition-all ${currentChatId === chat.id
                ? "bg-[#FF5A1F]/20 border border-[#FF5A1F]/30"
                : "hover:bg-[#1a1c22] border border-transparent"
                }`}
            >
              {editingId === chat.id ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && saveRename(chat.id)}
                    className="flex-1 bg-[#1a1c22] text-white text-xs px-2 py-1 rounded border border-[#FF5A1F] focus:outline-none"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      saveRename(chat.id);
                    }}
                    className="text-green-500 hover:text-green-400"
                  >
                    <FaCheck size={12} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingId(null);
                    }}
                    className="text-red-500 hover:text-red-400"
                  >
                    <FaTimes size={12} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-start gap-2">
                    <FaRobot className="text-[#FF5A1F] text-xs mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm truncate">{chat.title}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        {formatDate(chat.updatedAt)} • {chat.messageCount || 0} messages
                      </p>
                    </div>
                  </div>

                  {/* Action buttons - appear on hover */}
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1 bg-[#0f1117] p-1 rounded">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRename(chat);
                      }}
                      className="text-gray-400 hover:text-[#FF5A1F] p-1"
                      title="Rename"
                    >
                      <FaEdit size={12} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(chat.id, e)}
                      className="text-gray-400 hover:text-red-500 p-1"
                      title="Delete"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Close button for mobile */}
      <button
        onClick={onClose}
        className={`absolute -right-8 top-4 bg-[#0f1117] p-2 rounded-r-lg border border-[#2a2e3a] border-l-0 md:hidden ${isOpen ? "" : "hidden"}`}
      >
        <FaTimes className="text-gray-400" />
      </button>
    </div>
  );
}