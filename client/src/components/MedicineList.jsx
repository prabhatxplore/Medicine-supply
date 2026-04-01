import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const MedicineList = () => {
  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMedicines();
  }, [search]);

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/medicines?search=${search}`);
      const data = await response.json();
      setMedicines(data);
    } catch (err) {
      toast.error('Failed to load medicines');
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
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search medicines..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg"
        />
      </div>
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
            <p className="text-lg font-semibold text-green-600 mb-2">${medicine.price}</p>
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
    </div>
  );
};

export default MedicineList;