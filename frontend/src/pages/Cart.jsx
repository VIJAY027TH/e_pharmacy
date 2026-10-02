import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { CartItem } from '../components/CartItem';
import { ShoppingBag, ArrowRight, Trash2, FileText } from 'lucide-react';

export const Cart = () => {
  const { cart, totalPrice, itemCount, clearCart, loading, cartError } = useCart();
  const navigate = useNavigate();

  const hasRxItem = cart?.items?.some((item) => item.medicine.requiresPrescription);

  if (loading) return <div className="text-center py-20 text-warm-400 font-medium text-sm">Loading cart...</div>;

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="customer-page cart-page cart-empty max-w-xl mx-auto my-16 bg-white p-12 rounded-3xl text-center border border-warm-200 shadow-sm space-y-4">
        <div className="inline-flex p-4 bg-sage-50 text-sage-600 rounded-full border border-sage-200">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-black text-warm-900 tracking-tight">Your Cart is Empty</h2>
        <p className="text-xs text-warm-500 font-medium">Looks like you haven't added any medications to your cart yet.</p>
        <Link
          to="/medicines"
          className="inline-flex items-center gap-2 bg-sage-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-sage-700 transition mt-2 text-xs shadow-sm"
        >
          Browse Medicines <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="customer-page cart-page max-w-5xl mx-auto space-y-8 py-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-warm-900 tracking-tight">Shopping Cart</h1>
          <p className="text-xs text-warm-500 mt-1 font-medium">{itemCount} item(s) in your active cart</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 border border-rose-200 bg-rose-50 px-3 py-1.5 rounded-xl transition"
        >
          <Trash2 className="h-3.5 w-3.5" /> Clear Cart
        </button>
      </div>

      {cartError && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium leading-relaxed text-rose-800" role="alert">{cartError}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-3">
          {cart.items.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}
        </div>

        {/* Summary Card */}
        <div className="bg-white p-6 rounded-3xl border border-warm-200 shadow-sm h-fit space-y-6">
          <h3 className="font-extrabold text-warm-900 text-lg">Order Summary</h3>

          {hasRxItem && (
            <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl flex items-start gap-2.5 text-amber-900 text-xs">
              <FileText className="h-5 w-5 text-gold-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold text-amber-900">Prescription Verification Required</p>
                <p className="text-amber-800 mt-0.5">Your cart contains Rx medications. You will select an approved prescription during checkout.</p>
              </div>
            </div>
          )}

          <div className="space-y-3 text-xs text-warm-500 border-t border-b border-warm-100 py-4 font-medium">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold text-warm-900">${totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Delivery</span>
              <span className="font-bold text-sage-700">FREE</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-warm-100 text-base font-black text-warm-900">
              <span>Total Amount</span>
              <span className="text-sage-700">${totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full bg-sage-600 text-white font-bold py-3.5 rounded-xl hover:bg-sage-700 transition shadow-sm flex items-center justify-center gap-2 text-xs"
          >
            Proceed to Checkout <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
