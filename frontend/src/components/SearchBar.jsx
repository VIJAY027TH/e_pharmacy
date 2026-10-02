import React, { useState } from 'react';
import { Search } from 'lucide-react';

export const SearchBar = ({ onSearch, categories = [] }) => {
  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ query, categoryId: categoryId || undefined });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 bg-white p-3 rounded-2xl shadow-sm border border-warm-200">
      <div className="flex-1 flex items-center px-4 bg-warm-50 rounded-xl border border-warm-200 focus-within:border-sage-500 focus-within:bg-white transition">
        <Search className="h-5 w-5 text-warm-400 mr-2" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search medicine name, brand, composition or ailment..."
          className="w-full bg-transparent py-3 text-sm outline-none text-warm-900 placeholder-warm-400 font-medium"
        />
      </div>

      <select
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        className="px-4 py-3 bg-warm-50 border border-warm-200 text-xs font-bold text-warm-800 rounded-xl outline-none focus:border-sage-500"
      >
        <option value="">All Categories</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>

      <button
        type="submit"
        className="bg-sage-600 text-white font-bold text-xs px-6 py-3 rounded-xl hover:bg-sage-700 transition shadow-sm"
      >
        Search
      </button>
    </form>
  );
};
