import 'dotenv/config';
import { McpApplicationFactory } from '@nitrostack/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const server = await McpApplicationFactory.create(AppModule);

  const port = Number(process.env.PORT || 3000);

  await server.start({
    transport: 'dual',
    port,
    host: '0.0.0.0',
    endpoint: '/mcp',
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start CivicMate:', error);
  process.exit(1);
});