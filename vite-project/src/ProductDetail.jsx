import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from './context/AppContext';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart, toggleWishlist, wishlist, user } = useApp();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/products/${id}`);
        setProduct(data.data);
        if (data.data.sizes?.length) setSelectedSize(data.data.sizes[0].size);
        if (data.data.colors?.length) setSelectedColor(data.data.colors[0].name);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:5000/api/products/${id}/reviews`, {
        rating: reviewRating,
        comment: reviewComment
      });
      alert('Review submitted!');
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting review');
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!product) return <div className="h-screen flex items-center justify-center">Product not found.</div>;

  const inWishlist = wishlist.some(item => item._id === product._id);
  const imageUrl = product.images?.[0]?.url || product.image || 'https://placehold.co/600x600/111827/FFFFFF?text=No+Image';

  return (
    <div className="container mx-auto px-6 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        {/* Product Image */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative aspect-square glass rounded-3xl overflow-hidden group"
        >
          <img src={imageUrl} alt={product.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
          <button 
            onClick={() => toggleWishlist(product)}
            className="absolute top-6 right-6 h-12 w-12 glass rounded-full flex items-center justify-center hover:bg-white/10"
          >
            <span className={`text-2xl ${inWishlist ? 'text-red-500' : 'text-white'}`}>
              {inWishlist ? '❤️' : '🤍'}
            </span>
          </button>
        </motion.div>

        {/* Product Info */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col justify-center"
        >
          <span className="text-sm uppercase tracking-widest text-[var(--accent)] font-bold mb-2">{product.brand}</span>
          <h1 className="text-5xl font-bold mb-4">{product.name}</h1>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <span key={i}>{i < Math.round(product.rating) ? '★' : '☆'}</span>
              ))}
            </div>
            <span className="opacity-50 text-sm">({product.numReviews} Reviews)</span>
          </div>

          <p className="text-3xl font-mono mb-8 font-bold">${product.price}</p>
          <p className="text-[rgba(241,241,238,0.7)] leading-relaxed mb-10">{product.description}</p>

          <div className="space-y-8 mb-10">
            {/* Sizes */}
            <div>
              <h3 className="text-sm uppercase tracking-widest opacity-50 mb-4">Select Size</h3>
              <div className="flex flex-wrap gap-3">
                {(product.sizes?.length ? product.sizes.map(s => s.size) : ['6', '7', '8', '9', '10', '11']).map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`h-12 w-16 rounded-xl flex items-center justify-center font-bold transition-all ${selectedSize === size ? 'bg-[var(--accent)] text-white shadow-lg shadow-blue-500/20' : 'glass hover:bg-white/5'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div>
              <h3 className="text-sm uppercase tracking-widest opacity-50 mb-4">Select Color</h3>
              <div className="flex gap-4">
                {(product.colors?.length ? product.colors : [{name: 'Black', hex: '#000000'}]).map(c => (
                  <button
                    key={c.name}
                    onClick={() => setSelectedColor(c.name)}
                    className={`h-10 w-10 rounded-full border-2 transition-all ${selectedColor === c.name ? 'border-[var(--accent)] scale-125' : 'border-transparent'}`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          </div>

          <button 
            onClick={() => addToCart(product, selectedSize, selectedColor)}
            className="w-full h-16 rounded-2xl bg-white text-black font-bold text-lg hover:bg-[var(--accent)] hover:text-white transition-all transform hover:-translate-y-1 active:scale-95"
          >
            Add to Bag
          </button>
        </motion.div>
      </div>

      {/* Reviews Section */}
      <div className="mt-24">
        <h2 className="text-3xl font-bold mb-12">Customer Reviews</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Review Form */}
          <div className="glass rounded-3xl p-8 h-fit">
            <h3 className="text-xl font-bold mb-6">Write a Review</h3>
            {user ? (
              <form onSubmit={handleReviewSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs uppercase tracking-widest opacity-50 mb-2">Rating</label>
                  <select 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)]"
                    value={reviewRating}
                    onChange={(e) => setReviewRating(e.target.value)}
                  >
                    <option value="5" className="bg-slate-900">5 - Excellent</option>
                    <option value="4" className="bg-slate-900">4 - Great</option>
                    <option value="3" className="bg-slate-900">3 - Good</option>
                    <option value="2" className="bg-slate-900">2 - Poor</option>
                    <option value="1" className="bg-slate-900">1 - Terrible</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest opacity-50 mb-2">Comment</label>
                  <textarea 
                    required
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)]"
                    placeholder="Tell us what you think..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                  />
                </div>
                <button type="submit" className="w-full py-4 rounded-xl bg-[var(--accent)] font-bold">Submit Review</button>
              </form>
            ) : (
              <p className="opacity-60">Please login to write a review.</p>
            )}
          </div>

          {/* Review List */}
          <div className="lg:col-span-2 space-y-6">
            {(product.reviews || []).length === 0 ? (
              <div className="glass rounded-3xl p-10 text-center opacity-50">No reviews yet. Be the first!</div>
            ) : (
              product.reviews.map((r, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="glass rounded-3xl p-8"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-[var(--accent)] flex items-center justify-center font-bold">
                        {r.name[0]}
                      </div>
                      <div>
                        <p className="font-bold">{r.name}</p>
                        <p className="text-xs opacity-50">{new Date(r.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <span key={i}>{i < r.rating ? '★' : '☆'}</span>
                      ))}
                    </div>
                  </div>
                  <p className="opacity-80 italic">"{r.comment}"</p>
                  <div className="mt-4 flex items-center gap-2 text-xs text-green-400 font-bold uppercase tracking-widest">
                    <span>✓</span> Verified Purchase
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
