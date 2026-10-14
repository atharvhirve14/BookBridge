import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import bookRoutes from './routes/books.js';
import orderRoutes from './routes/orders.js';
import { seedDatabase, ensureDemoUser } from './seed.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
// Book photos are sent as base64 data URLs (3 per listing), so allow larger JSON bodies.
app.use(express.json({ limit: '12mb' }));

app.get('/api/health', async (_req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    res.json({ ok: true });
  } catch {
    res.status(500).json({ ok: false });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/orders', orderRoutes);

app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Photos are too large — try smaller images' });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid request body' });
  }
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

async function start() {
  const { embedded } = await connectDB();
  // A fresh database (embedded or newly created) gets the demo account automatically.
  if (embedded) await seedDatabase();
  else await ensureDemoUser();
  app.listen(PORT, () => {
    console.log(`BookBridge API running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
