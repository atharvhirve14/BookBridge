import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api, { errorMessage } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import BookCover from "@/components/BookCover";
import ConditionBadge from "@/components/ConditionBadge";
const inputClass =
  "w-full rounded-xl border border-ink/15 bg-paper px-4 py-3 text-sm text-ink outline-none focus:border-brand placeholder:text-ink-soft/60";
export default function CartPage() {
  const { items, remove, clear, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  async function handleCheckout(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    try {
      const { data } = await api.post("/orders", {
        bookIds: items.map((i) => i.bookId),
        buyerName: String(form.get("buyerName") ?? ""),
        shippingAddress: String(form.get("shippingAddress") ?? ""),
        contactPhone: String(form.get("contactPhone") ?? ""),
      });
      clear();
      navigate(`/orders/${data.order.id}`);
    } catch (err) {
      setError(errorMessage(err, "Checkout failed. Please try again."));
    } finally {
      setSubmitting(false);
    }
  }
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <p className="text-5xl">🛒</p>
        <h1 className="mt-6 font-display text-3xl font-extrabold text-ink">Your cart is empty</h1>
        <p className="mt-3 text-ink-soft">
          Browse the shelf and add some books — they&apos;re waiting for a second chapter.
        </p>
        <Link
          to="/browse"
          className="mt-8 inline-block rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Browse Books
        </Link>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink">Your Cart</h1>
      <p className="mt-2 text-ink-soft">
        {items.length} {items.length === 1 ? "book" : "books"} ready for a new home.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Items */}
        <ul className="space-y-4">
          {items.map((item) => (
            <li key={item.bookId} className="flex gap-4 rounded-2xl border border-ink/10 bg-paper p-4">
              <Link to={`/books/${item.bookId}`} className="w-20 shrink-0">
                <BookCover title={item.title} author={item.author} imageUrl={item.photo} />
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link
                      to={`/books/${item.bookId}`}
                      className="font-display font-bold text-ink hover:text-brand-dark"
                    >
                      {item.title}
                    </Link>
                    <p className="text-sm text-ink-soft">by {item.author}</p>
                  </div>
                  <span className="font-display text-lg font-extrabold text-ink">₹{item.price}</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <ConditionBadge condition={item.condition} />
                  <span className="text-xs text-ink-soft">Seller: {item.sellerName}</span>
                </div>
                <button
                  onClick={() => remove(item.bookId)}
                  className="mt-auto self-start text-xs font-semibold text-rose-600 hover:text-rose-700"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>

        {/* Checkout */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <form
            onSubmit={handleCheckout}
            className="space-y-4 rounded-2xl border border-ink/10 bg-paper p-6 shadow-sm"
          >
            <h2 className="font-display text-xl font-bold text-ink">Checkout</h2>

            <div className="flex items-center justify-between border-b border-ink/10 pb-3 text-sm">
              <span className="text-ink-soft">Subtotal</span>
              <span className="font-semibold text-ink">₹{total}</span>
            </div>
            <div className="flex items-center justify-between border-b border-ink/10 pb-3 text-sm">
              <span className="text-ink-soft">Delivery</span>
              <span className="font-semibold text-leaf">Campus meetup — Free</span>
            </div>
            <div className="flex items-center justify-between pb-1">
              <span className="font-semibold text-ink">Total</span>
              <span className="font-display text-2xl font-extrabold text-brand">₹{total}</span>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                {error}
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink" htmlFor="buyerName">
                Your Name
              </label>
              <input
                id="buyerName"
                name="buyerName"
                required
                defaultValue={user?.name ?? ""}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink" htmlFor="shippingAddress">
                Meetup / Shipping Address
              </label>
              <textarea
                id="shippingAddress"
                name="shippingAddress"
                required
                rows={3}
                minLength={10}
                placeholder="Hostel name, campus, city…"
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink" htmlFor="contactPhone">
                Contact Number
              </label>
              <input
                id="contactPhone"
                name="contactPhone"
                required
                placeholder="10-digit mobile number"
                className={inputClass}
              />
            </div>

            {!user ? (
              <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Please{" "}
                <Link to="/login?redirect=/cart" className="font-semibold underline">
                  sign in
                </Link>{" "}
                to place your order.
              </div>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-brand py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-dark disabled:opacity-60"
              >
                {submitting ? "Placing order…" : `Place Order · ₹${total}`}
              </button>
            )}
            <p className="text-center text-xs text-ink-soft">Cash or UPI on delivery · No hidden fees</p>
          </form>
        </div>
      </div>
    </div>
  );
}
