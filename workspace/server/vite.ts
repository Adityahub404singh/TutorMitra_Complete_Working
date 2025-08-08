import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import { createServer as createViteServer, type ViteDevServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function setUpVite(app: express.Express) {
  

  const viteServer: ViteDevServer = await createViteServer({
    root: path.resolve(__dirname, "../client"),
    server: { middlewareMode: "html" },
    appType: "custom",
  });

  app.use(viteServer.middlewares);

  app.use("*", async (req, res, next) => {
    try {
      const url = req.originalUrl;
      let template = fs.readFileSync(
        path.resolve(__dirname, "../client/index.html"),
        "utf-8"
      );
      template = await viteServer.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(template);
    } catch (e) {
      viteServer.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export { ViteDevServer };
