import { Link } from 'react-router-dom';
import { getMedicineCategoryLabel, formatNPR } from '../utils/medicineDisplay';

/**
 * Minimal product card — responsive, touch-friendly, clear hierarchy.
 */
const MedicineProductCard = ({ medicine: med, onAddToCart, addDisabled, animationDelay }) => {
  const cat = getMedicineCategoryLabel(med);
  const q = Number(med.quantity);
  const inStock = Number.isFinite(q) && q > 0;
  const lowStock = inStock && q <= 5;
  const price = Number(med.price);
  const detailHref = `/medicine/${med._id}`;

  return (
    <article
      className="product-card group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition-[box-shadow,border-color,transform] duration-200 ease-out animate-fadeInUp hover:z-[1] hover:border-slate-300 hover:shadow-md motion-safe:hover:-translate-y-0.5 sm:rounded-[1.25rem]"
      style={{ animationDelay: animationDelay || undefined }}
    >
      <Link
        to={detailHref}
        className="relative block aspect-[4/3] w-full shrink-0 overflow-hidden bg-slate-100 sm:aspect-[5/4]"
        aria-label={`View ${med.name}`}
      >
        {med.image ? (
          <img
            src={`http://localhost:3000/${med.image}`}
            alt=""
            className="h-full w-full object-cover transition duration-300 ease-out group-hover:scale-[1.03]"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-50/80 text-4xl sm:text-5xl">
            💊
          </div>
        )}
        {/* Soft bottom fade for readability */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-slate-900/25 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          aria-hidden
        />

        <div className="absolute left-2.5 top-2.5 flex max-w-[calc(100%-1.25rem)] flex-wrap gap-1.5 sm:left-3 sm:top-3">
          {cat ? (
            <span className="inline-flex max-w-full truncate rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-600 shadow-sm ring-1 ring-black/5 backdrop-blur-sm sm:text-[11px]">
              {cat}
            </span>
          ) : null}
        </div>

        {lowStock ? (
          <span className="absolute right-2.5 top-2.5 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800 ring-1 ring-amber-200/80 sm:right-3 sm:top-3 sm:text-[11px]">
            Low stock
          </span>
        ) : null}
      </Link>

      <div className="flex min-h-0 flex-1 flex-col p-4 sm:p-5">
        <div className="min-h-0 flex-1">
          <h3 className="line-clamp-2 text-[0.9375rem] font-semibold leading-snug tracking-tight text-slate-900 sm:text-base">
            <Link to={detailHref} className="hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:ring-offset-2 rounded-sm">
              {med.name}
            </Link>
          </h3>
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500 sm:text-[0.8125rem]">
            {med.description?.trim() || 'Quality medicine from verified suppliers.'}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400 sm:text-xs">
            <span className="inline-flex items-center gap-1" title="Supplier verified">
              <svg className="h-3.5 w-3.5 shrink-0 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-medium text-slate-500">Verified</span>
            </span>
            {med.requiresPrescription ? (
              <span className="font-medium text-rose-600">Prescription required</span>
            ) : null}
          </div>
        </div>

        <div className="mt-4 flex items-end justify-between gap-3 border-t border-slate-100 pt-4">
          <div>
            <p className="text-[0.625rem] font-medium uppercase tracking-[0.12em] text-slate-400">Price</p>
            <p className="mt-0.5 text-lg font-semibold tabular-nums tracking-tight text-slate-900 sm:text-xl">
              {formatNPR(price)}
            </p>
          </div>
          <div className="text-right">
            {!inStock ? (
              <span className="inline-block rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-500">
                Out of stock
              </span>
            ) : (
              <p className="text-[11px] font-medium text-slate-500 sm:text-xs">
                <span className="tabular-nums text-slate-800">{q}</span>
                <span className="text-slate-400"> in stock</span>
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-2.5">
          <Link
            to={detailHref}
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/35 focus-visible:ring-offset-2 active:scale-[0.98]"
          >
            Details
          </Link>
          <button
            type="button"
            onClick={onAddToCart}
            disabled={addDisabled || !inStock}
            aria-label={inStock ? `Add ${med.name} to cart` : 'Unavailable'}
            className={[
              'inline-flex min-h-[44px] items-center justify-center rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/45 focus-visible:ring-offset-2 active:scale-[0.98]',
              inStock && !addDisabled
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'cursor-not-allowed bg-slate-100 text-slate-400',
            ].join(' ')}
          >
            Add
          </button>
        </div>
      </div>
    </article>
  );
};

export default MedicineProductCard;
