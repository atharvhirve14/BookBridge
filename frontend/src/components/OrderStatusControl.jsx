import { useState } from "react";
import { ORDER_STATUSES, STATUS_STYLES } from "@/lib/catalog";
import api, { errorMessage } from "@/lib/api";
export default function OrderStatusControl({ orderId, current, compact = false, onChanged }) {
  const [status, setStatus] = useState(current);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  async function update(next) {
    if (next === status) return;
    setSaving(true);
    setError("");
    try {
      await api.patch(`/orders/${orderId}`, { status: next });
      setStatus(next);
      onChanged?.();
    } catch (err) {
      setError(errorMessage(err, "Could not update status."));
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className={compact ? "" : "mt-6 rounded-xl border border-ink/10 bg-cream p-5"}>
      <div className="flex flex-wrap items-center gap-2">
        {!compact && <span className="mr-1 text-sm font-semibold text-ink">Update status:</span>}
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${STATUS_STYLES[status] ?? "bg-ink/10 text-ink-soft ring-ink/20"}`}
        >
          {status}
        </span>
        {ORDER_STATUSES.filter((s) => s !== status).map((s) => (
          <button
            key={s}
            onClick={() => update(s)}
            disabled={saving}
            className="rounded-lg border border-ink/15 bg-paper px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-brand hover:text-brand disabled:opacity-50"
          >
            Mark as {s}
          </button>
        ))}
      </div>
      {error && <p className="mt-2 text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
}
