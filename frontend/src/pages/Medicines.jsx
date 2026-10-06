import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { medicineService } from '../services/medicineService';
import { MedicineCard } from '../components/MedicineCard';
import { SearchBar } from '../components/SearchBar';
import { Filter, SlidersHorizontal, RefreshCw } from 'lucide-react';

export const Medicines = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('categoryId') || '');
  const [rxOnly, setRxOnly] = useState(false);

  const fetchMedicines = async (params = {}) => {
    setLoading(true);
    try {
      const data = await medicineService.searchMedicines(params);
      setMedicines(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching medicines:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const cats = await medicineService.getCategories();
        setCategories(Array.isArray(cats) ? cats : []);
        const catId = searchParams.get('categoryId');
        fetchMedicines({ categoryId: catId || undefined });
      } catch (err) {
        console.error(err);
      }
    };
    init();
  }, [searchParams]);

  const handleSearch = ({ query, categoryId }) => {
    setSelectedCategory(categoryId || '');
    fetchMedicines({ query, categoryId });
  };

  const handleCategoryClick = (catId) => {
    const newCat = selectedCategory === String(catId) ? '' : String(catId);
    setSelectedCategory(newCat);
    if (newCat) {
      setSearchParams({ categoryId: newCat });
    } else {
      setSearchParams({});
    }
    fetchMedicines({ categoryId: newCat || undefined });
  };

  const filteredMedicines = (Array.isArray(medicines) ? medicines : []).filter((m) => {
    if (rxOnly && !m.requiresPrescription) return false;
    return true;
  });

  return (
    <div className="customer-page marketplace-page space-y-8 py-6">
      <div>
        <h1 className="text-3xl font-black text-warm-900 tracking-tight">Medicine Marketplace</h1>
        <p className="text-xs text-warm-500 mt-1 font-medium">Find trusted healthcare products and explore the live pharmacy catalog.</p>
      </div>

      <SearchBar onSearch={handleSearch} categories={categories} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filter Sidebar */}
        <div className="bg-white p-6 rounded-2xl border border-warm-200 shadow-sm h-fit space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-warm-100">
            <h3 className="font-extrabold text-warm-900 text-sm flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-sage-600" /> Catalog Filters
            </h3>
            <button
              onClick={() => {
                setSelectedCategory('');
                setRxOnly(false);
                setSearchParams({});
                fetchMedicines({});
              }}
              className="text-xs text-sage-700 hover:text-sage-800 font-bold flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" /> Reset
            </button>
          </div>

          <div>
            <h4 className="text-[11px] font-extrabold text-warm-400 uppercase tracking-wider mb-3">Categories</h4>
            <div className="space-y-1.5">
              <button
                onClick={() => handleCategoryClick('')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold leading-snug transition ${
                  selectedCategory === ''
                    ? 'bg-sage-100 text-sage-900 border border-sage-200/90 shadow-2xs'
                    : 'text-warm-700 hover:bg-warm-50 hover:text-warm-900'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold leading-snug transition ${
                    selectedCategory === String(cat.id)
                      ? 'bg-sage-100 text-sage-900 border border-sage-200/90 shadow-2xs'
                      : 'text-warm-700 hover:bg-warm-50 hover:text-warm-900'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-warm-100">
            <h4 className="text-[11px] font-extrabold text-warm-400 uppercase tracking-wider mb-3">Prescription Required</h4>
            <label className="flex items-center space-x-2 text-xs font-bold text-warm-800 cursor-pointer">
              <input
                type="checkbox"
                checked={rxOnly}
                onChange={(e) => setRxOnly(e.target.checked)}
                className="rounded border-warm-300 text-sage-600 focus:ring-sage-500 h-4 w-4"
              />
              <span>Prescription Only (Rx)</span>
            </label>
          </div>
        </div>

        {/* Medicines Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="text-center py-20 text-warm-400 font-medium text-sm">Loading catalog...</div>
          ) : filteredMedicines.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl text-center border border-warm-200">
              <p className="text-warm-500 text-sm font-medium">No medicines matched your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredMedicines.map((med) => (
                <MedicineCard key={med.id} medicine={med} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
