// src/components/Chat.tsx
import React, { useState, useEffect, useRef } from "react";
import { database } from "../firebaseConfig";
import { ref, push, onValue, query, orderByChild } from "firebase/database";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
}

interface ChatProps {
  currentUserId: string;
  currentUserName: string;
  tutorUserId: string;
  tutorUserName: string;
}

export default function Chat({
  currentUserId,
  currentUserName,
  tutorUserId,
  tutorUserName,
}: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Create a consistent chat path by sorting user IDs
  const chatPath =
    currentUserId < tutorUserId
      ? `${currentUserId}_${tutorUserId}`
      : `${tutorUserId}_${currentUserId}`;

  // Listen to messages in realtime
  useEffect(() => {
    const messagesRef = query(ref(database, `chats/${chatPath}`), orderByChild("timestamp"));

    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const val = snapshot.val() || {};
      const msgs = Object.entries(val).map(([id, msg]) => ({
        id,
        ...(msg as Omit<Message, "id">), // Type assertion: msg is message object without id
      }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [chatPath]);

  // Scroll chat view to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send a new message to Firebase DB
  const sendMessage = () => {
    if (!input.trim()) return;
    push(ref(database, `chats/${chatPath}`), {
      senderId: currentUserId,
      senderName: currentUserName,
      text: input.trim(),
      timestamp: Date.now(),
    });
    setInput("");
  };

  return (
    <div className="flex flex-col h-full max-w-md border rounded shadow p-4 bg-white">
      <div className="flex-1 overflow-auto mb-4 space-y-3">
        {messages.map(({ id, senderName, text }) => (
          <div
            key={id}
            className={`p-2 rounded max-w-xs ${
              senderName === currentUserName ? "bg-blue-100 self-end" : "bg-gray-200 self-start"
            }`}
          >
            <p className="text-sm font-semibold">{senderName}</p>
            <p>{text}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          aria-label="Type your message"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          aria-label="Send message"
        >
          Send
        </button>
      </div>
    </div>
  );
}
