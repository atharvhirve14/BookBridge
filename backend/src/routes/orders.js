import { Router } from 'express';
import Book from '../models/Book.js';
import Order from '../models/Order.js';
import { requireAuth } from '../middleware/auth.js';
import { ORDER_STATUSES } from '../constants.js';
import { asyncHandler, isValidId, serializeOrder } from '../utils/helpers.js';

const router = Router();

const isSellerOfOrder = async (order, userId) => {
  const bookIds = order.items.map((i) => i.bookId).filter(Boolean);
  return bookIds.length > 0 && (await Book.exists({ _id: { $in: bookIds }, sellerId: userId })) !== null;
};

// GET /api/orders  (?role=seller for orders containing my books)
router.get(
  '/',
  requireAuth(),
  asyncHandler(async (req, res) => {
    let docs;
    if (req.query.role === 'seller') {
      const myBooks = await Book.find({ sellerId: req.user.id }).select('_id').lean();
      docs = await Order.find({ 'items.bookId': { $in: myBooks.map((b) => b._id) } })
        .sort({ createdAt: -1 })
        .lean();
    } else {
      docs = await Order.find({ buyerId: req.user.id }).sort({ createdAt: -1 }).lean();
    }
    res.json({ orders: docs.map(serializeOrder) });
  })
);

// GET /api/orders/:id  (buyer only) – also reports whether the viewer is a seller in the order
router.get(
  '/:id',
  requireAuth(),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(404).json({ error: 'Order not found' });
    const order = await Order.findById(id).lean();
    if (!order || String(order.buyerId) !== req.user.id) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ order: serializeOrder(order), isSeller: await isSellerOfOrder(order, req.user.id) });
  })
);

// POST /api/orders  (checkout)
router.post(
  '/',
  requireAuth('Please sign in to place an order'),
  asyncHandler(async (req, res) => {
    const user = req.user;
    const b = req.body;

    const bookIds = Array.isArray(b.bookIds) ? b.bookIds.map((n) => String(n)).filter(isValidId) : [];
    const buyerName = String(b.buyerName ?? '').trim() || user.name;
    const shippingAddress = String(b.shippingAddress ?? '').trim();
    const contactPhone = String(b.contactPhone ?? '').trim();

    if (bookIds.length === 0) return res.status(400).json({ error: 'Your cart is empty' });
    if (shippingAddress.length < 10) {
      return res.status(400).json({ error: 'Please provide a complete shipping address' });
    }
    if (!/^[0-9+\-\s()]{10,15}$/.test(contactPhone)) {
      return res.status(400).json({ error: 'Please provide a valid contact number' });
    }

    const uniqueIds = [...new Set(bookIds)];
    const found = await Book.find({ _id: { $in: uniqueIds } }).lean();
    if (found.length !== uniqueIds.length) {
      return res.status(409).json({ error: 'Some books are no longer available' });
    }
    const sold = found.find((x) => x.isSold);
    if (sold) return res.status(409).json({ error: `"${sold.title}" was just sold to someone else` });
    const own = found.find((x) => String(x.sellerId) === user.id);
    if (own) return res.status(400).json({ error: `You cannot buy your own listing "${own.title}"` });

    // A standalone MongoDB has no multi-document transactions, so reserve each book
    // atomically (only while it is still unsold) and roll back if any of them fails.
    const reserved = [];
    for (const book of found) {
      const r = await Book.updateOne({ _id: book._id, isSold: false }, { $set: { isSold: true } });
      if (r.modifiedCount !== 1) {
        if (reserved.length > 0) await Book.updateMany({ _id: { $in: reserved } }, { $set: { isSold: false } });
        return res.status(409).json({ error: `"${book.title}" was just sold to someone else` });
      }
      reserved.push(book._id);
    }

    try {
      const created = await Order.create({
        buyerId: user.id,
        total: found.reduce((sum, x) => sum + x.price, 0),
        status: 'Order placed',
        buyerName,
        shippingAddress,
        contactPhone,
        items: found.map((x) => ({ bookId: x._id, title: x.title, author: x.author, price: x.price })),
      });
      res.status(201).json({ order: serializeOrder(created.toObject()) });
    } catch {
      await Book.updateMany({ _id: { $in: reserved } }, { $set: { isSold: false } });
      res.status(500).json({ error: 'Could not place the order. Please try again.' });
    }
  })
);

// PATCH /api/orders/:id  (buyer or a seller in the order updates delivery status)
router.patch(
  '/:id',
  requireAuth(),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(404).json({ error: 'Order not found' });

    const status = String(req.body.status ?? '');
    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${ORDER_STATUSES.join(', ')}` });
    }

    const order = await Order.findById(id).lean();
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const isBuyer = String(order.buyerId) === req.user.id;
    if (!isBuyer && !(await isSellerOfOrder(order, req.user.id))) {
      return res.status(403).json({ error: 'You can only update your own orders' });
    }
    if (order.status === status) return res.json({ order: serializeOrder(order) });

    const updated = await Order.findByIdAndUpdate(id, { $set: { status } }, { new: true }).lean();
    res.json({ order: serializeOrder(updated) });
  })
);

export default router;
