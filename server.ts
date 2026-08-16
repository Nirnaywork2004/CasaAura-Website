import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { createApp } from './server/app';
import { connectDB } from './server/config/db';

dotenv.config();

const PORT = 3000;
const HOST = '0.0.0.0';

async function bootstrap() {
  // Connect to Database
  await connectDB();

  // Create Express App configured with CORS, JSON parsing, and /api routes
  const app = createApp();

  // Vite middleware in dev / Static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`\n✨ CasaAura full-stack server running on http://${HOST}:${PORT}`);
    console.log(`🔍 Health check: http://${HOST}:${PORT}/api/health\n`);
  });
}

bootstrap().catch((error) => {
  console.error('Fatal startup error:', error);
  process.exit(1);
});
