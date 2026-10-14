import mongoose from 'mongoose';

const { Schema } = mongoose;

const bookSchema = new Schema(
  {
    sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, index: true },
    author: { type: String, required: true, trim: true },
    category: { type: String, required: true, default: 'Other', index: true },
    condition: { type: String, required: true, default: 'Good' },
    price: { type: Number, required: true },
    mrp: { type: Number, required: true, default: 0 },
    description: { type: String, default: '' },
    city: { type: String, default: '' },
    edition: { type: String, default: '' },
    isbn: { type: String, default: '' },
    imageUrls: { type: [String], default: [] },
    isSold: { type: Boolean, default: false, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.models.Book || mongoose.model('Book', bookSchema);
