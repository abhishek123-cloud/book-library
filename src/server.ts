import express from "express";
import connectDB from "./config/db"; // Database connection logic
import bookRoutes from "./routes/bookRoutes";
import http from "http";
import { requestLogger } from "./middleware/requestLogger";
import { fetchAndAggregateData } from "./utils/commonUtility";
import cors from "cors"; // Import cors
import { initializeSocket } from "./socket/socket"; // Import socket logic

const app = express();

// Apply CORS middleware globally (for HTTP requests)
app.use(cors());

// Middleware: Request logging
app.use(requestLogger);

// Middleware: Parse JSON
app.use(express.json());

// Connect to the database
connectDB();

// Routes
app.use("/api", bookRoutes);

// Create the HTTP server to attach Socket.IO
const server = http.createServer(app);

// Initialize Socket.IO
initializeSocket(server);

// Run the fetch and aggregate data function
(async () => {
  try {
    const data = await fetchAndAggregateData();
    console.log('Aggregated Data:', JSON.stringify(data, null, 2));
  } catch (error: any) {
    console.error("Error:", error.message);
  }
})();

// Set the port for the server
const PORT = process.env.PORT || 4000;

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Default export app
export default app;