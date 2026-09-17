const { connectDB } = require('../config/db');
const seedDatabase = require('../seed');
const app = require('../app');

// Track initialization so we only connect + seed once per cold start
let isInitialized = false;

const initialize = async () => {
  if (isInitialized) return;
  await connectDB();
  await seedDatabase();
  isInitialized = true;
};

// Vercel serverless handler — runs `initialize()` on cold start, then
// delegates every request to the Express app.
module.exports = async (req, res) => {
  await initialize();
  return app(req, res);
};
