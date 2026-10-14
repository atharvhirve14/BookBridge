export function isValidId(id) {
  return typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);
}

export function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export function publicUser(doc) {
  return {
    id: String(doc._id ?? doc.id),
    name: doc.name,
    email: doc.email,
    city: doc.city ?? '',
    createdAt: new Date(doc.createdAt).toISOString(),
  };
}

/** Convert a (lean, optionally seller-populated) book document into the API shape. */
export function serializeBook(doc) {
  const populated = doc.sellerId && typeof doc.sellerId === 'object' && 'name' in doc.sellerId;
  return {
    id: String(doc._id),
    title: doc.title,
    author: doc.author,
    category: doc.category,
    condition: doc.condition,
    price: doc.price,
    mrp: doc.mrp,
    description: doc.description ?? '',
    city: doc.city ?? '',
    edition: doc.edition ?? '',
    isbn: doc.isbn ?? '',
    imageUrls: doc.imageUrls ?? [],
    isSold: doc.isSold,
    createdAt: new Date(doc.createdAt).toISOString(),
    seller: populated
      ? {
          id: String(doc.sellerId._id),
          name: doc.sellerId.name ?? 'BookBridge user',
          city: doc.sellerId.city ?? '',
        }
      : null,
  };
}

export function serializeOrder(doc) {
  return {
    id: String(doc._id),
    total: doc.total,
    status: doc.status,
    buyerName: doc.buyerName,
    shippingAddress: doc.shippingAddress,
    contactPhone: doc.contactPhone,
    createdAt: new Date(doc.createdAt).toISOString(),
    items: (doc.items ?? []).map((item) => ({
      id: String(item._id),
      title: item.title,
      author: item.author,
      price: item.price,
    })),
  };
}
