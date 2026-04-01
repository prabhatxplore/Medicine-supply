import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const MedicineDetailsPage = () => {
  const { id } = useParams();
  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchMedicine();
  }, [id]);

  const fetchMedicine = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/medicines/${id}`);
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
      existing.quantity += quantity;
    } else {
      cart.push({ ...medicine, quantity });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    toast.success(`Added ${quantity} to cart!`);
    setQuantity(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="animate-spin text-4xl">⏳</div>
      </div>
    );
  }

  if (!medicine) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <p className="text-gray-600 text-lg mb-4">Medicine not found</p>
        <Link to="/" className="text-blue-600 hover:text-blue-700 font-semibold">
          ← Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <Link to="/" className="flex items-center text-blue-600 hover:text-blue-700 font-semibold mb-6">
          ← Back to Home
        </Link>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 p-6 md:p-10">
            {/* Image Section */}
            <div className="flex items-center justify-center">
              {medicine.image ? (
                <img
                  src={`http://localhost:3000/${medicine.image}`}
                  alt={medicine.name}
                  className="w-full h-auto max-h-96 object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-80 bg-gray-200 flex items-center justify-center rounded-lg">
                  <div className="text-6xl">💊</div>
                </div>
              )}
            </div>

            {/* Details Section */}
            <div className="flex flex-col justify-center">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                {medicine.name}
              </h1>

              <p className="text-gray-600 text-base md:text-lg mb-6 leading-relaxed">
                {medicine.description}
              </p>

              {/* Price & Stock */}
              <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                <p className="text-gray-600 text-sm mb-2">Price</p>
                <p className="text-4xl md:text-5xl font-bold text-green-600 mb-4">
                  ${medicine.price.toFixed(2)}
                </p>
                <p className={`text-lg font-semibold ${
                  medicine.quantity > 5 ? 'text-green-600' :
                  medicine.quantity > 0 ? 'text-orange-600' :
                  'text-red-600'
                }`}>
                  {medicine.quantity > 0 
                    ? `${medicine.quantity} units in stock`
                    : 'Out of Stock'}
                </p>
              </div>

              {/* Prescription Warning */}
              {medicine.requiresPrescription && (
                <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-6 rounded">
                  <div className="flex items-start">
                    <span className="text-2xl mr-3">⚠️</span>
                    <div>
                      <p className="text-red-900 font-bold">Requires Prescription</p>
                      <p className="text-red-700 text-sm mt-1">
                        You'll need to upload a valid prescription with doctor's signature during checkout.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              {medicine.quantity > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Quantity
                  </label>
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-3 text-gray-600 hover:bg-gray-100 transition"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={medicine.quantity}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(medicine.quantity, parseInt(e.target.value) || 1)))}
                      className="flex-1 px-4 py-3 text-center border-0 focus:outline-none"
                    />
                    <button
                      onClick={() => setQuantity(Math.min(medicine.quantity, quantity + 1))}
                      className="px-4 py-3 text-gray-600 hover:bg-gray-100 transition"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Add to Cart Button */}
              <div className="space-y-3">
                <button
                  onClick={addToCart}
                  disabled={medicine.quantity === 0}
                  className={`w-full py-4 px-6 rounded-lg text-white font-bold text-lg transition ${
                    medicine.quantity > 0
                      ? 'bg-green-600 hover:bg-green-700 active:scale-95'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  {medicine.quantity > 0 ? '🛒 Add to Cart' : 'Out of Stock'}
                </button>
                <Link
                  to="/cart"
                  className="w-full py-4 px-6 rounded-lg text-blue-600 font-bold text-lg border-2 border-blue-600 hover:bg-blue-50 text-center transition block"
                >
                  View Cart
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="mt-8 grid grid-cols-2 gap-4 pt-6 border-t">
                <div className="text-center">
                  <p className="text-2xl mb-1">✓</p>
                  <p className="text-xs text-gray-600">100% Genuine</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl mb-1">🚚</p>
                  <p className="text-xs text-gray-600">Fast Delivery</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl mb-1">🔒</p>
                  <p className="text-xs text-gray-600">Secure</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl mb-1">💬</p>
                  <p className="text-xs text-gray-600">24/7 Support</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">About this Medicine</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {medicine.description || 'Premium quality medicine sourced from certified suppliers.'}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Delivery Info</h3>
            <ul className="text-gray-600 text-sm space-y-2">
              <li>✓ Fast delivery in 30 minutes</li>
              <li>✓ Free delivery on orders above $50</li>
              <li>✓ Order tracking available</li>
              <li>✓ Easy returns within 7 days</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicineDetailsPage;
