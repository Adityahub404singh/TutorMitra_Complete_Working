import { Server, Socket } from "socket.io";
import MessageModel from "./models/Message.js"; // Adjust path if needed

export interface Message {
  _id: string;
  senderId: string;
  senderName: string;
  receiverId?: string;
  content: string;
  timestamp: string;
  roomId?: string;
  messageType?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  isRead?: boolean;
  isDelivered?: boolean;
}
export interface NotificationPayload {
  type: string;
  title: string;
  message: string;
  bookingId?: string;
  [key: string]: any;
}

// Only sockets in memory
const userSockets: Record<string, string> = {};

export function setupSocketIO(io: Server) {
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token;
    if (token) next();
    else next(new Error("Authentication error"));
  });

  io.on("connection", (socket: Socket) => {
    console.log(`[SOCKET] User connected: ${socket.id}`);

    socket.on("register", (userId: string) => {
      userSockets[userId] = socket.id;
      console.log(`[SOCKET] Registered user ${userId} to socket ${socket.id}`);
    });

    socket.on("joinRoom", (roomId: string) => {
      if (typeof roomId === "string" && roomId.trim().length > 0) {
        socket.join(roomId);
        console.log(`[SOCKET] Socket ${socket.id} joined room ${roomId}`);
      } else {
        console.error("[SOCKET] Tried to join room with blank/invalid roomId.");
      }
    });

    // Save & emit message
    socket.on("sendMessage", async (msg: Message, ack?: (response: { success: boolean; error?: string }) => void) => {
      const roomId = typeof msg.roomId === "string" ? msg.roomId.trim() : "";
      if (!roomId) {
        if (ack) ack({ success: false, error: "roomId is required, received blank" });
        return;
      }
      try {
        const newMessage = new MessageModel({
          chat: roomId,
          sender: msg.senderId,
          senderName: msg.senderName,
          receiver: msg.receiverId,
          content: msg.content,
          messageType: msg.messageType,
          fileUrl: msg.fileUrl,
          fileName: msg.fileName,
          fileSize: msg.fileSize,
          isDelivered: true,
          timestamp: new Date(),
        });
        await newMessage.save();
        io.to(roomId).emit("chatMessage", {
          ...newMessage.toObject(),
          senderId: newMessage.sender?.toString?.() || "",
          receiverId: newMessage.receiver?.toString?.() || "",
          roomId: newMessage.chat,
        });
        if (ack) ack({ success: true });
      } catch (error) {
        console.error("[SOCKET] SendMessage error:", error);
        if (ack) ack({ success: false, error: (error as Error).message });
      }
    });

    // Get chat room history for frontend Message[] type
    socket.on("getHistory", async (roomId: string, callback: (messages: Message[]) => void) => {
      if (!roomId || typeof roomId !== "string" || roomId.trim().length === 0) {
        callback([]);
        return;
      }
      try {
        const rawMsgs = await MessageModel.find({ chat: roomId }).sort({ timestamp: 1 }).lean();
        const messages: Message[] = rawMsgs.map(msg => ({
          ...(msg as any),
          senderId: msg.sender?.toString?.() || "",
          receiverId: msg.receiver?.toString?.() || "",
          roomId: msg.chat,
        }));
        callback(messages);
      } catch (error) {
        console.error("[SOCKET] GetHistory error:", error);
        callback([]);
      }
    });

    // Blue tick/read status — DB update
    socket.on("markAsRead", async (msgId: string, roomId: string) => {
      if (!msgId || !roomId) return;
      try {
        await MessageModel.updateOne(
          { _id: msgId, chat: roomId },
          { $set: { isRead: true, readAt: new Date() } }
        );
        io.to(roomId).emit("messageSeen", msgId);
      } catch (error) {
        console.error("[SOCKET] markAsRead error:", error);
      }
    });

    // Tutor requests/history — DB-based
    socket.on("getChatRequestsForTutor", async (tutorId: string, callback: (requests: any[]) => void) => {
      try {
        const rawMsgs = await MessageModel.find({ receiver: tutorId }).sort({ createdAt: -1 }).lean();
        const seen: Record<string, boolean> = {};
        const requests: any[] = [];
        for (const msg of rawMsgs) {
          const senderId = msg.sender?.toString?.() || "";
          if (!senderId) continue;
          if (!seen[senderId]) {
            requests.push({
              id: msg.chat,
              studentId: senderId,
              studentName: msg.senderName,
              message: msg.content,
              time: msg.timestamp,
            });
            seen[senderId] = true;
          }
        }
        callback(requests);
      } catch (error) {
        console.error("[SOCKET] getChatRequestsForTutor error:", error);
        callback([]);
      }
    });

    socket.on("disconnect", () => {
      for (const key in userSockets) {
        if (userSockets[key] === socket.id) {
          delete userSockets[key];
          console.log(`[SOCKET] User disconnected: ${key}`);
          break;
        }
      }
      console.log(`[SOCKET] Socket disconnected: ${socket.id}`);
    });
  });
}

export function sendRealtimeNotification(io: Server, userId: string, notification: NotificationPayload) {
  const socketId = userSockets[userId];
  if (socketId) {
    io.to(socketId).emit("notification", notification);
  }
}
