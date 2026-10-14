import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import BookCard from "@/components/BookCard";
import HeroSearch from "@/components/HeroSearch";
import { CATEGORIES, CATEGORY_EMOJI } from "@/lib/catalog";
const steps = [
  {
    icon: "🔍",
    title: "Discover",
    text: "Browse thousands of used books from students near you — filter by category, condition and budget.",
  },
  {
    icon: "📦",
    title: "Connect",
    text: "Add books to your cart, check out securely, and meet the seller to collect your new-to-you reads.",
  },
  {
    icon: "♻️",
    title: "Pass it on",
    text: "List the books you've outgrown in minutes. Your shelf becomes someone else's treasure.",
  },
];
export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [totalBooks, setTotalBooks] = useState(0);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    document.title = "BookBridge — Buy & Sell Used Books";
    Promise.all([api.get("/books", { params: { limit: 8 } }), api.get("/books/stats")])
      .then(([booksRes, statsRes]) => {
        setFeatured(booksRes.data.books ?? []);
        setTotalBooks(statsRes.data.totalBooks ?? 0);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);
  const stats = [
    { value: `${totalBooks}`, label: totalBooks === 1 ? "Book listed" : "Books listed" },
    { value: "8", label: "Categories" },
    { value: "₹0", label: "Listing fee" },
    { value: "100%", label: "Student run" },
  ];
  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="paper-texture relative overflow-hidden border-b border-ink/10">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-dark">
              📚 Buy smart · Sell simple
            </span>
            <h1 className="mt-6 font-display text-[clamp(2.4rem,6vw,4rem)] font-extrabold leading-[1.05] tracking-tight text-ink">
              Every book deserves a{" "}
              <span className="relative inline-block text-brand">
                second chapter
                <svg
                  className="absolute -bottom-2 left-0 h-3 w-full text-brand-light"
                  viewBox="0 0 200 12"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 8c40-6 90-8 196-4"
                    stroke="currentColor"
                    strokeWidth="5"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
              BookBridge is the campus marketplace for old &amp; used books. Turn the textbooks you&apos;ve
              finished into cash, and pick up your next read at a fraction of the price.
            </p>
            <HeroSearch />
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/browse"
                className="rounded-xl border border-ink/15 bg-paper px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-brand hover:text-brand"
              >
                Browse all books
              </Link>
              <Link
                to="/sell"
                className="rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-brand"
              >
                + Sell your books
              </Link>
            </div>
          </div>

          {/* Decorative book stack */}
          <div className="relative hidden lg:block" aria-hidden="true">
            <div className="absolute -left-6 top-10 w-44 rotate-[-8deg] rounded-lg bg-gradient-to-br from-[#0f766e] to-[#115e59] p-4 shadow-2xl">
              <p className="font-display text-sm font-bold text-white">Introduction to Algorithms</p>
              <p className="mt-6 text-center font-display text-3xl font-extrabold text-white/90">CLRS</p>
              <p className="mt-6 text-[10px] uppercase tracking-wider text-white/70">Thomas H. Cormen</p>
            </div>
            <div className="absolute left-32 top-32 w-44 rotate-[5deg] rounded-lg bg-gradient-to-br from-[#9a3412] to-[#7c2d12] p-4 shadow-2xl">
              <p className="font-display text-sm font-bold text-white">Sapiens</p>
              <p className="mt-6 text-center font-display text-3xl font-extrabold text-white/90">HUM</p>
              <p className="mt-6 text-[10px] uppercase tracking-wider text-white/70">Yuval Noah Harari</p>
            </div>
            <div className="absolute bottom-4 left-10 w-44 rotate-[3deg] rounded-lg bg-gradient-to-br from-[#1e3a8a] to-[#1e40af] p-4 shadow-2xl">
              <p className="font-display text-sm font-bold text-white">Let Us C</p>
              <p className="mt-6 text-center font-display text-3xl font-extrabold text-white/90">C</p>
              <p className="mt-6 text-[10px] uppercase tracking-wider text-white/70">Yashavant Kanetkar</p>
            </div>
            <div className="ml-56 h-80 w-56 rounded-2xl border border-dashed border-brand/40 bg-brand/5" />
          </div>
        </div>

        {/* Stats strip */}
        <div className="border-t border-ink/10 bg-paper/60">
          <dl className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 sm:px-6 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <span className="block font-display text-3xl font-extrabold text-brand">{stat.value}</span>
                  <span className="mt-1 block text-sm text-ink-soft">{stat.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---------- Categories ---------- */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-ink">
              Browse by category
            </h2>
            <p className="mt-2 text-ink-soft">From semester textbooks to weekend novels.</p>
          </div>
          <Link
            to="/browse"
            className="hidden text-sm font-semibold text-brand hover:text-brand-dark sm:block"
          >
            View all →
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {CATEGORIES.map((category) => (
            <Link
              key={category}
              to={`/browse?category=${encodeURIComponent(category)}`}
              className="group flex items-center gap-3 rounded-2xl border border-ink/10 bg-paper p-4 transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand/10 text-xl transition-transform group-hover:scale-110">
                {CATEGORY_EMOJI[category]}
              </span>
              <span className="font-semibold text-ink group-hover:text-brand-dark">{category}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- Featured books ---------- */}
      <section className="border-y border-ink/10 bg-paper/50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-extrabold tracking-tight text-ink">
                Fresh on the shelf
              </h2>
              <p className="mt-2 text-ink-soft">Latest listings from student sellers near you.</p>
            </div>
            <Link
              to="/browse"
              className="hidden text-sm font-semibold text-brand hover:text-brand-dark sm:block"
            >
              View all →
            </Link>
          </div>
          {!loaded ? (
            <p className="mt-8 text-center text-ink-soft">Loading books…</p>
          ) : featured.length > 0 ? (
            <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {featured.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-ink/20 bg-cream p-12 text-center">
              <p className="font-display text-xl font-bold text-ink">No books listed yet</p>
              <p className="mt-2 text-ink-soft">Be the first to list a book on BookBridge!</p>
              <Link
                to="/sell"
                className="mt-6 inline-block rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
              >
                Sell a Book
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ---------- How it works ---------- */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="text-center font-display text-3xl font-extrabold tracking-tight text-ink">
          How BookBridge works
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-ink-soft">
          Three simple steps to buy cheaper and declutter smarter.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="relative rounded-2xl border border-ink/10 bg-paper p-6 text-center"
            >
              <span className="absolute right-5 top-4 font-display text-4xl font-extrabold text-ink/10">
                {i + 1}
              </span>
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand/10 text-2xl">
                {step.icon}
              </span>
              <h3 className="mt-4 font-display text-lg font-bold text-ink">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6">
        <div className="overflow-hidden rounded-3xl bg-ink px-6 py-14 text-center shadow-xl sm:px-12">
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-cream sm:text-4xl">
            Got books gathering dust?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-cream/70">
            List them on BookBridge for free. Someone on campus is looking for exactly what you&apos;re about
            to throw away.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/sell"
              className="rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              Start Selling
            </Link>
            <Link
              to="/register"
              className="rounded-xl border border-cream/30 px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-cream/10"
            >
              Create an Account
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
