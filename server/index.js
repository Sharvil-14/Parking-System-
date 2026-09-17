const { connectDB } = require('./config/db');
const seedDatabase = require('./seed');
const app = require('./app');

const PORT = process.env.PORT || 5000;

// Boot server & seed sample data (local development only)
const startServer = async () => {
  await connectDB();
  await seedDatabase();
  app.listen(PORT, () => {
    console.log(`[VPMS Server] Listening on http://localhost:${PORT}`);
  });
};

startServer();
