import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useApp } from './context/AppContext';

const ProductCard = ({ product }) => {
  const { toggleWishlist, wishlist } = useApp();
  
  const inWishlist = wishlist.some(item => item._id === product._id);
  const imageUrl = product.images?.[0]?.url || product.image || 'https://placehold.co/600x600/111827/FFFFFF?text=No+Image';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5 }}
      className="group flex flex-col cursor-pointer"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-white/5 mb-4 rounded-2xl">
        <Link to={`/product/${product._id}`} className="absolute inset-0 z-10" />
        
        {/* Wishlist Button */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className="absolute top-3 right-3 z-20 p-2 rounded-full glass hover:bg-white text-[var(--text)] hover:text-black transition-colors shadow-sm backdrop-blur-sm"
        >
          <Heart size={18} fill={inWishlist ? 'currentColor' : 'none'} className={inWishlist ? 'text-red-500' : ''} />
        </button>

        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-col">
        <div className="flex justify-between items-start">
          <h3 className="text-[16px] font-bold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">
            {product.name}
          </h3>
          <p className="text-[16px] font-mono font-bold text-[var(--text)] ml-4 whitespace-nowrap">
            ${product.price}
          </p>
        </div>
        <p className="text-xs uppercase tracking-widest text-[var(--text-muted)] mt-1 font-medium">
          {product.brand} • {product.category}
        </p>
        <div className="flex items-center gap-1 mt-2 text-xs text-yellow-500">
          <span>★</span>
          <span className="text-[var(--text)] opacity-60">{product.rating} ({product.numReviews})</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
