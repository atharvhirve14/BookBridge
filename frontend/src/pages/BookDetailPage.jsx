import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import BookGallery from "@/components/BookGallery";
import BookCard from "@/components/BookCard";
import ConditionBadge from "@/components/ConditionBadge";
import BookActions from "@/components/BookActions";
import { CATEGORY_EMOJI } from "@/lib/catalog";
export default function BookDetailPage() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [related, setRelated] = useState([]);
  const [status, setStatus] = useState("loading");
  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    api
      .get(`/books/${id}`)
      .then(async (res) => {
        if (cancelled) return;
        const b = res.data.book;
        setBook(b);
        setStatus("ready");
        document.title = `${b.title} — BookBridge`;
        window.scrollTo(0, 0);
        const rel = await api.get("/books", { params: { category: b.category, excludeId: b.id, limit: 4 } });
        if (!cancelled) setRelated(rel.data.books ?? []);
      })
      .catch((err) => {
        if (cancelled) return;
        setStatus(err?.response?.status === 404 ? "missing" : "error");
      });
    return () => {
      cancelled = true;
    };
  }, [id]);
  if (status === "loading") {
    return <div className="mx-auto max-w-7xl px-4 py-20 text-center text-ink-soft sm:px-6">Loading…</div>;
  }
  if (status !== "ready" || !book) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <p className="text-5xl">📕</p>
        <h1 className="mt-6 font-display text-3xl font-extrabold text-ink">
          {status === "missing" ? "Book not found" : "Could not load this book"}
        </h1>
        <p className="mt-3 text-ink-soft">It may have been removed, or the server is not reachable.</p>
        <Link
          to="/browse"
          className="mt-8 inline-block rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Browse Books
        </Link>
      </div>
    );
  }
  const seller = book.seller;
  const discount = book.mrp > book.price ? Math.round(((book.mrp - book.price) / book.mrp) * 100) : null;
  const listedDate = new Date(book.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const details = [
    { label: "Category", value: `${CATEGORY_EMOJI[book.category] ?? "📚"} ${book.category}` },
    { label: "Condition", value: book.condition },
    { label: "Edition", value: book.edition || "—" },
    { label: "ISBN", value: book.isbn || "—" },
    { label: "Location", value: book.city || "—" },
    { label: "Listed on", value: listedDate },
  ];
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <nav className="mb-6 flex items-center gap-2 text-sm text-ink-soft">
        <Link to="/" className="hover:text-brand">
          Home
        </Link>
        <span>/</span>
        <Link to="/browse" className="hover:text-brand">
          Browse
        </Link>
        <span>/</span>
        <Link to={`/browse?category=${encodeURIComponent(book.category)}`} className="hover:text-brand">
          {book.category}
        </Link>
        <span>/</span>
        <span className="line-clamp-1 text-ink">{book.title}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[380px_1fr]">
        {/* Photo gallery */}
        <div>
          <BookGallery
            title={book.title}
            author={book.author}
            imageUrls={book.imageUrls}
            isSold={book.isSold}
          />
          <div className="mt-4 flex items-center justify-center gap-3 rounded-xl border border-ink/10 bg-paper p-3 text-xs text-ink-soft">
            <span className="inline-flex items-center gap-1.5 font-semibold text-leaf">
              ✓ Verified listing
            </span>
            <span className="h-3 w-px bg-ink/15" />
            <span>Safe campus meetup</span>
          </div>
        </div>

        {/* Info */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand-dark">
              {CATEGORY_EMOJI[book.category] ?? "📚"} {book.category}
            </span>
            <ConditionBadge condition={book.condition} />
            {discount && (
              <span className="rounded-full bg-leaf px-3 py-1 text-xs font-bold text-white">
                {discount}% OFF
              </span>
            )}
          </div>

          <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight tracking-tight text-ink">
            {book.title}
          </h1>
          <p className="mt-2 text-lg text-ink-soft">by {book.author}</p>

          <div className="mt-6 flex items-end gap-3">
            <span className="font-display text-4xl font-extrabold text-ink">₹{book.price}</span>
            {book.mrp > book.price && (
              <>
                <span className="text-lg text-ink-soft line-through">₹{book.mrp}</span>
                <span className="text-sm font-semibold text-leaf">Save ₹{book.mrp - book.price}</span>
              </>
            )}
          </div>

          {book.description && (
            <div className="mt-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-soft">Description</h2>
              <p className="mt-2 leading-relaxed text-ink">{book.description}</p>
            </div>
          )}

          <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 rounded-2xl border border-ink/10 bg-paper p-5 sm:grid-cols-3">
            {details.map((d) => (
              <div key={d.label}>
                <dt className="text-xs font-semibold uppercase tracking-wider text-ink-soft">{d.label}</dt>
                <dd className="mt-1 font-medium text-ink">{d.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 rounded-2xl border border-ink/10 bg-paper p-5">
            <BookActions
              book={{
                id: book.id,
                title: book.title,
                author: book.author,
                price: book.price,
                category: book.category,
                condition: book.condition,
                city: book.city,
                sellerName: seller?.name ?? "BookBridge user",
                imageUrls: book.imageUrls,
                isSold: book.isSold,
              }}
            />
          </div>

          {seller && (
            <div className="mt-6 flex items-center gap-4 rounded-2xl border border-ink/10 bg-paper p-5">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-brand/15 font-display text-lg font-bold text-brand-dark">
                {seller.name.charAt(0).toUpperCase()}
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">Sold by {seller.name}</p>
                <p className="text-sm text-ink-soft">{seller.city || "BookBridge seller"}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink">
            More in {book.category}
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
