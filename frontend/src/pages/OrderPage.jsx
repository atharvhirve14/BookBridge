import { Link } from "react-router-dom";
import { useNavigate, useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import api from "@/lib/api";
import { shortId } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";
import OrderStatus from "@/components/OrderStatus";
import OrderStatusControl from "@/components/OrderStatusControl";
export default function OrderPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [order, setOrder] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [status, setStatus] = useState("loading");
  const load = useCallback(async () => {
    try {
      const { data } = await api.get(`/orders/${id}`);
      setOrder(data.order);
      setIsSeller(!!data.isSeller);
      setStatus("ready");
    } catch {
      setStatus("missing");
    }
  }, [id]);
  useEffect(() => {
    document.title = `Order #${shortId(id)} — BookBridge`;
    if (loading) return;
    if (!user) {
      navigate(`/login?redirect=/orders/${id}`, { replace: true });
      return;
    }
    load();
  }, [id, user, loading, navigate, load]);
  if (status === "loading") {
    return <div className="mx-auto max-w-3xl px-4 py-20 text-center text-ink-soft sm:px-6">Loading…</div>;
  }
  if (status === "missing" || !order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <p className="text-5xl">📦</p>
        <h1 className="mt-6 font-display text-3xl font-extrabold text-ink">Order not found</h1>
        <p className="mt-3 text-ink-soft">This order does not exist or belongs to another account.</p>
        <Link
          to="/dashboard"
          className="mt-8 inline-block rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Go to Dashboard
        </Link>
      </div>
    );
  }
  const items = order.items;
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="rounded-2xl border border-ink/10 bg-paper p-8 shadow-sm sm:p-10">
        <div className="text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-leaf/15 text-3xl">
            ✅
          </span>
          <h1 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-ink">Order Placed!</h1>
          <p className="mt-3 text-ink-soft">
            Thank you, {order.buyerName.split(" ")[0]}. The sellers have been notified and will arrange the
            campus meetup with you shortly.
          </p>
        </div>

        <dl className="mt-8 grid grid-cols-2 gap-4 rounded-xl border border-ink/10 bg-cream p-5 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Order</dt>
            <dd className="mt-1 font-bold text-ink">#{shortId(order.id)}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Status</dt>
            <dd className="mt-1 font-bold text-leaf">{order.status}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Date</dt>
            <dd className="mt-1 font-bold text-ink">
              {new Date(order.createdAt).toLocaleDateString("en-IN")}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Total</dt>
            <dd className="mt-1 font-bold text-brand">₹{order.total}</dd>
          </div>
        </dl>

        <div className="mt-8 rounded-xl border border-ink/10 bg-cream p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-ink-soft">
            Delivery Status
          </h2>
          <OrderStatus status={order.status} />
          {isSeller && <OrderStatusControl orderId={order.id} current={order.status} onChanged={load} />}
        </div>

        <div className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-soft">
            Books in this order
          </h2>
          <ul className="mt-3 divide-y divide-ink/10">
            {items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="font-medium text-ink">{item.title}</p>
                  <p className="text-sm text-ink-soft">by {item.author}</p>
                </div>
                <span className="font-semibold text-ink">₹{item.price}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 rounded-xl border border-ink/10 bg-cream p-5 text-sm">
          <p className="font-semibold text-ink">Meetup details</p>
          <p className="mt-1 whitespace-pre-line text-ink-soft">{order.shippingAddress}</p>
          <p className="mt-2 text-ink-soft">Contact: {order.contactPhone}</p>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/browse"
            className="rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Continue Browsing
          </Link>
          <Link
            to="/dashboard"
            className="rounded-xl border border-ink/20 px-6 py-3 text-sm font-semibold text-ink hover:border-brand hover:text-brand"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
