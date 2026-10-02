import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { medicineService } from '../services/medicineService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, FileText, Star, Plus, Minus, ShieldCheck, ArrowLeft, AlertCircle } from 'lucide-react';

export const MedicineDetails = () => {
  const { id } = useParams();
  const [medicine, setMedicine] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const { addToCart, cartError, cartErrorMedicineId } = useCart();
  const { isAuthenticated } = useAuth();

  const fetchDetails = async () => {
    try {
      const [med, revs] = await Promise.all([
        medicineService.getMedicineById(id),
        medicineService.getReviews(id),
      ]);
      setMedicine(med);
      setReviews(revs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      alert('Please log in to add items to cart');
      return;
    }
    addToCart(medicine.id, quantity);
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please log in to write a review');
      return;
    }
    try {
      await medicineService.addReview({ medicineId: Number(id), rating, comment });
      setComment('');
      fetchDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post review');
    }
  };

  if (loading) return <div className="text-center py-20 text-warm-400 font-medium text-sm">Loading details...</div>;
  if (!medicine) return <div className="text-center py-20 text-warm-400 font-medium text-sm">Medicine not found.</div>;

  return (
    <div className="customer-page medicine-detail-page space-y-10 py-6 max-w-5xl mx-auto">
      <Link to="/medicines" className="inline-flex items-center text-xs font-bold text-sage-700 hover:text-sage-800 gap-1.5 transition">
        <ArrowLeft className="h-4 w-4" /> Back to Catalog
      </Link>

      <div className="bg-white rounded-3xl p-8 border border-warm-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="bg-warm-50 rounded-2xl overflow-hidden flex items-center justify-center p-6 border border-warm-200">
          <img
            src={medicine.imageUrl || '/products/daily-wellness.svg'}
            alt={medicine.name}
            className="w-full max-h-96 object-contain rounded-xl"
          />
        </div>

        <div className="space-y-6">
          <div>
            <span className="bg-sage-100 text-sage-800 text-[11px] font-extrabold px-3 py-1 rounded-lg uppercase tracking-wider">
              {medicine.category?.name || 'General'}
            </span>
            <h1 className="text-3xl font-black text-warm-900 mt-2.5">{medicine.name}</h1>
            <p className="text-xs font-medium text-warm-500 mt-1">
              Brand: <span className="text-warm-800 font-bold">{medicine.brand || 'Generic'}</span> • Composition: <span className="text-warm-800 font-bold">{medicine.composition || 'Standard'}</span>
            </p>
          </div>

          <div className="text-3xl font-black text-warm-900">
            ${Number(medicine.price || 0).toFixed(2)}
          </div>

          {medicine.requiresPrescription && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3 text-amber-900">
              <FileText className="h-5 w-5 text-gold-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-extrabold text-amber-900">Doctor Prescription Required (Rx)</p>
                <p className="mt-0.5 text-amber-800">This medication requires an approved, unexpired prescription before order processing.</p>
              </div>
            </div>
          )}

          <div className="border-t border-b border-warm-100 py-4 space-y-2 text-xs text-warm-500">
            <p><span className="font-bold text-warm-800">Dosage:</span> {medicine.dosage || 'As directed by physician'}</p>
            <p><span className="font-bold text-warm-800">Target Ailment:</span> {medicine.ailment || 'General Healthcare'}</p>
            <p><span className="font-bold text-warm-800">Availability:</span>{' '}
              <span className={`font-extrabold ${medicine.stockQuantity > 0 ? 'text-sage-700' : 'text-rose-600'}`}>
                {medicine.stockQuantity > 0 ? `${medicine.stockQuantity} packs available` : 'Out of Stock'}
              </span>
            </p>
            <p><span className="font-bold text-warm-800">Pack contents:</span> {medicine.unitsPerPack || 1} {medicine.unitType || 'units'} per pack</p>
          </div>

          <p className="text-xs text-warm-500 leading-relaxed font-normal">{medicine.description}</p>

          {cartError && String(cartErrorMedicineId) === String(medicine.id) && (
            <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium leading-relaxed text-rose-800" role="alert">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{cartError}</span>
            </div>
          )}

          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center border border-warm-200 rounded-xl overflow-hidden bg-warm-50">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-3 hover:bg-warm-100 text-warm-700 transition"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="px-4 font-black text-warm-900 text-sm">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(medicine.stockQuantity, quantity + 1))}
                className="p-3 hover:bg-warm-100 text-warm-700 transition"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={medicine.stockQuantity <= 0}
              className={`flex-1 font-bold py-3.5 px-6 rounded-xl transition shadow-sm flex items-center justify-center gap-2 text-xs ${
                medicine.stockQuantity <= 0
                  ? 'bg-warm-100 text-warm-400 cursor-not-allowed border border-warm-200'
                  : 'bg-sage-600 text-white hover:bg-sage-700 active:scale-95'
              }`}
            >
              <ShoppingCart className="h-4 w-4" /> Add to Cart
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-white rounded-3xl p-8 border border-warm-200 shadow-sm space-y-6">
        <h3 className="text-xl font-black text-warm-900">Customer Reviews & Feedback</h3>

        {/* Add Review Form */}
        {isAuthenticated && (
          <form onSubmit={handleAddReview} className="bg-warm-50 p-6 rounded-2xl border border-warm-200 space-y-4">
            <h4 className="font-extrabold text-warm-900 text-xs uppercase tracking-wider">Write a Review</h4>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-warm-500">Rating:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-gold-500 focus:outline-none"
                  >
                    <Star className={`h-5 w-5 ${star <= rating ? 'fill-gold-500 text-gold-500' : 'text-warm-300'}`} />
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this medication..."
              className="w-full p-3 bg-white border border-warm-200 rounded-xl text-xs font-medium outline-none focus:border-sage-500"
            />

            <button
              type="submit"
              className="bg-sage-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs hover:bg-sage-700 transition"
            >
              Submit Review
            </button>
          </form>
        )}

        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-xs text-warm-500">No customer reviews yet for this product.</p>
          ) : (
            reviews.map((rev) => (
              <div key={rev.id} className="p-4 rounded-xl border border-warm-200 bg-warm-50/50 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-xs text-warm-900">{rev.user?.name || 'Customer'}</span>
                  <div className="flex text-gold-500">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-gold-500 text-gold-500" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-warm-500 mt-1 font-normal">{rev.comment}</p>
                <span className="text-[10px] text-warm-400 block pt-1">{new Date(rev.createdAt).toLocaleDateString()}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
