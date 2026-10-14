import { Link } from "react-router-dom";
import BookCover from "./BookCover";
import ConditionBadge from "./ConditionBadge";
import { CATEGORY_EMOJI } from "@/lib/catalog";
function discountPercent(price, mrp) {
  if (!mrp || mrp <= price) return null;
  return Math.round(((mrp - price) / mrp) * 100);
}
export default function BookCard({ book }) {
  const discount = discountPercent(book.price, book.mrp);
  return (
    <Link
      to={`/books/${book.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-ink/10 bg-paper transition-all duration-200 hover:-translate-y-1 hover:border-brand/40 hover:shadow-[0_16px_40px_rgba(28,25,23,0.12)]"
    >
      <div className="relative p-3 pb-0">
        <BookCover title={book.title} author={book.author} imageUrl={book.imageUrls[0] ?? null} />
        <div className="absolute right-5 top-5 flex flex-col items-end gap-1.5">
          <span className="rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
            {CATEGORY_EMOJI[book.category] ?? "📚"} {book.category}
          </span>
          {discount && (
            <span className="rounded-full bg-leaf px-2 py-0.5 text-[11px] font-bold text-white shadow-sm">
              {discount}% OFF
            </span>
          )}
        </div>
        {book.isSold && (
          <div className="absolute inset-3 grid place-items-center rounded-lg bg-ink/60 backdrop-blur-[2px]">
            <span className="rotate-[-8deg] rounded-lg border-2 border-white px-4 py-1.5 font-display text-lg font-extrabold uppercase tracking-widest text-white">
              Sold
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 font-display text-base font-bold leading-snug text-ink group-hover:text-brand-dark">
            {book.title}
          </h3>
        </div>
        <p className="mt-1 line-clamp-1 text-sm text-ink-soft">by {book.author}</p>

        <div className="mt-3 flex items-center gap-2">
          <ConditionBadge condition={book.condition} />
          {book.city && (
            <span className="inline-flex items-center gap-1 text-xs text-ink-soft">
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {book.city}
            </span>
          )}
        </div>

        <div className="mt-auto flex items-end justify-between pt-4">
          <div>
            <span className="font-display text-xl font-extrabold text-ink">₹{book.price}</span>
            {book.mrp > book.price && (
              <span className="ml-2 text-sm text-ink-soft line-through">₹{book.mrp}</span>
            )}
          </div>
          <span className="text-xs font-medium text-ink-soft">
            {book.seller ? book.seller.name.split(" ")[0] : "BookBridge"}
          </span>
        </div>
      </div>
    </Link>
  );
}
