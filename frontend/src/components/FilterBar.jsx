import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { CATEGORIES, CONDITIONS } from "@/lib/catalog";
export default function FilterBar({ resultCount }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  useEffect(() => {
    setQ(searchParams.get("q") ?? "");
  }, [searchParams]);
  function update(key, value) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    navigate(`/browse?${params.toString()}`);
  }
  const activeFilters = ["q", "category", "condition", "maxPrice"].filter((k) => searchParams.get(k));
  return (
    <div className="rounded-2xl border border-ink/10 bg-paper p-4 shadow-sm sm:p-5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          update("q", q.trim());
        }}
        className="flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-ink/15 px-3 py-2.5 focus-within:border-brand">
          <svg
            className="h-4.5 w-4.5 shrink-0 text-ink-soft"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by title or author"
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-soft/70"
            aria-label="Search books"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          Search
        </button>
      </form>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <label className="col-span-1">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ink-soft">
            Category
          </span>
          <select
            value={searchParams.get("category") ?? ""}
            onChange={(e) => update("category", e.target.value)}
            className="w-full rounded-xl border border-ink/15 bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-brand"
          >
            <option value="">All</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="col-span-1">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ink-soft">
            Condition
          </span>
          <select
            value={searchParams.get("condition") ?? ""}
            onChange={(e) => update("condition", e.target.value)}
            className="w-full rounded-xl border border-ink/15 bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-brand"
          >
            <option value="">Any</option>
            {CONDITIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="col-span-1">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ink-soft">
            Max price
          </span>
          <select
            value={searchParams.get("maxPrice") ?? ""}
            onChange={(e) => update("maxPrice", e.target.value)}
            className="w-full rounded-xl border border-ink/15 bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-brand"
          >
            <option value="">Any</option>
            <option value="150">Under ₹150</option>
            <option value="300">Under ₹300</option>
            <option value="500">Under ₹500</option>
            <option value="1000">Under ₹1,000</option>
          </select>
        </label>
        <label className="col-span-1">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ink-soft">
            Sort by
          </span>
          <select
            value={searchParams.get("sort") ?? "newest"}
            onChange={(e) => update("sort", e.target.value)}
            className="w-full rounded-xl border border-ink/15 bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-brand"
          >
            <option value="newest">Newest first</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-sm text-ink-soft">
          <strong className="text-ink">{resultCount}</strong> {resultCount === 1 ? "book" : "books"} found
        </span>
        {activeFilters.map((key) => (
          <button
            key={key}
            onClick={() => update(key, "")}
            className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand-dark hover:bg-brand/20"
          >
            {key === "q" ? `“${searchParams.get(key)}”` : searchParams.get(key)}
            <span aria-hidden="true">×</span>
          </button>
        ))}
        {activeFilters.length > 0 && (
          <button
            onClick={() => navigate("/browse")}
            className="text-xs font-semibold text-ink-soft underline hover:text-brand"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}
