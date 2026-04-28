import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';

const AppContext = createContext();

const API_BASE = 'http://localhost:5000/api';

// Configure axios for credentials
axios.defaults.withCredentials = true;

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  // Track whether initial load is complete before syncing
  const isMounted = useRef(false);

  // Initialize: Check if logged in and load local storage for guest
  useEffect(() => {
    const initApp = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/auth/profile`);
        if (data.success) {
          setUser(data.data);
          setCart(data.data.cart || []);
          setWishlist(data.data.wishlist || []);
        }
      } catch (err) {
        // Guest user - load from localStorage
        const localCart = localStorage.getItem('roebook_cart');
        const localWishlist = localStorage.getItem('roebook_wishlist');
        if (localCart) {
          try { setCart(JSON.parse(localCart)); } catch {}
        }
        if (localWishlist) {
          try { setWishlist(JSON.parse(localWishlist)); } catch {}
        }
      } finally {
        setLoading(false);
        isMounted.current = true;
      }
    };
    initApp();
  }, []);

  // Sync Cart with backend if logged in — skip on initial mount
  useEffect(() => {
    if (!isMounted.current) return;
    if (user) {
      axios.post(`${API_BASE}/users/cart`, { cart }).catch(console.error);
    } else {
      localStorage.setItem('roebook_cart', JSON.stringify(cart));
    }
  }, [cart, user]);

  // Sync Wishlist with backend if logged in — skip on initial mount
  useEffect(() => {
    if (!isMounted.current) return;
    if (user) {
      axios.post(`${API_BASE}/users/wishlist`, { wishlist }).catch(console.error);
    } else {
      localStorage.setItem('roebook_wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist, user]);

  const addToCart = (product, size, color) => {
    setCart((prev) => {
      const exists = prev.find(
        (item) => item.product._id === product._id && item.size === size && item.color === color
      );
      if (exists) {
        return prev.map((item) =>
          item.product._id === product._id && item.size === size && item.color === color
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, size, color, quantity: 1 }];
    });
  };

  const removeFromCart = (productId, size, color) => {
    setCart((prev) =>
      prev.filter(
        (item) => !(item.product._id === productId && item.size === size && item.color === color)
      )
    );
  };

  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      const exists = prev.find((item) => item._id === product._id);
      if (exists) {
        return prev.filter((item) => item._id !== product._id);
      }
      return [...prev, product];
    });
  };

  const login = async (email, password) => {
    const { data } = await axios.post(`${API_BASE}/auth/login`, { email, password });
    if (data.success) {
      setUser(data.data);
      // Merge guest cart/wishlist with user's could be added here
      setCart(data.data.cart || []);
      setWishlist(data.data.wishlist || []);
      return true;
    }
    return false;
  };

  const logout = async () => {
    await axios.post(`${API_BASE}/auth/logout`);
    setUser(null);
    setCart([]);
    setWishlist([]);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        cart,
        wishlist,
        loading,
        addToCart,
        removeFromCart,
        toggleWishlist,
        login,
        logout,
        setCart,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
