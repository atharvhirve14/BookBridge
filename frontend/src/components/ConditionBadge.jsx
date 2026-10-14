import { CONDITION_STYLES } from "@/lib/catalog";
export default function ConditionBadge({ condition }) {
  const style = CONDITION_STYLES[condition] ?? "bg-ink/10 text-ink-soft ring-ink/20";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${style}`}
    >
      {condition}
    </span>
  );
}
