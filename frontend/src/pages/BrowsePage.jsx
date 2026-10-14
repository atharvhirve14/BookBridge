import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "@/lib/api";
import BookCard from "@/components/BookCard";
import FilterBar from "@/components/FilterBar";
export default function BrowsePage() {
  const [searchParams] = useSearchParams();
  const q = (searchParams.get("q") ?? "").trim();
  const category = searchParams.get("category") ?? "";
  const condition = searchParams.get("condition") ?? "";
  const maxPrice = Number(searchParams.get("maxPrice") ?? "");
  const sort = searchParams.get("sort") || "newest";
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    document.title = "Browse Books | BookBridge";
    let cancelled = false;
    setLoading(true);
    api
      .get("/books", {
        params: {
          q,
          category,
          condition,
          sort,
          ...(Number.isFinite(maxPrice) && maxPrice > 0 ? { maxPrice } : {}),
        },
      })
      .then((res) => {
        if (cancelled) return;
        setResults(res.data.books ?? []);
        setError("");
      })
      .catch(() => !cancelled && setError("Could not load books. Is the server running?"))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [q, category, condition, maxPrice, sort]);
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink">Browse Books</h1>
        <p className="mt-2 text-ink-soft">
          Every listing is checked by our student community. Find your next read at up to 80% off MRP.
        </p>
      </div>

      <FilterBar resultCount={results.length} />

      {loading ? (
        <p className="mt-8 text-center text-ink-soft">Loading books…</p>
      ) : error ? (
        <p className="mt-8 rounded-xl bg-rose-50 px-4 py-3 text-center text-sm font-medium text-rose-700">
          {error}
        </p>
      ) : results.length > 0 ? (
        <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {results.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-ink/20 bg-paper p-14 text-center">
          <p className="text-4xl">🔍</p>
          <p className="mt-4 font-display text-xl font-bold text-ink">No books match your search</p>
          <p className="mt-2 text-ink-soft">
            Try different keywords or clear the filters to explore everything.
          </p>
          <Link
            to="/browse"
            className="mt-6 inline-block rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Clear filters
          </Link>
        </div>
      )}
    </div>
  );
}
