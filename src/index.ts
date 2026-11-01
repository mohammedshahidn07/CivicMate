
import 'dotenv/config';
import express from 'express';
import { McpApplicationFactory } from '@nitrostack/core';
import { AppModule } from './app.module.js';
import { registerApiRoutes } from './api/api.routes.js';

async function bootstrap() {
  const server = await McpApplicationFactory.create(AppModule);

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
  registerApiRoutes(app);

  console.log('CivicMate REST API is ready.');
}

bootstrap().catch((error) => {
  console.error('Failed to start CivicMate:', error);
  process.exit(1);
});
