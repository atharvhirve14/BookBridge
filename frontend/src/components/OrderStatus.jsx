import { ORDER_STATUSES } from "@/lib/catalog";
export default function OrderStatus({ status }) {
  const currentIndex = ORDER_STATUSES.indexOf(status);
  return (
    <ol className="flex items-center">
      {ORDER_STATUSES.map((step, i) => {
        const done = currentIndex >= 0 && i < currentIndex;
        const active = i === currentIndex;
        return (
          <li key={step} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold transition-colors ${
                  done
                    ? "bg-leaf text-white"
                    : active
                      ? "bg-brand text-white ring-4 ring-brand/20"
                      : "bg-ink/10 text-ink-soft"
                }`}
              >
                {done ? "✓" : i + 1}
              </span>
              <span
                className={`whitespace-nowrap text-[11px] font-semibold sm:text-xs ${active ? "text-brand-dark" : done ? "text-leaf" : "text-ink-soft"}`}
              >
                {step}
              </span>
            </div>
            {i < ORDER_STATUSES.length - 1 && (
              <span className={`mx-1 mb-5 h-0.5 flex-1 rounded ${done ? "bg-leaf" : "bg-ink/15"}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
