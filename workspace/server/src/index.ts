import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { setupSocketIO } from "./socket.js"; // path ho: ./socket, toh ./socket.ts

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is working!");
});
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from backend" });
});

// --- Create HTTP server and setup Socket.IO ---
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Or specify your allowed frontend origin here
    methods: ["GET", "POST"],
  },
});

// --- Actual socket setup (register all events etc) ---
setupSocketIO(io);

// --- Start HTTP+Websocket server ---
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
