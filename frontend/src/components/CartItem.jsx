import React from 'react';
import { Minus, Plus, Trash2, FileText } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const medicine = item.medicine;

  return (
    <div className="cart-line-item flex items-center justify-between p-4 bg-white rounded-2xl border border-warm-200 shadow-sm mb-3">
      <div className="flex items-center space-x-4 min-w-0">
        <img
          src={medicine.imageUrl || '/products/daily-wellness.svg'}
          alt={medicine.name}
          className="w-16 h-16 object-cover rounded-xl bg-warm-50 border border-warm-200"
        />
        <div>
          <h4 className="font-extrabold text-warm-900 text-sm">{medicine.name}</h4>
          <p className="text-xs text-warm-500 font-medium">Brand: {medicine.brand || 'Generic'} • ₹{Number(medicine.price || 0).toFixed(2)} per pack</p>
          <p className="text-xs text-warm-500">{medicine.unitsPerPack || 1} {medicine.unitType || 'units'} per pack</p>
          {medicine.requiresPrescription && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gold-700 bg-gold-50 border border-gold-300/60 px-2 py-0.5 rounded-md mt-1">
              <FileText className="h-3 w-3" /> Rx Required
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center border border-warm-200 rounded-xl overflow-hidden bg-warm-50">
          <button
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
            aria-label={`Decrease ${medicine.name} quantity`}
            className="p-1.5 hover:bg-warm-100 text-warm-700 transition"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="px-3 text-xs font-black text-warm-900">{item.quantity}</span>
          <button
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            aria-label={`Increase ${medicine.name} quantity`}
            className="p-1.5 hover:bg-warm-100 text-warm-700 transition"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="text-right min-w-[80px]">
          <span className="text-sm font-black text-warm-900">
            ₹{(item.price * item.quantity).toFixed(2)}
          </span>
        </div>

        <button
          onClick={() => removeFromCart(item.id)}
          aria-label={`Remove ${medicine.name} from cart`}
          className="p-2 text-warm-400 hover:text-rose-600 transition"
          title="Remove item"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
