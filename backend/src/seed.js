// Seeds the database with the demo user.  Usage: npm run seed
import 'dotenv/config';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from './models/User.js';
import Book from './models/Book.js';
import Order from './models/Order.js';
import { connectDB } from './config/db.js';

const DEMO_USERS = [{ name: 'Pranav Jagdale', email: 'student@gmail.com', city: 'Kolhapur' }];

export async function seedDatabase() {
  await Promise.all([Order.deleteMany({}), Book.deleteMany({}), User.deleteMany({})]);
  await User.init(); // make sure the unique email index exists
  const passwordHash = await bcrypt.hash('password123', 10);
  await User.insertMany(DEMO_USERS.map((u) => ({ ...u, passwordHash })));
  console.log(`Seeded ${DEMO_USERS.length} demo user(s).`);
  console.log('Book listings start empty — add them via the Sell page.');
  console.log('Demo login: student@gmail.com / password123');
}

/** Non-destructive: only creates the demo account when the database has no users yet. */
export async function ensureDemoUser() {
  if ((await User.countDocuments()) > 0) return;
  await User.init();
  const passwordHash = await bcrypt.hash('password123', 10);
  await User.insertMany(DEMO_USERS.map((u) => ({ ...u, passwordHash })));
  console.log('Created demo account: student@gmail.com / password123');
}

// Run directly: `node src/seed.js`
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  connectDB()
    .then(async ({ embedded }) => {
      if (embedded) console.warn('Note: no real MongoDB found — seeded the temporary embedded one only.');
      await seedDatabase();
    })
    .catch((err) => {
      console.error('Seeding failed. Is MongoDB running?\n', err.message);
      process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
}
