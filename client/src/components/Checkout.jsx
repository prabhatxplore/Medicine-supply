import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Checkout = () => {
  const [cart, setCart] = useState([]);
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(storedCart);
  }, []);

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
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
        {cart.map((item) => (
          <div key={item._id} className="flex justify-between mb-2">
            <span>{item.name} x {item.quantity}</span>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <hr className="my-4" />
        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
      {requiresPrescription && (
        <div className="bg-yellow-100 p-4 rounded-lg mb-6">
          <p className="text-yellow-800">Some items require a prescription. Please upload it.</p>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPrescription(e.target.files[0])}
            className="mt-2"
            required
          />
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <button
          type="submit"
          disabled={loading || (requiresPrescription && !prescription)}
          className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 text-lg disabled:opacity-50"
        >
          {loading ? 'Placing Order...' : 'Place Order'}
        </button>
      </form>
    </div>
  );
};

export default Checkout;