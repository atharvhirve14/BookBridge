import mongoose from 'mongoose';

const { Schema } = mongoose;

const orderItemSchema = new Schema({
  bookId: { type: Schema.Types.ObjectId, ref: 'Book', index: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  price: { type: Number, required: true },
});

const orderSchema = new Schema(
  {
    buyerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    total: { type: Number, required: true },
    status: { type: String, required: true, default: 'Order placed' },
    buyerName: { type: String, required: true },
    shippingAddress: { type: String, required: true },
    contactPhone: { type: String, required: true },
    items: { type: [orderItemSchema], default: [] },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.models.Order || mongoose.model('Order', orderSchema);
