import { Router } from 'express';
import mongoose from 'mongoose';
import Book from '../models/Book.js';
import { requireAuth } from '../middleware/auth.js';
import { CATEGORIES, CONDITIONS } from '../constants.js';
import { asyncHandler, escapeRegex, isValidId, serializeBook } from '../utils/helpers.js';

const router = Router();

async function listBooks(f = {}) {
  const query = {};
  if (f.q) {
    const rx = new RegExp(escapeRegex(f.q), 'i');
    query.$or = [{ title: rx }, { author: rx }];
  }
  if (f.category && CATEGORIES.includes(f.category)) query.category = f.category;
  if (f.condition && CONDITIONS.includes(f.condition)) query.condition = f.condition;
  if (f.maxPrice && Number.isFinite(f.maxPrice) && f.maxPrice > 0) {
    query.price = { $lte: Math.floor(f.maxPrice) };
  }
  if (f.sellerId && isValidId(f.sellerId)) query.sellerId = new mongoose.Types.ObjectId(f.sellerId);
  if (f.excludeId && isValidId(f.excludeId)) query._id = { $ne: new mongoose.Types.ObjectId(f.excludeId) };
  if (!f.includeSold) query.isSold = false;

  const sort =
    f.sort === 'price-asc' ? { price: 1 } : f.sort === 'price-desc' ? { price: -1 } : { createdAt: -1 };

  const docs = await Book.find(query)
    .sort(sort)
    .limit(f.limit ?? 100)
    .populate('sellerId', 'name city')
    .lean();
  return docs.map(serializeBook);
}

async function getBook(id) {
  if (!isValidId(id)) return null;
  const doc = await Book.findById(id).populate('sellerId', 'name city').lean();
  return doc ? serializeBook(doc) : null;
}

// GET /api/books  (?q, category, condition, maxPrice, sellerId, includeSold, sort, limit, excludeId)
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const q = req.query;
    const limit = Math.min(Number(q.limit) || 100, 100);
    const books = await listBooks({
      q: String(q.q ?? '').trim(),
      category: String(q.category ?? ''),
      condition: String(q.condition ?? ''),
      maxPrice: Number(q.maxPrice ?? ''),
      sellerId: String(q.sellerId ?? ''),
      excludeId: String(q.excludeId ?? ''),
      includeSold: q.includeSold === 'true',
      sort: String(q.sort ?? 'newest'),
      limit,
    });
    res.json({ books, count: books.length });
  })
);

// GET /api/books/stats  (home page counters)
router.get(
  '/stats',
  asyncHandler(async (_req, res) => {
    res.json({ totalBooks: await Book.countDocuments() });
  })
);

// GET /api/books/:id
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const book = await getBook(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.json({ book });
  })
);

// POST /api/books  (create listing)
router.post(
  '/',
  requireAuth('Please sign in to list a book'),
  asyncHandler(async (req, res) => {
    const b = req.body;
    const user = req.user;

    const title = String(b.title ?? '').trim();
    const author = String(b.author ?? '').trim();
    const category = String(b.category ?? 'Other');
    const condition = String(b.condition ?? 'Good');
    const price = Math.floor(Number(b.price ?? 0));
    const mrp = Math.floor(Number(b.mrp ?? 0)) || price;
    const description = String(b.description ?? '').trim();
    const city = String(b.city ?? '').trim() || user.city || '';
    const edition = String(b.edition ?? '').trim();
    const isbn = String(b.isbn ?? '').trim();
    const imageUrls = Array.isArray(b.imageUrls) ? b.imageUrls.map((u) => String(u ?? '')) : [];

    if (imageUrls.length !== 3 || imageUrls.some((u) => !u.trim())) {
      return res.status(400).json({ error: 'Please upload all 3 photos of the book' });
    }
    for (const url of imageUrls) {
      if (!url.startsWith('data:image/')) {
        return res.status(400).json({ error: 'Each photo must be a valid image file' });
      }
      if (url.length > 2_000_000) {
        return res.status(400).json({ error: 'Each photo must be under 2 MB — try a smaller image' });
      }
    }
    if (title.length < 2) return res.status(400).json({ error: 'Book title is required' });
    if (author.length < 2) return res.status(400).json({ error: 'Author name is required' });
    if (!CATEGORIES.includes(category)) return res.status(400).json({ error: 'Please choose a valid category' });
    if (!CONDITIONS.includes(condition)) return res.status(400).json({ error: 'Please choose a valid condition' });
    if (!Number.isFinite(price) || price <= 0) {
      return res.status(400).json({ error: 'Price must be greater than ₹0' });
    }
    if (price > 100000) return res.status(400).json({ error: 'Price looks too high — max ₹1,00,000' });

    const created = await Book.create({
      sellerId: user.id,
      title,
      author,
      category,
      condition,
      price,
      mrp: mrp >= price ? mrp : price,
      description,
      city,
      edition,
      isbn,
      imageUrls,
    });

    const book = serializeBook({
      ...created.toObject(),
      sellerId: { _id: user.id, name: user.name, city: user.city ?? '' },
    });
    res.status(201).json({ book });
  })
);

// PATCH /api/books/:id  (seller only)
router.patch(
  '/:id',
  requireAuth(),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(404).json({ error: 'Book not found' });

    const book = await Book.findById(id);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    if (String(book.sellerId) !== req.user.id) {
      return res.status(403).json({ error: 'You can only edit your own listings' });
    }

    const b = req.body;
    const updates = {};
    if (typeof b.isSold === 'boolean') updates.isSold = b.isSold;
    if (b.price !== undefined) {
      const price = Math.floor(Number(b.price));
      if (!Number.isFinite(price) || price <= 0) {
        return res.status(400).json({ error: 'Price must be greater than ₹0' });
      }
      updates.price = price;
    }
    if (typeof b.description === 'string') updates.description = b.description.trim();
    if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'Nothing to update' });

    await Book.updateOne({ _id: id, sellerId: req.user.id }, { $set: updates });
    res.json({ book: await getBook(id) });
  })
);

// DELETE /api/books/:id  (seller only, unsold only)
router.delete(
  '/:id',
  requireAuth(),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(404).json({ error: 'Book not found' });

    const book = await Book.findById(id);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    if (String(book.sellerId) !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own listings' });
    }
    if (book.isSold) return res.status(400).json({ error: 'Sold books cannot be deleted' });

    await Book.deleteOne({ _id: id, sellerId: req.user.id });
    res.json({ ok: true });
  })
);

export default router;
