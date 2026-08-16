import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { createApp } from './app';
import { connectDB } from './config/db';

// Load environment variables
dotenv.config();

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = '0.0.0.0';

export async function startServer() {
  // Initialize Database Connection
  await connectDB();

  // Initialize Express App
  const app = createApp();

  // Vite middleware for development / static serving in production
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

  const server = app.listen(PORT, HOST, () => {
    console.log(`\n🚀 [CasaAura] Server listening at http://${HOST}:${PORT}`);
    console.log(`🌐 [CasaAura] Health Endpoint: http://${HOST}:${PORT}/api/health\n`);
  });

  return { app, server };
}

// Auto-run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer().catch((err) => {
    console.error('❌ [CasaAura] Server startup failure:', err);
    process.exit(1);
  });
}
