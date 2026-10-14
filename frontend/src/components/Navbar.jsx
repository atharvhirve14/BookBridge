import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
const links = [
  { href: "/browse", label: "Browse Books" },
  { href: "/sell", label: "Sell a Book" },
  { href: "/dashboard", label: "Dashboard" },
];
function BookIcon({ className }) {
  return (
    <svg
      className={className}
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
  );
}
export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isActive = (href) => pathname === href || pathname.startsWith(href + "/");
  async function handleLogout() {
    await logout();
    setMenuOpen(false);
    navigate("/");
  }
  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-paper/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-white shadow-sm">
            <BookIcon className="h-5 w-5" />
          </span>
          <span className="font-display text-xl font-bold tracking-tight text-ink">
            Book<span className="text-brand">Bridge</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "bg-brand/10 text-brand-dark"
                  : "text-ink-soft hover:bg-ink/5 hover:text-ink"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/cart"
            className="relative flex items-center gap-2 rounded-lg border border-ink/15 px-3 py-2 text-sm font-medium text-ink transition-colors hover:border-brand hover:text-brand"
          >
            <svg
              className="h-4.5 w-4.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <span className="hidden sm:inline">Cart</span>
            {count > 0 && (
              <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-[11px] font-bold text-white">
                {count}
              </span>
            )}
          </Link>

          {user ? (
            <div className="relative hidden md:block">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-lg border border-ink/15 px-3 py-2 text-sm font-medium text-ink transition-colors hover:border-brand hover:text-brand"
              >
                <span className="grid h-6 w-6 place-items-center rounded-full bg-brand/15 text-xs font-bold text-brand-dark">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="max-w-24 truncate">{user.name.split(" ")[0]}</span>
                <svg
                  className={`h-3.5 w-3.5 transition-transform ${menuOpen ? "rotate-180" : ""}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-ink/10 bg-paper shadow-lg">
                  <div className="border-b border-ink/10 px-4 py-3">
                    <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
                    <p className="truncate text-xs text-ink-soft">{user.email}</p>
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 text-sm text-ink-soft hover:bg-ink/5 hover:text-ink"
                  >
                    My Dashboard
                  </Link>
                  <Link
                    to="/sell"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 text-sm text-ink-soft hover:bg-ink/5 hover:text-ink"
                  >
                    Sell a Book
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full px-4 py-2.5 text-left text-sm text-brand hover:bg-brand/10"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-dark md:block"
            >
              Sign In
            </Link>
          )}

          <button
            onClick={() => setOpen((v) => !v)}
            className="rounded-lg border border-ink/15 p-2 text-ink md:hidden"
            aria-label="Toggle menu"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <path d={open ? "M18 6 6 18M6 6l12 12" : "M3 12h18M3 6h18M3 18h18"} />
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-ink/10 bg-paper px-4 py-3 md:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setOpen(false)}
              className={`block rounded-lg px-3 py-2.5 text-sm font-medium ${isActive(link.href) ? "bg-brand/10 text-brand-dark" : "text-ink-soft hover:bg-ink/5"}`}
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <button
              onClick={() => {
                setOpen(false);
                handleLogout();
              }}
              className="mt-1 block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-brand hover:bg-brand/10"
            >
              Sign Out ({user.name.split(" ")[0]})
            </button>
          ) : (
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="mt-1 block rounded-lg bg-brand px-3 py-2.5 text-center text-sm font-semibold text-white"
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
