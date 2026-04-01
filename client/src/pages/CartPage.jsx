import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const CartPage = () => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(storedCart);
  }, []);

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) return;
    const updatedCart = cart.map(item =>
      item._id === id ? { ...item, quantity } : item
    );
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const removeItem = (id) => {
    const updatedCart = cart.filter(item => item._id !== id);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    toast.success('Item removed');
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
        {cart.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 mb-4 text-lg">Your cart is empty</p>
            <Link to="/" className="text-blue-600 hover:underline font-semibold">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-8">
              {cart.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-lg shadow p-4 md:p-6 hover:shadow-md transition"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                    {/* Image */}
                    {item.image && (
                      <div className="sm:col-span-2 flex justify-center sm:justify-start">
                        <img
                          src={`http://localhost:3000/${item.image}`}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded"
                        />
                      </div>
                    )}

                    {/* Item Details */}
                    <div className={item.image ? 'sm:col-span-4' : 'sm:col-span-6'}>
                      <h3 className="font-semibold text-gray-900 text-base md:text-lg mb-1">
                        {item.name}
                      </h3>
                      <p className="text-green-600 font-bold text-lg">${item.price}</p>
                      {item.requiresPrescription && (
                        <p className="text-red-600 text-xs mt-1">⚠️ Requires Prescription</p>
                      )}
                    </div>

                    {/* Quantity Controls */}
                    <div className="sm:col-span-2">
                      <div className="flex items-center border border-gray-300 rounded">
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="px-3 py-2 text-gray-600 hover:bg-gray-100 flex-1"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item._id, parseInt(e.target.value) || 1)}
                          className="w-12 text-center border-0 focus:outline-none"
                        />
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="px-3 py-2 text-gray-600 hover:bg-gray-100 flex-1"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="sm:col-span-2">
                      <p className="text-right font-bold text-gray-900 text-sm md:text-base">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>

                    {/* Remove Button */}
                    <div className="sm:col-span-2">
                      <button
                        onClick={() => removeItem(item._id)}
                        className="w-full bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition font-medium text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Card */}
            <div className="bg-white rounded-lg shadow p-6 md:p-8 sticky bottom-0 md:relative">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-lg font-bold border-b pb-4">
                  <span>Subtotal:</span>
                  <span className="text-gray-900">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-xs md:text-sm text-gray-600">
                  <span>Items:</span>
                  <span>{cart.reduce((sum, item) => sum + item.quantity, 0)} items</span>
                </div>
                <Link
                  to="/checkout"
                  className="w-full bg-blue-600 text-white py-3 md:py-4 rounded-lg hover:bg-blue-700 text-center font-bold transition text-base block"
                >
                  Proceed to Checkout
                </Link>
                <Link
                  to="/"
                  className="w-full border-2 border-gray-300 text-gray-700 py-3 md:py-4 rounded-lg hover:bg-gray-50 text-center font-semibold transition text-base block"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartPage;