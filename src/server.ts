import app from './app.js';
import { config, prisma } from './config/index.js';

const server = app.listen(config.port, () => {
  console.log(`running on port ${config.port} in ${config.nodeEnv} mode`);
  console.log(`API endpoint: http://localhost:${config.port}/api`);
});

const gracefulShutdown = async () => {
  console.log('Stopping server...');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('Database connection closed. Process terminated.');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
