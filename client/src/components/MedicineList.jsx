import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import MedicineProductCard from './MedicineProductCard';
import { notifyCartUpdated } from '../utils/cartNotify';

const CATEGORIES = [
  { name: 'All', icon: '🏥' },
  { name: 'Pain Relief', icon: '💊' },
  { name: 'Cold & Cough', icon: '🤧' },
  { name: 'Vitamins', icon: '🌿' },
  { name: 'Antibiotics', icon: '🧬' },
];

const ListSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="card overflow-hidden animate-fadeIn">
        <div className="skeleton h-48 rounded-none" />
        <div className="p-5 space-y-3">
          <div className="skeleton h-5 w-3/4 rounded" />
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-10 w-full rounded-lg" />
        </div>
      </div>
    ))}
  </div>
);

const MedicineList = () => {
  const [searchParams] = useSearchParams();
  const urlSearch = searchParams.get('search') || '';
  const [medicines, setMedicines] = useState([]);
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [debouncedSearch, setDebouncedSearch] = useState(urlSearch.trim());
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(urlSearch.trim()), 350);
    return () => clearTimeout(t);
  }, [urlSearch]);

  const fetchMedicines = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (category !== 'All') params.append('category', category);
      const response = await fetch(
        `http://localhost:3000/api/medicines${params.toString() ? `?${params}` : ''}`
      );
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setMedicines(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load medicines');
      setMedicines([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, category]);

  useEffect(() => {
    fetchMedicines();
  }, [fetchMedicines]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('http://localhost:3000/api/auth/me', { credentials: 'include' });
        setIsAuthenticated(res.ok);
      } catch {
        setIsAuthenticated(false);
      }
    })();
  }, []);

  const addToCart = (medicine) => {
    if (!isAuthenticated) {
      toast.error('Please log in to add items to cart');
      return;
    }
    const q = Number(medicine.quantity);
    if (!Number.isFinite(q) || q < 1) {
      toast.error('Out of stock');
      return;
    }
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find((item) => item._id === medicine._id);
    const nextQty = existing ? existing.quantity + 1 : 1;
    if (nextQty > q) {
      toast.error(`Only ${q} available for ${medicine.name}`);
      return;
    }
    if (existing) existing.quantity += 1;
    else cart.push({ ...medicine, quantity: 1 });
    localStorage.setItem('cart', JSON.stringify(cart));
    notifyCartUpdated();
    toast.success('Added to cart');
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <p className="text-sm text-slate-600 min-h-[1.25rem]">
          {debouncedSearch ? (
            <>
              <span className="text-slate-500">Showing results for </span>
              <span className="font-semibold text-slate-800">“{debouncedSearch}”</span>
            </>
          ) : (
            <span className="text-slate-500">Use the search bar at the top to find medicines.</span>
          )}
        </p>
        <p className="text-sm text-slate-500 shrink-0">
          {!loading && (
            <>
              <span className="font-semibold text-slate-700 tabular-nums">{medicines.length}</span>
              {' '}products
            </>
          )}
          {loading && 'Loading…'}
        </p>
      </div>

      <div className="mb-8 overflow-x-auto pb-1 -mx-1 px-1">
        <div className="flex gap-2 min-w-max sm:flex-wrap sm:min-w-0">
          {CATEGORIES.map((c) => {
            const active = category === c.name;
            return (
              <button
                key={c.name}
                type="button"
                onClick={() => setCategory(c.name)}
                className={[
                  'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border-2',
                  active
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-transparent shadow-md shadow-emerald-500/25'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-emerald-800',
                ].join(' ')}
              >
                <span className="text-base leading-none">{c.icon}</span>
                {c.name}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <ListSkeleton />
      ) : medicines.length === 0 ? (
        <div className="card text-center py-16 px-6">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-xl font-extrabold text-slate-900 mb-2">No results found</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            {debouncedSearch ? (
              <>
                Nothing matches <span className="font-semibold text-slate-700">“{debouncedSearch}”</span>
                {category !== 'All' && (
                  <> in <span className="font-semibold text-slate-700">{category}</span></>
                )}
                . Try a different keyword or category.
              </>
            ) : category !== 'All' ? (
              <>No medicines in <span className="font-semibold text-slate-700">{category}</span> right now. Pick another category or clear filters.</>
            ) : (
              <>No medicines are listed yet. Check back soon.</>
            )}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
          {medicines.map((medicine, i) => (
            <MedicineProductCard
              key={medicine._id}
              medicine={medicine}
              onAddToCart={() => addToCart(medicine)}
              animationDelay={`${Math.min(i, 5) * 60}ms`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MedicineList;
