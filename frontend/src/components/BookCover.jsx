const PALETTES = [
  ["#0f766e", "#115e59"],
  ["#9a3412", "#7c2d12"],
  ["#1e3a8a", "#1e40af"],
  ["#6d28d9", "#5b21b6"],
  ["#15803d", "#166534"],
  ["#b45309", "#92400e"],
  ["#be1239", "#9f1239"],
  ["#0e7490", "#155e75"],
  ["#4d7c0f", "#3f6212"],
  ["#a21caf", "#86198f"],
];
function hashString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}
function initialsOf(title) {
  const words = title
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  if (words.length === 0) return "📘";
  return words.map((w) => w.charAt(0).toUpperCase()).join("");
}
export default function BookCover({ title, author, imageUrl, className = "" }) {
  const hash = hashString(title);
  const [from, to] = PALETTES[hash % PALETTES.length];
  const initials = initialsOf(title);
  if (imageUrl) {
    return (
      <div className={`relative aspect-[3/4] overflow-hidden rounded-lg bg-ink/5 shadow-md ${className}`}>
        <img src={imageUrl} alt={`Cover of ${title}`} className="h-full w-full object-cover" />
      </div>
    );
  }
  return (
    <div
      className={`relative flex aspect-[3/4] flex-col justify-between overflow-hidden rounded-lg p-3 text-white shadow-md ${className}`}
      style={{ backgroundImage: `linear-gradient(150deg, ${from}, ${to})` }}
      aria-hidden="true"
    >
      {/* spine highlight */}
      <div className="absolute inset-y-0 left-0 w-1.5 bg-black/25" />
      <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/10" />
      <div className="absolute -bottom-8 -left-4 h-24 w-24 rounded-full bg-black/10" />

      <p className="relative line-clamp-2 pl-1.5 font-display text-[13px] font-bold leading-snug drop-shadow-sm">
        {title}
      </p>
      <div className="relative flex flex-1 items-center justify-center">
        <span className="font-display text-4xl font-extrabold tracking-widest text-white/90 drop-shadow">
          {initials}
        </span>
      </div>
      <p className="relative line-clamp-1 pl-1.5 text-[10px] font-medium uppercase tracking-wider text-white/75">
        {author}
      </p>
    </div>
  );
}
