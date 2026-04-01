import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'All',
  'Pain Relief',
  'Cold & Cough',
  'Vitamins',
  'Antibiotics',
];

const MedicineList = () => {
  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchMedicines();
  }, [debouncedSearch, category]);

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (category !== 'All') params.append('category', category);
      const response = await fetch(`http://localhost:3000/api/medicines${params.toString() ? `?${params}` : ''}`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setMedicines(data);
    } catch (err) {
      toast.error('Failed to load medicines');
      setMedicines([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (medicine) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(item => item._id === medicine._id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...medicine, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    toast.success('Added to cart');
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Search medicines..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:flex-1 p-3 border border-gray-300 rounded-lg"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="p-3 border border-gray-300 rounded-lg"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      {medicines.length === 0 ? (
        <div className="text-center text-gray-500">No products found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {medicines.map((medicine) => (
            <div key={medicine._id} className="bg-white p-6 rounded-lg shadow-md">
              {medicine.image && (
                <img
                  src={`http://localhost:3000/${medicine.image}`}
                  alt={medicine.name}
                  className="w-full h-48 object-cover mb-4 rounded"
                />
              )}
              <h3 className="text-xl font-bold mb-2">{medicine.name}</h3>
              <p className="text-gray-600 mb-2">{medicine.description}</p>
              <p className="text-lg font-semibold text-green-600 mb-2">NPR {medicine.price}</p>
              <p className="text-sm text-gray-500 mb-4">Available: {medicine.quantity}</p>
              <div className="flex space-x-2">
                <Link
                  to={`/medicine/${medicine._id}`}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  View Details
                </Link>
                <button
                  onClick={() => addToCart(medicine)}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  disabled={medicine.quantity === 0}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MedicineList;