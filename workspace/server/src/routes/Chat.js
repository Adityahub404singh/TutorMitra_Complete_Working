import express from "express";
import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import Tutor from "../models/Tutor.js";
import User from "../models/user.js";
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();

// Helpers
const getAuthUser = (req) => req.user;
const getUserName = (user) =>
  user?.name || user?.username || (user?.email ? user.email.split('@')[0] : 'Unknown User');

// ===== CHAT ROUTES =====

// GET ALL CHATS FOR USER
router.get("/", authenticate, async (req, res) => {
  try {
    const user = getAuthUser(req);
    if (!user?.id) return res.status(401).json({ success: false, message: "Authentication required" });

    const chats = await Chat.find({ participants: user.id })
      .populate([
        { path: 'participants', select: 'name email profileImage' },
        { path: 'lastMessage', select: 'content createdAt sender messageType fileUrl fileName' }
      ])
      .sort({ updatedAt: -1 });

    res.json({ success: true, data: chats });
  } catch (error) {
    console.error("❌ Get chats error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to fetch chats" });
  }
});

// CREATE/GET CHAT BETWEEN TWO USERS
router.post("/create", authenticate, async (req, res) => {
  try {
    const user = getAuthUser(req);
    if (!user?.id) return res.status(401).json({ success: false, message: "Authentication required" });

    const { participantId, tutorId } = req.body;
    const otherUserId = participantId || tutorId;

    if (!otherUserId) return res.status(400).json({ success: false, message: "Participant ID is required" });
    if (otherUserId === user.id) return res.status(400).json({ success: false, message: "Cannot create chat with yourself" });

    let chat = await Chat.findOne({ participants: { $all: [user.id, otherUserId] } })
      .populate([
        { path: 'participants', select: 'name email profileImage' },
        { path: 'lastMessage', select: 'content createdAt sender messageType fileUrl fileName' }
      ]);

    if (!chat) {
      chat = new Chat({
        participants: [user.id, otherUserId],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await chat.save();
      await chat.populate([
        { path: 'participants', select: 'name email profileImage' },
        { path: 'lastMessage', select: 'content createdAt sender messageType fileUrl fileName' }
      ]);
    }

    res.status(201).json({ success: true, data: chat, message: "Chat created/retrieved successfully" });
  } catch (error) {
    console.error("❌ Create chat error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to create chat" });
  }
});

// GET MESSAGES IN A CHAT (with pagination, images support)
router.get("/:chatId/messages", authenticate, async (req, res) => {
  try {
    const user = getAuthUser(req);
    if (!user?.id) return res.status(401).json({ success: false, message: "Authentication required" });

    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const chat = await Chat.findById(chatId);
    if (!chat || !chat.participants.some(p => p.equals(user.id))) {
      return res.status(403).json({ success: false, message: "Not authorized to view this chat" });
    }

    const skip = (Number(page) - 1) * Number(limit);

    const messages = await Message.find({ chat: chatId, isDeleted: false })
      .populate([
        { path: 'sender', select: 'name email profileImage' },
        { path: 'receiver', select: 'name email profileImage' }
      ])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Message.countDocuments({ chat: chatId, isDeleted: false });

    // Mark messages as read for receiver
    await Message.updateMany(
      { chat: chatId, receiver: user.id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({
      success: true,
      data: messages.reverse(), // Oldest first
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) }
    });
  } catch (error) {
    console.error("❌ Get messages error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to fetch messages" });
  }
});

// SEND MESSAGE (supporting images/files)
router.post("/:chatId/messages", authenticate, async (req, res) => {
  try {
    const user = getAuthUser(req);
    if (!user?.id) return res.status(401).json({ success: false, message: "Authentication required" });

    const { chatId } = req.params;
    const { content, messageType = 'text', fileUrl, fileName, fileSize } = req.body;

    // For text, content required. For image/file, fileUrl required.
    if (messageType === "text" && (!content || content.trim() === '')) {
      return res.status(400).json({ success: false, message: "Message content is required" });
    }
    if ((messageType === "image" || messageType === "file") && !fileUrl) {
      return res.status(400).json({ success: false, message: "File URL is required for image/file message" });
    }

    const chat = await Chat.findById(chatId);
    if (!chat || !chat.participants.some(p => p.equals(user.id))) {
      return res.status(403).json({ success: false, message: "Not authorized to send message to this chat" });
    }

    const receiverId = chat.participants.find(p => !p.equals(user.id));

    const message = new Message({
      chat: chatId,
      sender: user.id,
      receiver: receiverId,
      content: content?.trim() ?? "",
      messageType,
      fileUrl: fileUrl ?? null,
      fileName: fileName ?? null,
      fileSize: fileSize ?? null,
      isRead: false,
      createdAt: new Date()
    });

    await message.save();
    await message.populate([
      { path: 'sender', select: 'name email profileImage' },
      { path: 'receiver', select: 'name email profileImage' }
    ]);

    // Update chat
    chat.lastMessage = message._id;
    chat.updatedAt = new Date();
    await chat.save();

    res.status(201).json({ success: true, data: message, message: "Message sent successfully" });
  } catch (error) {
    console.error("❌ Send message error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to send message" });
  }
});

// GET CHAT DETAILS
router.get("/:chatId", authenticate, async (req, res) => {
  try {
    const user = getAuthUser(req);
    if (!user?.id) return res.status(401).json({ success: false, message: "Authentication required" });

    const { chatId } = req.params;
    const chat = await Chat.findById(chatId)
      .populate([
        { path: 'participants', select: 'name email profileImage' },
        { path: 'lastMessage', select: 'content createdAt sender messageType fileUrl fileName' }
      ]);

    if (!chat || !chat.participants.some(p => p._id.equals(user.id))) {
      return res.status(404).json({ success: false, message: "Chat not found or not authorized" });
    }

    res.json({ success: true, data: chat });
  } catch (error) {
    console.error("❌ Get chat details error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to fetch chat details" });
  }
});

// MARK MESSAGES AS READ
router.patch("/:chatId/mark-read", authenticate, async (req, res) => {
  try {
    const user = getAuthUser(req);
    if (!user?.id) return res.status(401).json({ success: false, message: "Authentication required" });

    const { chatId } = req.params;
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.participants.some(p => p.equals(user.id))) {
      return res.status(403).json({ success: false, message: "Not authorized to access this chat" });
    }

    const result = await Message.updateMany(
      { chat: chatId, receiver: user.id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({
      success: true,
      data: { modifiedCount: result.modifiedCount },
      message: `${result.modifiedCount} messages marked as read`
    });
  } catch (error) {
    console.error("❌ Mark messages as read error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to mark messages as read" });
  }
});

export default router;
