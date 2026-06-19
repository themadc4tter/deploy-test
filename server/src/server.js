import cors from "cors";
import express from "express";
import { initializeDatabase } from "./db.js";
import todosRouter from "./routes/todos.js";

// Create the Express application.
// Think of this as the main server object that receives HTTP requests.
const app = express();

// Deployment platforms often provide the port through an environment variable.
// Locally, we fall back to 3001 so it does not conflict with the React app.
const PORT = process.env.PORT || 3001;

// Allow requests from other local development servers, such as the React app.
// Without CORS, browsers block many front-end-to-back-end requests.
app.use(cors());

// Teach Express how to read JSON request bodies.
// Later, this lets us receive data like { "title": "Book dentist" }.
app.use(express.json());

// A simple test route.
// We use this before building real features to prove the server is running.
app.get("/api/health", (request, response) => {
  response.json({
    status: "ok"
  });
});

// Mount all to-do routes under /api/todos.
// For example, router.get("/") becomes GET /api/todos.
app.use("/api/todos", todosRouter);

async function startServer() {
  // Prepare the SQLite database before the API starts accepting requests.
  // This makes sure tables exist before future routes try to read or write data.
  await initializeDatabase();

  // Start the server and listen for incoming requests.
  app.listen(PORT, () => {
    console.log(`API server is running at http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start the API server:", error);
  process.exit(1);
});
