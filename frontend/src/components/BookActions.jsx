import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
export default function BookActions({ book }) {
  const { add } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);
  function addToCart() {
    add({
      bookId: book.id,
      title: book.title,
      author: book.author,
      price: book.price,
      category: book.category,
      condition: book.condition,
      city: book.city,
      sellerName: book.sellerName,
      photo: book.imageUrls[0] ?? null,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2200);
  }
  function buyNow() {
    addToCart();
    navigate("/cart");
  }
  if (book.isSold) {
    return (
      <div className="rounded-xl border border-ink/10 bg-ink/5 px-5 py-4 text-sm font-semibold text-ink-soft">
        This book has been sold.{" "}
        <button onClick={() => navigate("/browse")} className="text-brand underline">
          Browse similar books
        </button>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <button
        onClick={buyNow}
        className="flex-1 rounded-xl bg-brand px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-dark hover:shadow-md"
      >
        Buy Now · ₹{book.price}
      </button>
      <button
        onClick={addToCart}
        className="flex-1 rounded-xl border border-ink/20 bg-paper px-6 py-3.5 text-sm font-semibold text-ink transition-colors hover:border-brand hover:text-brand"
      >
        {added ? "✓ Added to Cart" : "Add to Cart"}
      </button>
      {!user && (
        <p className="w-full text-xs text-ink-soft sm:w-auto sm:self-center">
          You&apos;ll be asked to sign in at checkout.
        </p>
      )}
    </div>
  );
}
