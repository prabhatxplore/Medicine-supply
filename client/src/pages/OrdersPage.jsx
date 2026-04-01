import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/orders', {
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

  const handleViewPrescription = (prescriptionPath) => {
    if (!prescriptionPath) {
      toast.error('No prescription available');
      return;
    }
    // Open prescription in new tab
    window.open(`http://localhost:3000/${prescriptionPath}`, '_blank');
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin text-4xl">⏳</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Order History</h1>
        <p className="text-gray-600 mb-8">View all your medicine orders and prescription details</p>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg mb-4">No orders yet</p>
            <a href="/" className="text-blue-600 hover:text-blue-800 font-semibold">
              Start shopping
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition">
                {/* Order Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <p className="text-sm text-gray-600">Order ID</p>
                      <h2 className="text-2xl font-bold text-gray-900">#{order._id.slice(-8).toUpperCase()}</h2>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-1">Status</p>
                      <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'Processed' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    📅 {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString()}
                  </p>
                </div>

                {/* Order Items */}
                <div className="p-6 border-b">
                  <h3 className="font-bold text-gray-900 mb-3">Items</h3>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                          <p className="font-semibold text-gray-900">{item.medicine?.name || 'Unknown Medicine'}</p>
                          <p className="text-sm text-gray-600">Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                        </div>
                        <span className="font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Prescription Section */}
                {order.items.some(item => item.medicine?.requiresPrescription) && (
                  <div className="p-6 border-b bg-blue-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">📋</span>
                        <div>
                          <p className="font-bold text-gray-900">Prescription Status</p>
                          <p className="text-sm text-gray-600">
                            {order.prescription ? '✓ Prescription Uploaded' : 'No prescription uploaded'}
                          </p>
                        </div>
                      </div>
                      {order.prescription && (
                        <button
                          onClick={() => handleViewPrescription(order.prescription)}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium transition"
                        >
                          View Prescription
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Order Total */}
                <div className="p-6 bg-gray-50 flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-900">Total Amount</span>
                  <span className="text-3xl font-bold text-green-600">${order.totalAmount.toFixed(2)}</span>
                </div>

                {/* Expand Button */}
                <button
                  onClick={() => setSelectedOrderId(selectedOrderId === order._id ? null : order._id)}
                  className="w-full p-4 text-blue-600 hover:bg-blue-50 font-semibold text-sm transition"
                >
                  {selectedOrderId === order._id ? '▼ Hide Details' : '► Show More Details'}
                </button>

                {/* Expanded Details */}
                {selectedOrderId === order._id && (
                  <div className="p-6 bg-gray-100 border-t">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Created At</p>
                        <p className="font-semibold">{new Date(order.createdAt).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Last Updated</p>
                        <p className="font-semibold">{new Date(order.updatedAt).toLocaleString()}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-gray-600">Order ID (Full)</p>
                        <p className="font-mono text-sm break-all">{order._id}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;