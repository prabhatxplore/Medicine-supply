import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const OrderCard = ({ order, onClaim, onPick, onDeliver, mode }) => {
  const shortId = useMemo(() => order._id?.slice(-8)?.toUpperCase(), [order._id]);
  const createdAt = useMemo(() => {
    try {
      return new Date(order.createdAt).toLocaleString();
    } catch {
      return "";
    }
  }, [order.createdAt]);

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-white shadow-md overflow-hidden">
      <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500">Order</div>
            <div className="text-lg font-extrabold text-slate-900">#{shortId}</div>
            <div className="text-xs text-slate-500 mt-1">{createdAt}</div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700">
              Status: {order.status}
            </span>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
              Delivery: {order.deliveryStatus || "Unassigned"}
            </span>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Customer</div>
            <div className="text-sm font-semibold text-slate-900">{order.user?.name || "N/A"}</div>
            <div className="text-sm text-slate-700 break-all">{order.user?.email || "N/A"}</div>
            <div className="text-sm text-slate-700 mt-1">{order.user?.phoneNumber || ""}</div>
            <div className="text-sm text-slate-600 mt-2">{order.user?.address || ""}</div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Items</div>
            <div className="space-y-2">
              {(order.items || []).map((it, idx) => (
                <div key={idx} className="flex items-start justify-between gap-3">
                  <div className="text-sm text-slate-900 font-semibold">
                    {it.medicine?.name || "Unknown"}
                    <div className="text-xs text-slate-500 font-normal">Qty: {it.quantity}</div>
                  </div>
                  <div className="text-sm font-bold text-emerald-700">
                    NPR {(it.price * it.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900">Total</span>
              <span className="text-lg font-extrabold text-emerald-700">
                NPR {Number(order.totalAmount || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:justify-end">
          {mode === "available" && (
            <button
              onClick={() => onClaim(order._id)}
              className="w-full sm:w-auto bg-emerald-600 text-white px-5 py-2 rounded-xl font-semibold hover:bg-emerald-700"
            >
              Claim order
            </button>
          )}

          {mode === "mine" && order.deliveryStatus === "Assigned" && (
            <button
              onClick={() => onPick(order._id)}
              className="w-full sm:w-auto bg-blue-600 text-white px-5 py-2 rounded-xl font-semibold hover:bg-blue-700"
            >
              Mark picked up
            </button>
          )}

          {mode === "mine" && (order.deliveryStatus === "Picked" || order.deliveryStatus === "Assigned") && (
            <button
              onClick={() => onDeliver(order._id)}
              className="w-full sm:w-auto bg-teal-600 text-white px-5 py-2 rounded-xl font-semibold hover:bg-teal-700"
            >
              Mark delivered
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const VolunteerDashboardPage = () => {
  const navigate = useNavigate();
  const [available, setAvailable] = useState([]);
  const [mine, setMine] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [meRes, availableRes, mineRes] = await Promise.all([
        fetch("https://medicine-supply.onrender.com/api/auth/me", { credentials: "include" }),
        fetch("https://medicine-supply.onrender.com/api/orders/volunteer/available", { credentials: "include" }),
        fetch("https://medicine-supply.onrender.com/api/orders/volunteer/mine", { credentials: "include" }),
      ]);

      if (!meRes.ok) {
        navigate("/volunteer/login");
        return;
      }

      const me = await meRes.json();
      if (me.role !== "volunteer") {
        toast.error("Volunteer access required");
        navigate("/");
        return;
      }

      const [availableData, mineData] = await Promise.all([availableRes.json(), mineRes.json()]);
      setAvailable(Array.isArray(availableData) ? availableData : []);
      setMine(Array.isArray(mineData) ? mineData : []);
    } catch (err) {
      toast.error("Failed to load volunteer orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("https://medicine-supply.onrender.com/api/auth/logout", { method: "POST", credentials: "include" });
      toast.success("Logged out");
      navigate("/");
    } catch {
      toast.error("Logout failed");
    }
  };

  const claimOrder = async (orderId) => {
    try {
      const res = await fetch(`https://medicine-supply.onrender.com/api/orders/${orderId}/claim`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to claim order");
        return;
      }
      toast.success("Order claimed");
      fetchAll();
    } catch {
      toast.error("Network error");
    }
  };

  const pickOrder = async (orderId) => {
    try {
      const res = await fetch(`https://medicine-supply.onrender.com/api/orders/${orderId}/pick`, {
        method: "PUT",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to mark picked");
        return;
      }
      toast.success("Marked as picked up");
      fetchAll();
    } catch {
      toast.error("Network error");
    }
  };

  const deliverOrder = async (orderId) => {
    try {
      const res = await fetch(`https://medicine-supply.onrender.com/api/orders/${orderId}/deliver`, {
        method: "PUT",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to mark delivered");
        return;
      }
      toast.success("Delivered");
      fetchAll();
    } catch {
      toast.error("Network error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      <nav className="bg-white/90 backdrop-blur-xl border-b border-slate-100 shadow-sm p-4 mb-8 sticky top-0 z-10">
        <div className="container mx-auto flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
            Volunteer Dashboard
          </h1>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Link to="/" className="text-sm sm:text-base text-gray-700 hover:text-emerald-700 font-semibold">
              Shop
            </Link>
            <button
              onClick={fetchAll}
              className="text-sm sm:text-base text-slate-700 font-semibold bg-slate-100 px-3 py-1.5 rounded-lg"
            >
              Refresh
            </button>
            <button
              onClick={handleLogout}
              className="text-sm sm:text-base text-red-600 hover:text-red-700 font-semibold bg-red-50 px-3 py-1.5 rounded-lg"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto p-4 space-y-10">
        <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white shadow-lg">
          <p className="text-emerald-100 text-sm mb-2">Operations</p>
          <h2 className="text-3xl font-bold mb-1">Pickup & Deliver</h2>
          <p className="text-emerald-100">
            Claim processed orders, pick medicines from shop, and deliver to customers.
          </p>
        </div>

        <section className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">Available orders</h3>
              <p className="text-sm text-slate-600">Processed orders waiting for a volunteer.</p>
            </div>
            <div className="text-sm text-slate-600">
              Count: <span className="font-bold text-slate-800">{available.length}</span>
            </div>
          </div>

          {available.length === 0 ? (
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-white shadow-md p-6 text-slate-600">
              No available orders right now.
            </div>
          ) : (
            <div className="space-y-4">
              {available.map((order) => (
                <OrderCard key={order._id} order={order} onClaim={claimOrder} mode="available" />
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">My assigned orders</h3>
              <p className="text-sm text-slate-600">Orders you claimed (pick up → deliver).</p>
            </div>
            <div className="text-sm text-slate-600">
              Count: <span className="font-bold text-slate-800">{mine.length}</span>
            </div>
          </div>

          {mine.length === 0 ? (
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-white shadow-md p-6 text-slate-600">
              You have no assigned orders.
            </div>
          ) : (
            <div className="space-y-4">
              {mine.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  onPick={pickOrder}
                  onDeliver={deliverOrder}
                  mode="mine"
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default VolunteerDashboardPage;

