import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/orders/admin/all', {
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

  const updateStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:3000/api/orders/${orderId}/status`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success('Order status updated');
        fetchOrders();
      } else {
        toast.error('Failed to update status');
      }
    } catch (err) {
      toast.error('Network error');
    }
  };

  const filteredOrders = filter === 'All' 
    ? orders 
    : orders.filter(o => o.status === filter);

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md p-4 mb-8">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Pharmacy Admin</h1>
          <div className="space-x-4">
            <a href="/admin" className="text-gray-700 hover:text-blue-600 font-semibold">Dashboard</a>
            <a href="/admin/medicines" className="text-gray-700 hover:text-blue-600 font-semibold">Medicines</a>
            <a href="/" className="text-gray-700 hover:text-blue-600 font-semibold">Logout</a>
          </div>
        </div>
      </nav>

      <div className="container mx-auto p-4">
        <h2 className="text-3xl font-bold mb-8">Manage Orders</h2>

        <div className="mb-6 flex space-x-2">
          {['All', 'Pending', 'Processed', 'Delivered'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              {status} ({orders.filter(o => status === 'All' ? true : o.status === status).length})
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <div key={order._id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Order ID</p>
                  <p className="font-semibold">{order._id.slice(-6)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Customer Email</p>
                  <p className="font-semibold">{order.user?.email || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="font-semibold text-green-600">${order.totalAmount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-semibold">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="mb-4 p-4 bg-gray-100 rounded">
                <h4 className="font-semibold mb-2">Items:</h4>
                <ul className="space-y-1">
                  {order.items.map((item, index) => (
                    <li key={index} className="text-sm">
                      {item.medicine?.name || 'Unknown'} x {item.quantity} @ ${item.price} each
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                  order.status === 'Processed' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.status}
                </span>

                <select
                  value={order.status}
                  onChange={(e) => updateStatus(order._id, e.target.value)}
                  className="p-2 border border-gray-300 rounded"
                >
                  <option value="Pending">Pending</option>
                  <option value="Processed">Processed</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>

              {order.prescription && (
                <div className="mt-4 text-sm">
                  <p className="text-gray-600">Prescription provided</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <p className="text-center text-gray-500 mt-10">No orders found</p>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;