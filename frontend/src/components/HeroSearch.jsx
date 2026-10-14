import { useNavigate } from "react-router-dom";
import { useState } from "react";
export default function HeroSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const q = query.trim();
        navigate(q ? `/browse?q=${encodeURIComponent(q)}` : "/browse");
      }}
      className="mt-8 flex w-full max-w-lg items-center gap-2 rounded-2xl border border-ink/10 bg-paper p-2 shadow-[0_16px_40px_rgba(28,25,23,0.10)]"
    >
      <svg
        className="ml-2 h-5 w-5 shrink-0 text-ink-soft"
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
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by title or author — e.g. CLRS, Sapiens…"
        className="min-w-0 flex-1 bg-transparent py-2 text-sm text-ink outline-none placeholder:text-ink-soft/70"
        aria-label="Search books"
      />
      <button
        type="submit"
        className="shrink-0 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
      >
        Search
      </button>
    </form>
  );
}
