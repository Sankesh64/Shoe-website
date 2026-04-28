import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import ProductCard from './ProductCard';
import { API_BASE } from './context/AppContext';

const FeaturesSection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/products?pageSize=3`);
        setProducts(data.data);
      } catch (err) {
        console.error('Error fetching featured products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  useEffect(() => {
    if (products.length === 0) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = sectionRef.current.querySelectorAll('.animate-on-scroll');
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, [products]);

  return (
    <section ref={sectionRef} className="py-24 sm:py-32 bg-[var(--bg)]" id="shop">
      <div className="mx-auto max-w-[1440px] px-6 sm:px-12">
        <div className="animate-on-scroll fade-up text-center mb-16 sm:mb-24">
          <h2 className="text-[40px] font-bold text-[var(--text)] mb-4 tracking-tight">
            Elite Selection
          </h2>
          <p className="text-lg text-[var(--text-body)] max-w-2xl mx-auto">
            Experience the pinnacle of footwear technology and luxury design.
            Handpicked for the modern trendsetter.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="aspect-square bg-white/5 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product, index) => (
              <div
                key={product._id}
                className="animate-on-scroll fade-up"
                style={{ transitionDelay: `${index * 0.15}s` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .animate-on-scroll.fade-up {
          opacity: 0;
          transform: translateY(40px);
          transition: opacity 0.8s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .animate-on-scroll.fade-up.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}} />
    </section>
  );
};

export default FeaturesSection;
