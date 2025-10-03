import * as vite from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function setUpVite(app: any) {
  try {
    const server = await vite.createServer({
      root: path.resolve(__dirname, '../client'),
      server: { middlewareMode: true },
      appType: 'spa'
    });

    app.use(server.middlewares);

    app.use('*', async (req: any, res: any) => {
      try {
        const template = await fs.readFile(
          path.resolve(__dirname, '../client/index.html'),
          'utf-8'
        );
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        // In src/vite.ts
if (server.ssrFixStacktrace && e instanceof Error) {
  server.ssrFixStacktrace(e);
}
        res.status(500).end('Internal Server Error');
      }
    });
  } catch (err) {
    console.error('Vite server failed to start:', err);
    process.exit(1);
  }
}