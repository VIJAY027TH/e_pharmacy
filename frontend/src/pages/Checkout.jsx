import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { orderService } from '../services/orderService';
import { prescriptionService } from '../services/prescriptionService';
import { MapPin, CreditCard, FileText, CheckCircle2, ShieldCheck, AlertCircle, ShoppingBag, ArrowRight } from 'lucide-react';

export const Checkout = () => {
  const { cart, totalPrice, clearCart } = useCart();
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState(user?.address || '');
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [userPrescriptions, setUserPrescriptions] = useState([]);
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdOrder, setCreatedOrder] = useState(null);

  const rxItemsInCart = cart?.items?.filter((item) => item.medicine.requiresPrescription) || [];
  const hasRxItem = rxItemsInCart.length > 0;

  useEffect(() => {
    if (user?.address) {
      setShippingAddress(user.address);
    } else {
      authService
        .getProfile()
        .then((data) => {
          if (data?.address) {
            setShippingAddress(data.address);
            if (updateUser) updateUser(data);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    if (!cart?.items?.length) {
      setUserPrescriptions([]);
      setSelectedPrescriptionId('');
      return;
    }

    prescriptionService.getUserPrescriptions().then((data) => {
      // Keep approved prescriptions that cover every prescription-only item.
      const validApproved = data.filter((p) => {
        const isApproved = p.status === 'APPROVED';
        if (!isApproved) return false;
        return rxItemsInCart.every((cartItem) =>
          p.medicines?.some((coveredMed) => String(coveredMed.id) === String(cartItem.medicine.id))
        );
      });

      setUserPrescriptions(validApproved);
      setSelectedPrescriptionId((previous) => {
        if (validApproved.some((p) => String(p.id) === previous)) return previous;
        return hasRxItem && validApproved.length > 0 ? String(validApproved[0].id) : '';
      });
    }).catch(() => {
      setUserPrescriptions([]);
      setSelectedPrescriptionId('');
    });
  }, [cart]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!shippingAddress.trim()) {
      setError('Shipping address is required');
      return;
    }

    if (hasRxItem && !selectedPrescriptionId) {
      setError('One or more items require an APPROVED prescription. Please select an approved prescription.');
      return;
    }

    setLoading(true);
    try {
      const order = await orderService.createOrder({
        shippingAddress,
        paymentMethod,
        prescriptionId: selectedPrescriptionId ? Number(selectedPrescriptionId) : null,
      });
      setCreatedOrder(order);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!cart || !cart.items || cart.items.length === 0) {
    if (createdOrder) return null; // Modal will handle display
    return <div className="text-center py-20 text-warm-400 font-medium text-sm">Your cart is empty.</div>;
  }

  return (
    <div className="customer-page checkout-page max-w-4xl mx-auto py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-warm-900 tracking-tight">Order Checkout</h1>
        <p className="text-xs text-warm-500 mt-1 font-medium">Review order summary, delivery details, and payment method</p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <div className="bg-white p-6 rounded-3xl border border-warm-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-warm-900 text-base flex items-center gap-2">
              <MapPin className="h-5 w-5 text-sage-600" /> Shipping & Delivery Address
            </h3>
            <textarea
              rows={3}
              required
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="Enter complete delivery street address, city, state and zip code..."
              className="w-full p-3.5 bg-warm-50 border border-warm-200 rounded-2xl text-xs font-medium outline-none focus:border-sage-500 focus:bg-white transition"
            />
          </div>

          {/* Prescription Selection if Rx item in cart */}
          {(hasRxItem || userPrescriptions.length > 0) && (
            <div className="bg-amber-50 p-6 rounded-3xl border border-amber-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-amber-900">
                <FileText className="h-5 w-5 text-gold-600" />
                <h3 className="font-extrabold text-base">{hasRxItem ? 'Select Approved Prescription' : 'Prescription (optional)'}</h3>
              </div>

              {userPrescriptions.length === 0 ? (
                <div className="bg-white p-4 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-2">
                  <p className="font-bold text-rose-700">No Valid Prescription Covers Your Cart!</p>
                  <p className="font-medium text-amber-800">
                    No approved, non-expired prescription explicitly covers all prescription-required medicine(s) in your cart ({rxItemsInCart.map((i) => i.medicine.name).join(', ')}).
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/prescriptions')}
                    className="mt-1 bg-gold-500 text-white font-bold px-4 py-2 rounded-xl text-xs hover:bg-gold-600 transition shadow-sm"
                  >
                    Upload / Check Prescriptions
                  </button>
                </div>
              ) : (
                <>
                  {!hasRxItem && <p className="text-xs text-amber-800">Selecting a prescription is optional for standard quantities. Any quantity above the no-prescription limit requires an approved prescription that authorizes that medicine.</p>}
                  <select
                    value={selectedPrescriptionId}
                    onChange={(e) => setSelectedPrescriptionId(e.target.value)}
                    className="w-full p-3.5 bg-white border border-amber-300 rounded-2xl text-xs text-warm-900 font-bold outline-none focus:ring-2 focus:ring-sage-500"
                  >
                    <option value="">{hasRxItem ? '-- Select an Approved Prescription --' : 'No prescription selected'}</option>
                    {userPrescriptions.map((p) => {
                      const coveredNames = p.medicines ? p.medicines.map((m) => m.name).join(', ') : 'All';
                      return (
                        <option key={p.id} value={p.id}>
                          Prescription #{p.id} (Covers: {coveredNames})
                        </option>
                      );
                    })}
                  </select>
                </>
              )}
            </div>
          )}

          {/* Payment Method */}
          <div className="bg-white p-6 rounded-3xl border border-warm-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-warm-900 text-base flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-sage-600" /> Payment Method
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'CARD', label: 'Credit / Debit Card' },
                { id: 'UPI', label: 'UPI / QR Code' },
                { id: 'NET_BANKING', label: 'Net Banking' },
                { id: 'WALLET', label: 'Digital Wallet' },
              ].map((pm) => (
                <label
                  key={pm.id}
                  className={`p-4 rounded-2xl border cursor-pointer text-xs font-bold flex items-center justify-between transition ${
                    paymentMethod === pm.id
                      ? 'border-sage-600 bg-sage-50 text-sage-800'
                      : 'border-warm-200 text-warm-700 hover:bg-warm-50'
                  }`}
                >
                  <span>{pm.label}</span>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={pm.id}
                    checked={paymentMethod === pm.id}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-sage-600 focus:ring-sage-500"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Sidebar */}
        <div className="bg-white p-6 rounded-3xl border border-warm-200 shadow-sm h-fit space-y-6">
          <h3 className="font-extrabold text-warm-900 text-base">Items Summary ({cart.items.length})</h3>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {cart.items.map((item) => (
              <div key={item.id} className="flex justify-between text-xs text-warm-700 border-b border-warm-100 pb-2">
                <div>
                  <p className="font-bold text-warm-900">{item.medicine.name}</p>
                  <p className="text-warm-400">Qty: {item.quantity}</p>
                </div>
                <span className="font-black text-warm-900">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-xs border-t border-warm-100 pt-4">
            <div className="flex justify-between font-black text-base text-warm-900">
              <span>Total Payable</span>
              <span className="text-sage-700">${totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || (hasRxItem && !selectedPrescriptionId)}
            className={`w-full font-bold py-3.5 rounded-xl transition shadow-sm flex items-center justify-center gap-2 text-xs ${
              loading || (hasRxItem && !selectedPrescriptionId)
                ? 'bg-warm-100 text-warm-400 cursor-not-allowed border border-warm-200'
                : 'bg-sage-600 text-white hover:bg-sage-700 active:scale-95'
            }`}
          >
            {loading ? 'Processing Order...' : 'Confirm & Place Order'}
          </button>
        </div>
      </form>

      {/* Order Success Modal */}
      {createdOrder && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-warm-200 shadow-xl text-center space-y-5">
            <div className="p-4 bg-sage-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center text-sage-600">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div>
              <h3 className="text-2xl font-black text-warm-900 tracking-tight">Thank You for Your Order!</h3>
              <p className="text-xs text-warm-500 mt-1 font-medium">Your order has been received successfully.</p>
            </div>

            <div className="bg-warm-50 p-4 rounded-2xl border border-warm-200 space-y-1 text-xs text-warm-700 font-bold">
              <p>Order #{createdOrder.id}</p>
              <p className="text-sm font-black text-sage-700">Total: ${Number(createdOrder.totalAmount || totalPrice).toFixed(2)}</p>
            </div>

            <div className="flex justify-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setCreatedOrder(null);
                  navigate('/orders');
                }}
                className="px-5 py-2.5 text-xs font-bold text-white bg-sage-600 hover:bg-sage-700 rounded-xl transition shadow-sm"
              >
                View My Orders
              </button>
              <button
                type="button"
                onClick={() => {
                  setCreatedOrder(null);
                  navigate('/medicines');
                }}
                className="px-5 py-2.5 text-xs font-bold text-warm-700 bg-warm-100 hover:bg-warm-200 rounded-xl transition border border-warm-200"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
