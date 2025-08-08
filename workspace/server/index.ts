import express from "express";
import { fileURLToPath } from "url";
import path from "path";
import { setUpVite } from "./vite";
import { registerRoutes } from "./routes";

const __filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(__filename);

async function startServer() { 
  try{ 
  console.log("starting server...");
  const app = express();
  

  registerRoutes(app); // API routes

  await setUpVite(app); // Vite middleware

  app.get("/api/test", (req, res) => {
    res.send("API is working");
  });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
} catch (err){ console.error("Server started error:",err);

}
}
startServer();