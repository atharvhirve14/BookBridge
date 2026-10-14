import { shortId } from "@/lib/format";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api, { errorMessage } from "@/lib/api";
import BookCover from "@/components/BookCover";
import ConditionBadge from "@/components/ConditionBadge";
import { STATUS_STYLES } from "@/lib/catalog";
export default function DashboardPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("listings");
  const [listings, setListings] = useState(null);
  const [purchases, setPurchases] = useState(null);
  const [sales, setSales] = useState(null);
  const [actionError, setActionError] = useState("");
  const load = useCallback(async () => {
    if (!user) return;
    const [listingsRes, purchasesRes, salesRes] = await Promise.all([
      api.get("/books", { params: { sellerId: user.id, includeSold: true } }),
      api.get("/orders"),
      api.get("/orders", { params: { role: "seller" } }),
    ]);
    setListings(listingsRes.data.books ?? []);
    setPurchases(purchasesRes.data.orders ?? []);
    setSales(salesRes.data.orders ?? []);
  }, [user]);
  useEffect(() => {
    if (!loading && !user) navigate("/login?redirect=/dashboard", { replace: true });
  }, [loading, user, navigate]);
  useEffect(() => {
    if (user) load();
  }, [user, load]);
  async function toggleSold(book) {
    setActionError("");
    try {
      await api.patch(`/books/${book.id}`, { isSold: !book.isSold });
    } catch (err) {
      setActionError(errorMessage(err, "Update failed"));
      return;
    }
    await load();
  }
  async function deleteListing(book) {
    setActionError("");
    try {
      await api.delete(`/books/${book.id}`);
    } catch (err) {
      setActionError(errorMessage(err, "Delete failed"));
      return;
    }
    await load();
  }
  if (loading || !user) {
    return <div className="mx-auto max-w-7xl px-4 py-20 text-center text-ink-soft sm:px-6">Loading…</div>;
  }
  const activeCount = listings?.filter((b) => !b.isSold).length ?? 0;
  const soldCount = listings?.filter((b) => b.isSold).length ?? 0;
  const earnings = listings?.filter((b) => b.isSold).reduce((s, b) => s + b.price, 0) ?? 0;
  const spent = purchases?.reduce((s, o) => s + o.total, 0) ?? 0;
  const tabs = [
    { key: "listings", label: "My Listings", count: listings?.length ?? 0 },
    { key: "purchases", label: "Purchases", count: purchases?.length ?? 0 },
    { key: "sales", label: "Sales", count: sales?.length ?? 0 },
  ];
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink">My Dashboard</h1>
          <p className="mt-2 text-ink-soft">
            Welcome back, {user.name.split(" ")[0]} — here&apos;s your BookBridge activity.
          </p>
        </div>
        <Link
          to="/sell"
          className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-dark"
        >
          + List a Book
        </Link>
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Active listings", value: activeCount },
          { label: "Books sold", value: soldCount },
          { label: "Earnings", value: `₹${earnings}` },
          { label: "Total spent", value: `₹${spent}` },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-ink/10 bg-paper p-5">
            <dt className="text-xs font-semibold uppercase tracking-wider text-ink-soft">{stat.label}</dt>
            <dd className="mt-1 font-display text-2xl font-extrabold text-ink">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 flex gap-1 overflow-x-auto rounded-xl border border-ink/10 bg-paper p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${tab === t.key ? "bg-brand text-white shadow-sm" : "text-ink-soft hover:bg-ink/5"}`}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {actionError && (
        <div className="mt-4 rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {actionError}
        </div>
      )}

      {/* Listings */}
      {tab === "listings" && (
        <div className="mt-6">
          {listings && listings.length > 0 ? (
            <ul className="space-y-4">
              {listings.map((book) => (
                <li
                  key={book.id}
                  className="flex flex-col gap-4 rounded-2xl border border-ink/10 bg-paper p-4 sm:flex-row sm:items-center"
                >
                  <Link to={`/books/${book.id}`} className="w-16 shrink-0">
                    <BookCover title={book.title} author={book.author} imageUrl={book.imageUrls[0] ?? null} />
                  </Link>
                  <div className="flex-1">
                    <Link
                      to={`/books/${book.id}`}
                      className="font-display font-bold text-ink hover:text-brand-dark"
                    >
                      {book.title}
                    </Link>
                    <p className="text-sm text-ink-soft">by {book.author}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <ConditionBadge condition={book.condition} />
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${book.isSold ? "bg-ink/10 text-ink-soft ring-ink/20" : "bg-leaf/10 text-leaf ring-leaf/20"}`}
                      >
                        {book.isSold ? "Sold" : "Active"}
                      </span>
                      <span className="text-xs text-ink-soft">
                        Listed {new Date(book.createdAt).toLocaleDateString("en-IN")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                    <span className="font-display text-lg font-extrabold text-ink">₹{book.price}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleSold(book)}
                        className="rounded-lg border border-ink/15 px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-brand hover:text-brand"
                      >
                        {book.isSold ? "Mark as available" : "Mark as sold"}
                      </button>
                      {!book.isSold && (
                        <button
                          onClick={() => deleteListing(book)}
                          className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 transition-colors hover:border-rose-400 hover:bg-rose-50"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-2xl border border-dashed border-ink/20 bg-paper p-14 text-center">
              <p className="text-4xl">📚</p>
              <p className="mt-4 font-display text-xl font-bold text-ink">No listings yet</p>
              <p className="mt-2 text-ink-soft">
                Your shelf is full — turn those books into someone else&apos;s treasure.
              </p>
              <Link
                to="/sell"
                className="mt-6 inline-block rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
              >
                Sell your first book
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Purchases */}
      {tab === "purchases" && (
        <div className="mt-6">
          {purchases && purchases.length > 0 ? (
            <ul className="space-y-4">
              {purchases.map((order) => (
                <li key={order.id} className="rounded-2xl border border-ink/10 bg-paper p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 pb-3">
                    <div>
                      <p className="font-display font-bold text-ink">Order #{shortId(order.id)}</p>
                      <p className="text-xs text-ink-soft">
                        {new Date(order.createdAt).toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-lg font-extrabold text-ink">₹{order.total}</p>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${STATUS_STYLES[order.status] ?? "bg-ink/10 text-ink-soft ring-ink/20"}`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                  <ul className="mt-3 space-y-1.5">
                    {order.items.map((item) => (
                      <li key={item.id} className="flex justify-between text-sm">
                        <span className="text-ink">
                          {item.title} <span className="text-ink-soft">· {item.author}</span>
                        </span>
                        <span className="font-medium text-ink">₹{item.price}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={`/orders/${order.id}`}
                    className="mt-3 inline-block text-sm font-semibold text-brand hover:text-brand-dark"
                  >
                    View details →
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-2xl border border-dashed border-ink/20 bg-paper p-14 text-center">
              <p className="text-4xl">📦</p>
              <p className="mt-4 font-display text-xl font-bold text-ink">No purchases yet</p>
              <p className="mt-2 text-ink-soft">Find your next read at a fraction of the price.</p>
              <Link
                to="/browse"
                className="mt-6 inline-block rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
              >
                Browse Books
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Sales */}
      {tab === "sales" && (
        <div className="mt-6">
          {sales && sales.length > 0 ? (
            <ul className="space-y-4">
              {sales.map((order) => (
                <li key={order.id} className="rounded-2xl border border-ink/10 bg-paper p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 pb-3">
                    <div>
                      <p className="font-display font-bold text-ink">Order #{shortId(order.id)}</p>
                      <p className="text-xs text-ink-soft">
                        Buyer: {order.buyerName} · {new Date(order.createdAt).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                    <p className="font-display text-lg font-extrabold text-leaf">₹{order.total}</p>
                  </div>
                  <ul className="mt-3 space-y-1.5">
                    {order.items.map((item) => (
                      <li key={item.id} className="flex justify-between text-sm">
                        <span className="text-ink">
                          {item.title} <span className="text-ink-soft">· {item.author}</span>
                        </span>
                        <span className="font-medium text-ink">₹{item.price}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-2xl border border-dashed border-ink/20 bg-paper p-14 text-center">
              <p className="text-4xl">💰</p>
              <p className="mt-4 font-display text-xl font-bold text-ink">No sales yet</p>
              <p className="mt-2 text-ink-soft">List a book and it will show up here once it sells.</p>
              <Link
                to="/sell"
                className="mt-6 inline-block rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
              >
                Sell a Book
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
