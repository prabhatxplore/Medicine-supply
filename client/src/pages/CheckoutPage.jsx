import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
  const [cart, setCart] = useState([]);
  const [prescription, setPrescription] = useState(null);
  const [prescriptionFileName, setPrescriptionFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(storedCart);
  }, []);

  const handlePrescriptionChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only JPEG, PNG, WebP images and PDF files are allowed');
        setPrescription(null);
        setPrescriptionFileName('');
        return;
      }
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        setPrescription(null);
        setPrescriptionFileName('');
        return;
      }
      setPrescription(file);
      setPrescriptionFileName(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const items = cart.map(item => ({
      medicineId: item._id,
      quantity: item.quantity,
    }));

    const formData = new FormData();
    formData.append('items', JSON.stringify(items));
    if (prescription) {
      formData.append('prescription', prescription);
    }

    try {
      const response = await fetch('http://localhost:3000/api/orders', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (response.ok) {
        localStorage.removeItem('cart');
        toast.success('Order placed successfully!');
        navigate('/orders');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to place order');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const requiresPrescription = cart.some(item => item.requiresPrescription);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Checkout</h1>
        
        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Summary</h2>
          {cart.length === 0 ? (
            <p className="text-gray-600">Your cart is empty</p>
          ) : (
            <>
              {cart.map((item) => (
                <div key={item._id} className="flex justify-between items-center mb-3 border-b pb-3">
                  <div>
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    {item.requiresPrescription && (
                      <p className="text-xs text-red-600 mt-1">⚠️ Requires Prescription</p>
                    )}
                  </div>
                  <span className="font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between text-xl font-bold mt-6 pt-4 border-t-2">
                <span>Total Amount</span>
                <span className="text-green-600">${total.toFixed(2)}</span>
              </div>
            </>
          )}
        </div>

        {/* Prescription Upload Section */}
        {requiresPrescription && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-6">
            <div className="flex items-start mb-3">
              <span className="text-red-600 text-2xl mr-3">⚠️</span>
              <div>
                <p className="text-red-900 font-bold text-lg mb-2">Prescription Required</p>
                <p className="text-red-700 mb-2">Some items in your order require a valid prescription with doctor's clear signature.</p>
                <p className="text-red-600 text-sm">Please upload a clear image or PDF of your prescription with the doctor's signature.</p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-white rounded border border-red-200">
              <label className="block mb-3">
                <p className="text-gray-700 font-semibold mb-2">Upload Prescription *</p>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={handlePrescriptionChange}
                  className="w-full px-4 py-2 border-2 border-dashed border-red-300 rounded-lg focus:outline-none focus:border-red-500 cursor-pointer hover:bg-gray-50"
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  📄 Accepted formats: JPEG, PNG, WebP, PDF (Max 5MB)
                </p>
              </label>

              {prescriptionFileName && (
                <div className="flex items-center p-2 bg-green-50 border border-green-200 rounded mt-3">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-green-700 text-sm">{prescriptionFileName}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Checkout Form */}
        <form onSubmit={handleSubmit}>
          <button
            type="submit"
            disabled={loading || cart.length === 0 || (requiresPrescription && !prescription)}
            className={`w-full py-3 px-6 rounded-lg text-white text-lg font-semibold transition-all ${
              loading || cart.length === 0 || (requiresPrescription && !prescription)
                ? 'bg-gray-400 cursor-not-allowed opacity-50'
                : 'bg-green-600 hover:bg-green-700 active:scale-95'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin mr-2">⏳</span>
                Placing Order...
              </span>
            ) : (
              'Place Order'
            )}
          </button>
        </form>

        {cart.length === 0 && (
          <div className="text-center mt-8 p-6 bg-blue-50 rounded-lg">
            <p className="text-blue-700 mb-4">Your cart is empty</p>
            <button
              onClick={() => navigate('/')}
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;