import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Heart, ShoppingBag, Moon, Sun, User as UserIcon } from 'lucide-react';
import { useApp } from './context/AppContext';

const megaMenuData = {
  Men: [
    {
      title: 'Featured',
      links: ['New Arrivals', 'Bestsellers', 'Shop All Sale', 'All Conditions Gear']
    },
    {
      title: 'Shoes',
      links: ['All Shoes', 'Lifestyle', 'Jordan', 'Running', 'Basketball', 'Gym & Training', 'Tennis', 'Skateboarding', 'Sandals & Slides']
    },
    {
      title: 'Clothing',
      links: ['All Clothing', 'Tops & T-Shirts', 'Shorts', 'Pants & Leggings', 'Hoodies & Sweatshirts', 'Jackets & Gilets', 'Jerseys & Kits', 'Jordan']
    },
    {
      title: 'Shop By Sport',
      links: ['Running', 'Basketball', 'Football', 'Golf', 'Tennis & Pickleball', 'Gym & Training', 'Yoga', 'Skateboarding']
    },
    {
      title: 'Accessories & Equipment',
      links: ['All Accessories & Equipment', 'Bags & Backpacks', 'Socks', 'Hats & Headwear']
    }
  ],
  Women: [
    {
      title: 'Featured',
      links: ['New Arrivals', 'Bestsellers', 'Shop All Sale', 'Member Exclusive']
    },
    {
      title: 'Shoes',
      links: ['All Shoes', 'Lifestyle', 'Running', 'Gym & Training', 'Tennis', 'Sandals & Slides', 'Platform Shoes']
    },
    {
      title: 'Clothing',
      links: ['All Clothing', 'Sports Bras', 'Tops & T-Shirts', 'Leggings', 'Shorts', 'Hoodies', 'Jackets', 'Skirts & Dresses']
    },
    {
      title: 'Shop By Sport',
      links: ['Running', 'Yoga', 'Gym & Training', 'Tennis', 'Golf', 'Dance', 'Basketball']
    },
    {
      title: 'Accessories & Equipment',
      links: ['All Accessories & Equipment', 'Bags & Backpacks', 'Socks', 'Hats & Headwear', 'Hair Bands']
    }
  ],
};

const navLinks = [
  { label: 'New & Featured', href: '/category/new' },
  { label: 'Men', href: '/category/men', hasMegaMenu: true },
  { label: 'Women', href: '/category/women', hasMegaMenu: true },
  { label: 'Kids', href: '/category/kids', hasMegaMenu: true },
  { label: 'Jordan', href: '/category/jordan' },
  { label: 'Sale', href: '/category/sale' },
];

const Navigation = () => {
  const { cart, wishlist, user, logout } = useApp();
  const [theme, setTheme] = useState('dark');
  const [hoveredLink, setHoveredLink] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || 'dark';
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    setHoveredLink(null);
    setShowProfileMenu(false);
  }, [location.pathname]);

  const currentMegaMenu = hoveredLink && megaMenuData[hoveredLink] ? megaMenuData[hoveredLink] : null;
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="fixed top-0 left-0 w-full z-50 group" onMouseLeave={() => setHoveredLink(null)}>
      <header className="relative z-20 bg-[var(--bg)] transition-colors duration-300 border-b border-transparent hover:border-[var(--border)] group-hover:bg-[var(--bg)]">
        <nav className="flex items-center justify-between px-6 sm:px-12 mx-auto max-w-[1440px] h-[88px]">
          <Link className="flex items-center gap-3 text-[var(--text)] z-30" to="/" onClick={() => setHoveredLink(null)}>
            <img alt="RoeBook Logo" className="h-10 w-auto object-contain dark:invert transition-all" src="/images/roebook-logo.png" />
          </Link>

          <ul className="hidden lg:flex items-center justify-center gap-8 text-[15px] font-medium text-[var(--text)] absolute left-1/2 -translate-x-1/2 h-full z-30">
            {navLinks.map((link) => (
              <li key={link.label} className="h-full flex items-center" onMouseEnter={() => setHoveredLink(link.hasMegaMenu ? link.label : null)}>
                <Link className="transition-colors duration-300 hover:text-[var(--accent)] border-b-2 border-transparent hover:border-[var(--text)] py-1" to={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-5 z-30">
            <div className="hidden sm:flex items-center bg-[var(--bg-secondary)] rounded-full px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors cursor-text group/search">
              <Search size={20} className="text-[var(--text)] opacity-60 mr-2 group-hover/search:opacity-100" />
              <input type="text" placeholder="Search" className="bg-transparent border-none outline-none text-[15px] w-24 focus:w-40 transition-all duration-300 text-[var(--text)]" />
            </div>
            
            <button className="text-[var(--text)] hover:text-[var(--accent)] transition-colors relative">
              <Heart size={22} />
              {wishlist.length > 0 && <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">{wishlist.length}</span>}
            </button>

            <Link to="/cart" className="text-[var(--text)] hover:text-[var(--accent)] transition-colors relative">
              <ShoppingBag size={22} />
              {cartCount > 0 && <span className="absolute -top-1 -right-2 bg-[var(--text)] text-[var(--bg)] text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">{cartCount}</span>}
            </Link>
            
            <div className="relative">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="text-[var(--text)] hover:text-[var(--accent)] transition-colors p-1"
              >
                <UserIcon size={22} />
              </button>
              
              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-4 w-48 glass rounded-2xl p-4 shadow-2xl border border-white/10"
                  >
                    {user ? (
                      <div className="flex flex-col gap-3">
                        <p className="text-xs opacity-50 uppercase tracking-widest font-bold px-2">Account</p>
                        <p className="text-sm font-bold px-2 truncate">{user.fullName}</p>
                        <Link to="/profile" className="text-sm px-2 py-2 hover:bg-white/5 rounded-lg text-blue-400 font-bold">My Profile & Orders</Link>
                        {user.role === 'admin' && (
                          <Link to="/admin" className="text-sm px-2 py-2 hover:bg-white/5 rounded-lg text-purple-400 font-bold">Admin Panel</Link>
                        )}
                        <button onClick={logout} className="text-sm px-2 py-2 text-left hover:bg-white/5 rounded-lg text-red-400">Logout</button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <p className="text-sm opacity-60 px-2 mb-2">Guest Access</p>
                        <Link to="/login" className="text-sm px-4 py-2 bg-[var(--accent)] text-white rounded-xl text-center font-bold">Login</Link>
                        <Link to="/register" className="text-sm px-4 py-2 glass text-[var(--text)] rounded-xl text-center font-bold hover:bg-white/10">Register</Link>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button onClick={toggleTheme} className="flex items-center justify-center w-9 h-9 rounded-full bg-[var(--bg-secondary)] text-[var(--text)] hover:bg-[var(--text)] hover:text-[var(--bg)] transition-all ml-1">
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {currentMegaMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="absolute top-[88px] left-0 w-full bg-[var(--bg)] border-b border-[var(--border)] overflow-hidden z-10"
          >
            <div className="mx-auto max-w-[1200px] px-12 py-10 flex justify-center gap-16">
              {currentMegaMenu.map((column, i) => (
                <div key={i} className="flex flex-col min-w-[160px]">
                  <h4 className="font-semibold text-[var(--text)] mb-4 text-[15px]">{column.title}</h4>
                  <ul className="flex flex-col gap-3">
                    {column.links.map((link, j) => (
                      <li key={j}>
                        <Link to={`/category/${hoveredLink.toLowerCase()}?filter=${encodeURIComponent(link)}`} className="text-[14px] text-[var(--text-body)] hover:text-[var(--text)] transition-colors">{link}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Navigation;
