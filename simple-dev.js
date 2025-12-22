// Simple script to start Vite dev server directly
const { createServer } = require('vite');
const path = require('path');

async function main() {
  console.log('Starting Vite dev server...');
  
  try {
    // Create Vite server with minimal configuration
    const server = await createServer({
      root: path.join(__dirname, 'apps', 'web-ele'),
      mode: 'development',
      server: {
        port: 3100,
        open: true
      }
    });
    
    await server.listen();
    console.log('✅ Vite server started successfully!');
    console.log('🌐 Server URL:', server.config.server.port);
    
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
