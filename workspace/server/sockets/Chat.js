const socketio = require("socket.io");

const setupChat = (server) => {
  const io = socketio(server, { cors: { origin: "*" } });

  io.on("connection", (socket) => {
    console.log("New client connected", socket.id);

    socket.on("joinRoom", (room) => {
      socket.join(room);
    });

    socket.on("sendMessage", ({ room, message }) => {
      io.to(room).emit("receiveMessage", message);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected", socket.id);
    });
  });

  return io;
};

module.exports = setupChat;
