import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Cart = () => {
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
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>
      {cart.length === 0 ? (
        <p className="text-center text-gray-500">Your cart is empty</p>
      ) : (
        <>
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item._id} className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {item.image && (
                    <img
                      src={`http://localhost:3000/${item.image}`}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-gray-600">${item.price}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item._id, parseInt(e.target.value))}
                    className="w-16 p-2 border border-gray-300 rounded"
                  />
                  <button
                    onClick={() => removeItem(item._id)}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Total: ${total.toFixed(2)}</h2>
            <Link
              to="/checkout"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 text-lg"
            >
              Proceed to Checkout
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;