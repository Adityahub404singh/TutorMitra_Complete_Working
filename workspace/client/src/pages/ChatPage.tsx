import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../store/AuthProvider";
import { useParams, useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";

interface Message {
  _id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  content: string;
  timestamp: string;
  messageType?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  isRead?: boolean;
  roomId?: string;
}

const SOCKET_SERVER_URL = "http://localhost:3000";

export default function ChatPage() {
  const { user, loading } = useAuth();
  const { tutorId, studentId } = useParams<{ tutorId?: string; studentId?: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!studentId || !tutorId) {
      navigate("/");
    }
  }, [studentId, tutorId, navigate]);

  const currentUserId = user?._id ?? user?.id ?? "";
  const isUserTutor = tutorId && String(tutorId) === String(currentUserId);
  const otherUserId = isUserTutor
    ? studentId ?? ""
    : tutorId ?? "";
  const roomId = studentId && tutorId ? `${studentId}-${tutorId}` : "";

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [imgFile, setImgFile] = useState<File | null>(null);
  const [imgPreview, setImgPreview] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(true);
  const [sendError, setSendError] = useState("");
  const [sendingImg, setSendingImg] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);
  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  useEffect(() => {
    if (!user || !roomId || !otherUserId) return;
    if (!socketRef.current) {
      const socket = io(SOCKET_SERVER_URL, {
        auth: { token: localStorage.getItem("tm_token") ?? "" },
        query: { userId: currentUserId },
        transports: ["websocket"],
      });
      socketRef.current = socket;
      socket.on("connect", () => {
        setConnected(true);
        socket.emit("register", currentUserId);
        socket.emit("joinRoom", roomId);
        socket.emit("getHistory", roomId, (history: Message[] = []) => {
          setMessages(history);
          setFetchingHistory(false);
        });
      });
      socket.on("chatMessage", (msg: Message) => {
        setMessages((prev) => [...prev, msg]);
        if (msg.receiverId === currentUserId) {
          socket.emit("markAsRead", msg._id, msg.roomId ?? roomId);
        }
      });
      socket.on("messageSeen", (msgId: string) => {
        setMessages((prev) => prev.map(m =>
          m._id === msgId ? { ...m, isRead: true } : m
        ));
      });
      socket.on("disconnect", () => setConnected(false));
      socket.on("connect_error", () => {
        setConnected(false);
        setSendError("Connection failed. Please refresh the page.");
      });
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setConnected(false);
      }
    };
  }, [user, roomId, otherUserId, currentUserId]);

  const sendMessage = () => {
    setSendError("");
    const trimmed = input.trim();
    if (!trimmed || !socketRef.current || !connected || !user || !roomId || !otherUserId) return;
    const newMsg: Message = {
      _id: Date.now().toString(),
      senderId: currentUserId,
      senderName: user.name ?? "",
      receiverId: otherUserId,
      roomId,
      content: trimmed,
      timestamp: new Date().toISOString(),
      messageType: "text"
    };
    setMessages((prev) => [...prev, newMsg]);
    socketRef.current.emit("sendMessage", newMsg, (ack: { success: boolean; error?: string }) => {
      if (ack.success) setInput("");
      else setSendError(ack.error ?? "Failed to send message. Please try again.");
    });
  };

  const handleImageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImgFile(file);
      setImgPreview(URL.createObjectURL(file));
    }
  };

  const handleImageSend = async () => {
    if (!imgFile || !socketRef.current || !connected || !user || !roomId || !otherUserId) return;
    setSendError("");
    setSendingImg(true);
    try {
      const formData = new FormData();
      formData.append("file", imgFile);

      const res = await fetch("http://localhost:3000/api/upload", {
        method: "POST",
        body: formData
      });

      if (!res.ok) {
        let msg = "Image/network upload failed.";
        try {
          const err = await res.json();
          msg = err?.error || msg;
        } catch {}
        throw new Error(msg);
      }
      const { url, size, name } = await res.json();
      if (!url) throw new Error("Image upload failed.");
      const fileUrl = url.startsWith("http") ? url : `http://localhost:3000${url}`;
      const imgMsg: Message = {
        _id: Date.now().toString(),
        senderId: currentUserId,
        senderName: user.name ?? "",
        receiverId: otherUserId,
        roomId,
        content: "",
        timestamp: new Date().toISOString(),
        messageType: "image",
        fileUrl,
        fileName: name ?? imgFile.name,
        fileSize: size ?? imgFile.size,
      };
      setMessages((prev) => [...prev, imgMsg]);
      socketRef.current.emit("sendMessage", imgMsg, (ack: { success: boolean; error?: string }) => {
        setSendingImg(false);
        if (ack.success) {
          setImgFile(null);
          setImgPreview(null);
        } else setSendError(ack.error ?? "Failed to send image. Please try again.");
      });
    } catch (e) {
      setSendingImg(false);
      setSendError((e as Error).message ?? "Image upload error");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading)
    return <div className="flex items-center justify-center h-[70vh] text-xl text-indigo-500/80">Loading chat…</div>;
  if (!user)
    return <div className="flex items-center justify-center h-[70vh] text-lg font-semibold text-gray-500">Please login to access chat.</div>;
  if (!roomId || !otherUserId)
    return <div className="flex items-center justify-center h-[70vh] text-xl text-yellow-600">Chat user not selected.</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white dark:bg-gray-900 rounded-3xl h-[82vh] flex flex-col shadow-md ring-1 ring-primary/5 mt-2">
      <div className="flex items-center gap-2 p-2">
        <div className="text-lg font-bold text-primary flex-1">💬 Chat Room</div>
        <div
          className={`px-2 py-1 text-xs rounded ${connected ? "bg-green-100 text-green-800" : "bg-red-100 text-red-600"} font-semibold transition`}
          style={{ minWidth: 80, textAlign: "center" }}
          aria-live="polite"
        >
          {connected ? "Connected" : "Connecting..."}
        </div>
      </div>
      <div
        className="flex-1 overflow-y-auto space-y-4 px-2 md:px-6 py-2 md:py-4 scrollbar-thin scrollbar-thumb-yellow-400 scrollbar-track-yellow-100 dark:scrollbar-thumb-yellow-600 dark:scrollbar-track-gray-800 border-b border-gray-100 dark:border-gray-800"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-label="Chat messages"
        tabIndex={0}
      >
        {fetchingHistory ? (
          <div className="text-center text-yellow-600 mt-10">Loading chat history…</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-8 italic">No messages yet. Start the conversation!</div>
        ) : (
          messages.map((msg) => {
            const isCurrentUser = msg.senderId === currentUserId;
            return (
              <div
                key={msg._id}
                className={`max-w-md break-words p-4 rounded-2xl shadow-md relative ${
                  isCurrentUser
                    ? "bg-yellow-500 text-white ml-auto rounded-br-none"
                    : "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-yellow-300 rounded-bl-none"
                }`}
                aria-live={isCurrentUser ? "assertive" : "polite"}
              >
                <div className="font-semibold mb-1">{isCurrentUser ? "You" : msg.senderName}</div>
                {
                  msg.messageType === "image" && msg.fileUrl ? (
                    <img src={msg.fileUrl} alt={msg.fileName ?? "Image"} style={{ maxWidth: 240, borderRadius: 12 }} />
                  ) : (
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  )
                }
                <div className="absolute right-4 bottom-2 text-xs text-gray-700 dark:text-yellow-100 mt-2 text-right select-none font-mono opacity-70">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  {isCurrentUser && msg.isRead && <span className="ml-2 text-blue-500 font-bold">✔✔</span>}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      {imgPreview && (
        <div className="flex flex-col items-center bg-yellow-50 border border-yellow-400 rounded-xl p-3 mb-2 max-w-xs mx-auto">
          <img src={imgPreview} alt="Preview" style={{ maxHeight: 100, borderRadius: "8px" }} />
          <div className="flex gap-2 mt-2 text-sm">
            <button type="button" disabled={sendingImg} onClick={handleImageSend} className={`bg-gradient-to-r from-yellow-500 to-yellow-700 text-white px-3 py-1 rounded shadow ${sendingImg ? "opacity-70" : ""}`}>
              {sendingImg ? "Sending..." : "Send Image"}
            </button>
            <button type="button" disabled={sendingImg} onClick={() => { setImgFile(null); setImgPreview(null); }} className="bg-gray-300 px-3 py-1 rounded shadow">Cancel</button>
          </div>
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        className="mt-3 flex gap-3 p-1 md:p-2"
        aria-label="Send message form"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={connected ? "Type your message…" : "Waiting for connection…"}
          className="flex-grow border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 resize-none focus:outline-none focus:ring-4 focus:ring-yellow-400 dark:bg-gray-800 dark:text-yellow-300 bg-opacity-90 disabled:opacity-60"
          rows={2}
          aria-label="Message input"
          spellCheck={false}
          autoComplete="off"
          disabled={!connected}
          maxLength={1500}
        />
        <input
          type="file"
          id="imageInput"
          style={{ display: "none" }}
          accept="image/*"
          onChange={handleImageInput}
          disabled={!connected}
        />
        <label htmlFor="imageInput" className="bg-yellow-300 hover:bg-yellow-400 px-3 py-2 cursor-pointer rounded font-bold flex items-center" title="Attach image">
          📷
        </label>
        <button
          type="submit"
          disabled={!input.trim() || !connected}
          className={`px-8 py-2 rounded font-semibold shadow-md transition ${
            !input.trim() || !connected
              ? "bg-yellow-200 text-white cursor-not-allowed"
              : "bg-yellow-500 hover:bg-yellow-600 text-white"
          } focus:outline-none focus:ring-4 focus:ring-yellow-400`}
          aria-label="Send message"
        >
          Send
        </button>
      </form>
      {sendError && (
        <div className="text-red-500 text-center mt-2 text-sm font-medium" role="alert">
          {sendError}
        </div>
      )}
    </div>
  );
}
