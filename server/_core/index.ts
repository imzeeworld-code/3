import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);

  // GitHub Proxy API to handle CORS and multi-file pushes
  app.post("/api/github/proxy", async (req, res) => {
    try {
      const { token, endpoint, method, body } = req.body;
      
      if (!token || !endpoint) {
        return res.status(400).json({ error: "Token and endpoint are required" });
      }

      const response = await fetch(`https://api.github.com${endpoint}`, {
        method: method || 'GET',
        headers: {
          'Authorization': `Bearer ${token.trim()}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'Web-Coding-AIDE',
        },
        body: body ? JSON.stringify(body) : undefined
      });

      const data = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        return res.status(response.status).json({ error: data.message || "GitHub API error", details: data });
      }

      res.json(data);
    } catch (error) {
      console.error("GitHub proxy error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Legacy push endpoint for backward compatibility
  app.post("/api/github/push", async (req, res) => {
    try {
      const { token, repoName, content, message } = req.body;
      const response = await fetch(`https://api.github.com/repos/${repoName}/contents/index.html`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token.trim()}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'Web-Coding-AIDE',
        },
        body: JSON.stringify({
          message: message || 'Update via Web Coding AIDE',
          content: Buffer.from(content || '').toString('base64'),
          branch: 'main'
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) return res.status(response.status).json({ error: data.message || "GitHub API error" });
      res.json({ success: true, url: data.content?.html_url || `https://github.com/${repoName}` });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
