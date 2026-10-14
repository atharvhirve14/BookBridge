import { useState } from "react";
import BookCover from "./BookCover";
const LABELS = ["Front cover", "Back cover", "Inside pages"];
export default function BookGallery({ title, author, imageUrls, isSold = false }) {
  const photos = imageUrls.filter((u) => u && u.startsWith("data:image/"));
  const [active, setActive] = useState(0);
  if (photos.length === 0) {
    return (
      <div className="relative">
        <BookCover title={title} author={author} className="rounded-2xl" />
        {isSold && (
          <div className="absolute inset-0 grid place-items-center rounded-2xl bg-ink/60">
            <span className="rotate-[-8deg] rounded-lg border-2 border-white px-6 py-2 font-display text-2xl font-extrabold uppercase tracking-widest text-white">
              Sold
            </span>
          </div>
        )}
      </div>
    );
  }
  const safeActive = Math.min(active, photos.length - 1);
  return (
    <div>
      <div className="relative overflow-hidden rounded-2xl border border-ink/10 bg-paper shadow-md">
        <img
          src={photos[safeActive]}
          alt={`${title} — ${LABELS[safeActive] ?? `Photo ${safeActive + 1}`}`}
          className="aspect-[3/4] w-full object-cover"
        />
        <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
          {LABELS[safeActive] ?? `Photo ${safeActive + 1}`} · {safeActive + 1}/{photos.length}
        </span>
        {isSold && (
          <div className="absolute inset-0 grid place-items-center bg-ink/60">
            <span className="rotate-[-8deg] rounded-lg border-2 border-white px-6 py-2 font-display text-2xl font-extrabold uppercase tracking-widest text-white">
              Sold
            </span>
          </div>
        )}
      </div>

      {photos.length > 1 && (
        <div className="mt-3 grid grid-cols-3 gap-3">
          {photos.map((photo, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`View ${LABELS[i] ?? `photo ${i + 1}`}`}
              className={`overflow-hidden rounded-xl border-2 bg-paper transition-all ${i === safeActive ? "border-brand shadow-md" : "border-ink/10 hover:border-brand/40"}`}
            >
              <img
                src={photo}
                alt={LABELS[i] ?? `Photo ${i + 1}`}
                className="aspect-[3/4] w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
