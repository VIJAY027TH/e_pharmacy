import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { Package, Clock, CheckCircle2, Truck, AlertCircle, XCircle } from 'lucide-react';
import { parseServerDate } from '../utils/dateUtils';

export const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [deliveries, setDeliveries] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const data = await orderService.getUserOrders();
      setOrders(data);
      const deliveryResults = await Promise.allSettled(
        data.map(async (order) => [order.id, await orderService.getDeliveryTracking(order.id)])
      );
      setDeliveries(Object.fromEntries(
        deliveryResults
          .filter((result) => result.status === 'fulfilled')
          .map((result) => result.value)
      ));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await orderService.cancelOrder(orderId);
      alert('Order cancelled successfully.');
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="bg-sage-100 text-sage-800 border border-sage-200 text-[11px] font-extrabold px-3 py-1 rounded-full uppercase">DELIVERED</span>;
      case 'CANCELLED':
        return <span className="bg-rose-50 text-rose-800 border border-rose-200 text-[11px] font-extrabold px-3 py-1 rounded-full uppercase">CANCELLED</span>;
      case 'SHIPPED':
      case 'OUT_FOR_DELIVERY':
        return <span className="bg-sage-50 text-sage-700 border border-sage-200 text-[11px] font-extrabold px-3 py-1 rounded-full uppercase">{status}</span>;
      case 'CONFIRMED':
        return <span className="bg-gold-50 text-gold-800 border border-gold-200 text-[11px] font-extrabold px-3 py-1 rounded-full uppercase">CONFIRMED</span>;
      default:
        return <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-extrabold px-3 py-1 rounded-full uppercase">{status}</span>;
    }
  };

  if (loading) return <div className="text-center py-20 text-warm-400 font-medium text-sm">Loading order history...</div>;

  return (
    <div className="customer-page orders-page max-w-4xl mx-auto space-y-8 py-6">
      <div>
        <h1 className="text-3xl font-black text-warm-900 tracking-tight">My Orders</h1>
        <p className="text-xs text-warm-500 mt-1 font-medium">Track order fulfillment status and purchase history</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl text-center border border-warm-200 shadow-sm space-y-3">
          <Package className="h-12 w-12 text-warm-300 mx-auto" />
          <h3 className="text-lg font-extrabold text-warm-900">No Orders Placed Yet</h3>
          <p className="text-xs text-warm-500 font-medium">You haven't placed any pharmaceutical orders with PharmaVital yet.</p>
          <Link to="/medicines" className="inline-block mt-2 bg-sage-600 text-white font-bold px-6 py-2.5 rounded-xl text-xs hover:bg-sage-700 transition shadow-sm">
            Shop Medicines Now
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="customer-order-card bg-white p-6 rounded-3xl border border-warm-200 shadow-sm space-y-4">
              <div className="flex flex-wrap justify-between items-center pb-4 border-b border-warm-100 gap-2">
                <div>
                  <span className="text-[10px] text-warm-400 uppercase font-extrabold block">Order ID</span>
                  <span className="font-black text-warm-900 text-base">#{order.id}</span>
                </div>
                <div>
                  <span className="text-[10px] text-warm-400 uppercase font-extrabold block">Date</span>
                  <span className="text-xs text-warm-700 font-bold">{parseServerDate(order.createdAt)?.toLocaleDateString() || '—'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-warm-400 uppercase font-extrabold block">Total</span>
                  <span className="text-sm font-black text-sage-700">₹{Number(order.totalAmount || 0).toFixed(2)}</span>
                </div>
                <div>{getStatusBadge(order.orderStatus)}</div>
              </div>

              {/* Order Items Preview */}
              <div className="space-y-2">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-xs text-warm-700">
                    <span className="font-semibold text-warm-900">{item.medicine?.name} (x{item.quantity})</span>
                    <span className="font-black text-warm-900">₹{Number(item.subtotal || 0).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-warm-100 flex justify-between items-center flex-wrap gap-2">
                <span className="text-xs text-warm-500 font-medium">
                  Shipping Address: <span className="font-bold text-warm-800">{order.shippingAddress}</span>
                </span>

                {deliveries[order.id]?.estimatedDelivery && (
                  <span className="text-xs text-warm-500 font-medium">
                    Estimated delivery:{' '}
                    <span className="font-bold text-warm-800">
                      {parseServerDate(deliveries[order.id].estimatedDelivery)?.toLocaleString([], {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      }) || '—'}
                    </span>
                  </span>
                )}

                {['PENDING', 'CONFIRMED', 'PROCESSING'].includes(order.orderStatus) && (
                  <button
                    onClick={() => handleCancelOrder(order.id)}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl transition"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
