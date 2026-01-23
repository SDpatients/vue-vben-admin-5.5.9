import path from 'node:path';

// Simple script to start Vite dev server directly using ES modules
import { createServer } from 'vite';

async function main() {
  console.log('Starting Vite dev server...');

  try {
    // Create Vite server with minimal configuration
    const server = await createServer({
      root: path.join(process.cwd(), 'apps', 'web-ele'),
      mode: 'development',
      server: {
        port: 3100,
        open: true,
      },
    });

    await server.listen();
    console.log('✅ Vite server started successfully!');
    console.log(
      '🌐 Server URL:',
      `http://192.168.0.120:${server.config.server.port}`,
    );

    // Keep the process running
    process.on('SIGINT', () => {
      console.log('\n📤 Shutting down server...');
      server.close();
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

main();
