import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export const MedicineCard = ({ medicine }) => {
  const { addToCart, cartError, cartErrorMedicineId } = useCart();
  const { isAuthenticated, isAdmin } = useAuth();

  const handleAdd = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please log in to add items to cart');
      return;
    }
    addToCart(medicine.id, 1);
  };

  const isOutOfStock = medicine.stockQuantity <= 0;
  const isLowStock = medicine.stockQuantity > 0 && medicine.stockQuantity <= 5;

  return (
    <div className="medicine-product-card bg-white rounded-2xl shadow-sm border border-warm-200 overflow-hidden hover:shadow-md hover:border-sage-300 transition duration-200 flex flex-col h-full group">
      <Link to={`/medicines/${medicine.id}`} className="relative block h-48 bg-warm-50 overflow-hidden">
        <img
          src={medicine.imageUrl || '/products/daily-wellness.svg'}
          alt={medicine.name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        />
        {medicine.requiresPrescription && (
          <span className="absolute top-2.5 right-2.5 bg-gold-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm">
            <FileText className="h-3 w-3" /> Rx Required
          </span>
        )}

        {/* Stock Status Badge */}
        <span
          className={`absolute top-2.5 left-2.5 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border backdrop-blur-sm ${
            isOutOfStock
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : isLowStock
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-sage-50 text-sage-700 border-sage-200'
          }`}
        >
          {isOutOfStock ? 'Out of Stock' : isLowStock ? `Low Stock (${medicine.stockQuantity})` : 'In Stock'}
        </span>
      </Link>

      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div className="flex flex-col flex-1">
          {/* Category Badge - Clean, balanced category pill with consistent vertical spacing */}
          <div className="min-h-[40px] flex items-center mb-1.5">
            <span className="medicine-card-category inline-block text-[11px] font-bold text-sage-800 uppercase tracking-wider bg-sage-50 border border-sage-200/90 px-2.5 py-1 rounded-md text-left">
              {medicine.category?.name || 'General'}
            </span>
          </div>

          {/* Medicine Title - Two-line fixed minimum height with smooth wrapping */}
          <div className="min-h-[44px] flex items-start">
            <Link
              to={`/medicines/${medicine.id}`}
              className="font-extrabold text-warm-900 text-sm sm:text-base leading-snug hover:text-sage-600 line-clamp-2 transition"
              title={medicine.name}
            >
              {medicine.name}
            </Link>
          </div>

          {/* Brand & Dosage Metadata */}
          <p className="text-xs text-warm-500 font-medium mt-1 truncate">
            Brand: {medicine.brand || 'Generic'} {medicine.dosage ? `• ${medicine.dosage}` : ''}
          </p>

          {/* Description */}
          <p className="text-xs text-warm-500 mt-2 line-clamp-2 leading-relaxed flex-1">
            {medicine.description}
          </p>
        </div>

        <div className="mt-4 pt-3.5 border-t border-warm-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-warm-400 block">Price</span>
            <span className="text-lg font-black text-warm-900">₹{Number(medicine.price || 0).toFixed(2)}</span>
          </div>

          {!isAdmin && (
            <button
              onClick={handleAdd}
              disabled={isOutOfStock}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm ${
                isOutOfStock
                  ? 'bg-warm-100 text-warm-400 cursor-not-allowed border border-warm-200'
                  : 'bg-sage-600 text-white hover:bg-sage-700 active:scale-95'
              }`}
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              {isOutOfStock ? 'Unavailable' : 'Add to Cart'}
            </button>
          )}
        </div>
        {cartError && String(cartErrorMedicineId) === String(medicine.id) && (
          <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs font-medium leading-relaxed text-rose-800" role="alert">
            {cartError}
          </p>
        )}
      </div>
    </div>
  );
};
