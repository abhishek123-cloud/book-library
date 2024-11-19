import { Server, Socket } from "socket.io";
import http from "http";

let io: Server; // Socket.IO instance

// Initialize Socket.IO and set up connection handlers
export const initializeSocket = (server: http.Server) => {
  io = new Server(server, {
    cors: {
      origin: "*", // Allow all origins (replace with specific domains in production)
      methods: ["GET", "POST"], // Allowed HTTP methods
      allowedHeaders: ["Content-Type"], // Allowed headers
      credentials: true, // Allow credentials
    },
  });

  console.log("Socket.IO server initialized");

  // Handle WebSocket connections
  io.on("connection", (socket: Socket) => {
    console.log("Client connected:", socket.id);

    // Handle custom events
    socket.on("newBook", (data) => {
      console.log("Received new book event:", data);

      // Broadcast to other connected clients
      socket.broadcast.emit("newBook", data);
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
};

// Function to broadcast a new book event to all connected clients
export const broadcastNewBook = (bookData: any) => {
  if (io) {
    io.emit("newBook", bookData); // Emit to all clients
  }
};