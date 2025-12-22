import { createServer } from 'vite';
import { resolve } from 'path';

async function startDevServer() {
  try {
    // Create Vite server using the web-ele config
    const server = await createServer({
      configFile: resolve('./apps/web-ele/vite.config.mts'),
      mode: 'development'
    });

    // Start the server
    await server.listen();
    console.log('🚀 Vite development server started successfully!');
    console.log('Access the application at:', server.config.server.port || 3000);
  } catch (error) {
    console.error('❌ Failed to start Vite server:', error);
    process.exit(1);
  }
}

startDevServer();
