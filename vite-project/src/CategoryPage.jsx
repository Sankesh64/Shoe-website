import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';
import axios from 'axios';
import ProductCard from './ProductCard';

const filtersConfig = {
  categories: ['Jordan', 'Sandal, Sliders and Flipflop', 'Tennis', 'Lifestyle', 'Basketball', 'Training and Gym', 'Skateboarding', 'Walking', 'Athletics'],
  gender: ['men', 'women', 'kids'],
  price: ['Under $50', '$50 - $100', '$100 - $150', 'Over $150'],
  size: ['7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '12.5', '13', '14'],
};

const CategoryPage = () => {
  const { categoryId } = useParams();
  const [showFilters, setShowFilters] = useState(true);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  // activeGender is a sidebar filter — only used when no categoryId from URL
  const [activeGender, setActiveGender] = useState('');

  useEffect(() => {
    // Reset sidebar gender filter when route changes
    setActiveGender('');
    fetchProducts('');
  }, [categoryId]);

  useEffect(() => {
    // Only re-fetch when sidebar gender filter changes after initial mount
    if (activeGender !== '') {
      fetchProducts(activeGender);
    }
  }, [activeGender]);

  const fetchProducts = async (genderOverride = activeGender) => {
    setLoading(true);
    try {
      let url = `http://localhost:5000/api/products?pageSize=40`;
      if (categoryId && !['all', 'new', 'jordan', 'sale'].includes(categoryId)) {
        url += `&category=${categoryId}`;
      } else if (genderOverride) {
        url += `&category=${genderOverride}`;
      }
      
      const { data } = await axios.get(url);
      setProducts(data.data);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-6 sm:px-12 pt-8 pb-24">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-8 sticky top-[88px] bg-[var(--bg)] z-10 py-4 border-b border-white/5">
        <h1 className="text-3xl font-bold text-[var(--text)] capitalize">
          {categoryId || activeGender || 'All Collections'} ({products.length})
        </h1>
        
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-[15px] font-medium text-[var(--text)] hover:text-[var(--accent)] transition-colors"
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
            <SlidersHorizontal size={20} />
          </button>
        </div>
      </div>

      <div className="flex gap-12 items-start relative">
        {/* Sidebar Filters */}
        <aside 
          className={`shrink-0 w-[240px] sticky top-[160px] max-h-[calc(100vh-160px)] overflow-y-auto pr-4 filter-scrollbar transition-all duration-300 ${showFilters ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10 hidden'}`}
        >
          {/* Gender */}
          <div className="py-6 border-b border-white/10">
            <h3 className="text-sm uppercase tracking-widest font-bold text-[var(--text)] mb-6">Gender</h3>
            <div className="flex flex-col gap-4">
              {filtersConfig.gender.map(g => (
                <label key={g} className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={activeGender === g}
                    onChange={() => setActiveGender(activeGender === g ? '' : g)}
                  />
                  <div className={`w-5 h-5 rounded-md border transition-all flex items-center justify-center ${activeGender === g ? 'bg-[var(--accent)] border-[var(--accent)]' : 'border-white/20 group-hover:border-white/40'}`}>
                    {activeGender === g && <div className="w-2 h-2 bg-white rounded-sm" />}
                  </div>
                  <span className={`text-[15px] capitalize ${activeGender === g ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>{g}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="py-6 border-b border-white/10">
            <h3 className="text-sm uppercase tracking-widest font-bold text-[var(--text)] mb-6">Categories</h3>
            <div className="flex flex-col gap-3">
              {filtersConfig.categories.map(cat => (
                <button key={cat} className="text-left text-[14px] text-white/50 hover:text-[var(--accent)] transition-colors py-1">
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Price */}
          <div className="py-6">
            <h3 className="text-sm uppercase tracking-widest font-bold text-[var(--text)] mb-6">Price Range</h3>
            <div className="flex flex-col gap-3">
              {filtersConfig.price.map(p => (
                <label key={p} className="flex items-center gap-3 cursor-pointer group">
                  <div className="w-5 h-5 rounded-md border border-white/20 group-hover:border-white/40 transition-colors" />
                  <span className="text-[14px] text-white/60">{p}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-square bg-white/5 rounded-2xl" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="py-20 text-center glass rounded-3xl">
              <p className="text-xl opacity-50">No products found in this category.</p>
            </div>
          ) : (
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 transition-all duration-300 ${!showFilters && 'lg:grid-cols-4'}`}>
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .filter-scrollbar::-webkit-scrollbar { width: 3px; }
        .filter-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}} />
    </div>
  );
};

export default CategoryPage;
