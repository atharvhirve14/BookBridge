import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import api, { errorMessage } from "@/lib/api";
import { CATEGORIES, CONDITIONS } from "@/lib/catalog";
const inputClass =
  "w-full rounded-xl border border-ink/15 bg-paper px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-brand placeholder:text-ink-soft/60";
const labelClass = "mb-1.5 block text-sm font-semibold text-ink";
const PHOTO_LABELS = ["Photo 1 — Front cover", "Photo 2 — Back cover", "Photo 3 — Inside pages"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
export default function SellPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [createdId, setCreatedId] = useState(null);
  const [photos, setPhotos] = useState([null, null, null]);
  const [photoError, setPhotoError] = useState("");
  function handlePhoto(index, file) {
    if (!file) return;
    setPhotoError("");
    if (!file.type.startsWith("image/")) {
      setPhotoError(`Photo ${index + 1}: please choose an image file.`);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setPhotoError(`Photo ${index + 1} is too large — please choose one under 5 MB.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        // Downscale to max 800px so listings stay lightweight
        const MAX = 800;
        const scale = Math.min(1, MAX / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        setPhotos((prev) => prev.map((p, i) => (i === index ? dataUrl : p)));
      };
      img.onerror = () => setPhotoError(`Photo ${index + 1}: could not read that image.`);
      img.src = reader.result;
    };
    reader.onerror = () => setPhotoError(`Photo ${index + 1}: could not read that file.`);
    reader.readAsDataURL(file);
  }
  function removePhoto(index) {
    setPhotos((prev) => prev.map((p, i) => (i === index ? null : p)));
    setPhotoError("");
  }
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setPhotoError("");
    if (photos.some((p) => !p)) {
      setPhotoError("All 3 photos are required — front cover, back cover and inside pages.");
      return;
    }
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      const { data } = await api.post("/books", { ...payload, imageUrls: photos });
      setCreatedId(data.book.id);
    } catch (err) {
      setError(errorMessage(err, "Could not create the listing."));
    } finally {
      setSubmitting(false);
    }
  }
  if (loading) {
    return <div className="mx-auto max-w-3xl px-4 py-20 text-center text-ink-soft sm:px-6">Loading…</div>;
  }
  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <p className="text-5xl">🔐</p>
        <h1 className="mt-6 font-display text-3xl font-extrabold text-ink">Sign in to sell your books</h1>
        <p className="mt-3 text-ink-soft">
          You need a BookBridge account to create a listing. It takes less than a minute.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            to="/login"
            className="rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="rounded-xl border border-ink/20 px-6 py-3 text-sm font-semibold text-ink hover:border-brand hover:text-brand"
          >
            Create Account
          </Link>
        </div>
      </div>
    );
  }
  if (createdId) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <p className="text-5xl">🎉</p>
        <h1 className="mt-6 font-display text-3xl font-extrabold text-ink">Your book is live!</h1>
        <p className="mt-3 text-ink-soft">
          Your listing with all 3 photos is now visible to buyers browsing BookBridge.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            to={`/books/${createdId}`}
            className="rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            View Listing
          </Link>
          <button
            onClick={() => {
              setCreatedId(null);
              setPhotos([null, null, null]);
            }}
            className="rounded-xl border border-ink/20 px-6 py-3 text-sm font-semibold text-ink hover:border-brand hover:text-brand"
          >
            List Another Book
          </button>
        </div>
      </div>
    );
  }
  const allPhotosUploaded = photos.every((p) => p);
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink">Sell a Book</h1>
      <p className="mt-2 text-ink-soft">
        Fill in the details below — the more accurate they are, the faster your book finds a new home.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-6 rounded-2xl border border-ink/10 bg-paper p-6 shadow-sm sm:p-8"
      >
        {error && (
          <div className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {error}
          </div>
        )}

        {/* ---------- Photos (all 3 required) ---------- */}
        <div>
          <div className="flex items-center justify-between">
            <span className={labelClass}>Book Photos *</span>
            <span className={`text-xs font-semibold ${allPhotosUploaded ? "text-leaf" : "text-brand"}`}>
              {photos.filter((p) => p).length}/3 uploaded
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {PHOTO_LABELS.map((label, i) => (
              <div key={label}>
                {photos[i] ? (
                  <div className="relative">
                    <img
                      src={photos[i]}
                      alt={label}
                      className="aspect-[3/4] w-full rounded-lg border border-ink/10 object-cover shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      aria-label={`Remove ${label}`}
                      className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-ink text-xs font-bold text-white shadow-md hover:bg-brand"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="grid aspect-[3/4] w-full place-items-center rounded-lg border-2 border-dashed border-ink/20 text-3xl text-ink-soft">
                    📷
                  </div>
                )}
                <input
                  id={`photo-${i}`}
                  type="file"
                  accept="image/*"
                  required
                  onChange={(e) => handlePhoto(i, e.target.files?.[0])}
                  className="hidden"
                />
                <label
                  htmlFor={`photo-${i}`}
                  className="mt-2 block cursor-pointer rounded-lg border border-ink/15 py-1.5 text-center text-xs font-semibold text-ink transition-colors hover:border-brand hover:text-brand"
                >
                  {photos[i] ? "Change" : "Upload"}
                </label>
                <p className="mt-1 text-center text-[11px] leading-tight text-ink-soft">
                  {label.replace(" — ", ": ")}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-ink-soft">
            All 3 photos are required (JPG or PNG, up to 5 MB each). Listings with clear photos sell much
            faster!
          </p>
          {photoError && <p className="mt-1 text-xs font-medium text-rose-600">{photoError}</p>}
        </div>

        {/* ---------- Book details ---------- */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="title">
              Book Title *
            </label>
            <input
              id="title"
              name="title"
              required
              minLength={2}
              placeholder="e.g. Introduction to Algorithms"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="author">
              Author *
            </label>
            <input
              id="author"
              name="author"
              required
              minLength={2}
              placeholder="e.g. Thomas H. Cormen"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="edition">
              Edition / Year
            </label>
            <input id="edition" name="edition" placeholder="e.g. 3rd Edition" className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="category">
              Category *
            </label>
            <select id="category" name="category" required defaultValue="Engineering" className={inputClass}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="condition">
              Condition *
            </label>
            <select id="condition" name="condition" required defaultValue="Good" className={inputClass}>
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="price">
              Your Price (₹) *
            </label>
            <input
              id="price"
              name="price"
              type="number"
              min="1"
              max="100000"
              required
              placeholder="e.g. 350"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="mrp">
              Original MRP (₹)
            </label>
            <input id="mrp" name="mrp" type="number" min="0" placeholder="e.g. 999" className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="isbn">
              ISBN (optional)
            </label>
            <input id="isbn" name="isbn" placeholder="e.g. 9780262033848" className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="city">
              City / Campus
            </label>
            <input
              id="city"
              name="city"
              defaultValue={user.city}
              placeholder="e.g. Kolhapur"
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              maxLength={1000}
              placeholder="Tell buyers about the book's condition, any notes/highlights, and where you'd prefer to meet."
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-ink/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-ink-soft">
            Listing is free. Meet buyers on campus and get paid in cash or UPI.
          </p>
          <button
            type="submit"
            disabled={submitting || !allPhotosUploaded}
            className="rounded-xl bg-brand px-8 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-dark disabled:opacity-60"
          >
            {submitting ? "Publishing…" : "Publish Listing"}
          </button>
        </div>
      </form>
    </div>
  );
}
