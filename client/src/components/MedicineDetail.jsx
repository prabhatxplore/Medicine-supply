import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const MedicineDetail = () => {
  const { id } = useParams();
  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMedicine();
  }, [id]);

  const fetchMedicine = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://medicine-supply.onrender.com/api/medicines/${id}`);
      const data = await response.json();
      setMedicine(data);
    } catch (err) {
      toast.error('Failed to load medicine');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = () => {
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
  if (!medicine) return <div className="text-center mt-10">Medicine not found</div>;

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="bg-white p-6 rounded-lg shadow-md">
        {medicine.image && (
          <img
            src={medicine.image.startsWith('http') ? medicine.image : `https://medicine-supply.onrender.com/${medicine.image}`}
            alt={medicine.name}
            className="w-full h-64 object-cover mb-6 rounded"
          />
        )}
        <h1 className="text-3xl font-bold mb-4">{medicine.name}</h1>
        <p className="text-gray-600 mb-4">{medicine.description}</p>
        <p className="text-2xl font-semibold text-green-600 mb-2">${medicine.price}</p>
        <p className="text-lg mb-2">Available: {medicine.quantity}</p>
        {medicine.requiresPrescription && (
          <p className="text-red-600 font-semibold mb-4">Requires Prescription</p>
        )}
        <button
          onClick={addToCart}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 text-lg"
          disabled={medicine.quantity === 0}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default MedicineDetail;