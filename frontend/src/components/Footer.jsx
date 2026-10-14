import { Link } from "react-router-dom";
const links = [
  { href: "/browse", label: "Browse" },
  { href: "/sell", label: "Sell" },
  { href: "/cart", label: "Cart" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/login", label: "Sign In" },
];
export default function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-paper">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-8 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-white">
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </span>
          <span className="font-display text-lg font-bold text-ink">
            Book<span className="text-brand">Bridge</span>
          </span>
        </Link>

        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-ink-soft">
          {links.map((link) => (
            <Link key={link.href} to={link.href} className="hover:text-brand">
              {link.label}
            </Link>
          ))}
        </nav>

        <p className="text-xs text-ink-soft">
          © {new Date().getFullYear()} BookBridge. Every book deserves a second chapter.
        </p>
      </div>
    </footer>
  );
}
