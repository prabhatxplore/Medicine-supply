import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://medicine-supply.onrender.com/api/orders', {
        credentials: 'include',
      });
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Order History</h1>
      {orders.length === 0 ? (
        <p className="text-center text-gray-500">No orders yet</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Order #{order._id.slice(-6)}</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                  order.status === 'Processed' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.status}
                </span>
              </div>
              <div className="space-y-2 mb-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{item.medicine.name} x {item.quantity}</span>
                    <span>NPR {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>NPR {order.totalAmount.toFixed(2)}</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Ordered on {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;