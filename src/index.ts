
import 'dotenv/config';
import express from 'express';
import { McpApplicationFactory } from '@nitrostack/core';
import { AppModule } from './app.module.js';
import { registerApiRoutes } from './api/api.routes.js';

async function bootstrap() {
  const server = await McpApplicationFactory.create(AppModule);

  console.log(
  '[BOOT DIAGNOSTIC]',
  'PORT =', process.env.PORT,
  'ARGV =', process.argv.slice(2)
  );
  const port = Number(process.env.PORT || 3000);

  await server.start({
    transport: 'dual',
    port,
    host: '0.0.0.0',
    endpoint: '/mcp',
  });

  const app = server.getHttpTransport()?.getApp?.();

  if (!app) {
    throw new Error('NitroStack HTTP Express app is unavailable.');
  }

  app.use(express.json());

  // Root health-check endpoint
  app.get('/', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      application: 'CivicMate',
    });
  });

  // Register CivicMate REST API routes
  registerApiRoutes(app);

  console.log('CivicMate REST API routes registered.');
  console.log(`CivicMate REST API is ready on port ${port}.`);
}

bootstrap().catch((error) => {
  console.error('Failed to start CivicMate:', error);
  process.exit(1);
});
