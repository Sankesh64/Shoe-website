import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useApp, API_BASE } from './context/AppContext';

const CartPage = () => {
  const { cart, removeFromCart, setCart, user } = useApp();
  const [isCheckingOut, setIsCheckingOut] = React.useState(false);

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const shipping = subtotal > 200 ? 0 : 15;
  const total = subtotal + shipping;

  const updateQuantity = (productId, size, color, delta) => {
    setCart(prev => prev.map(item => {
      if (item.product._id === productId && item.size === size && item.color === color) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleCheckout = async () => {
    if (!user) {
      alert("Please login to checkout");
      return;
    }

    setIsCheckingOut(true);
    try {
      const orderData = {
        orderItems: cart.map(item => ({
          product: item.product._id,
          name: item.product.name,
          image: item.product.image || item.product.images?.[0]?.url || '',
          size: item.size,
          color: item.color || 'Default',
          price: item.product.price,
          quantity: item.quantity
        })),
        shippingAddress: {
          fullName: user.fullName || "Test User",
          address: "123 Main St",
          city: "New York",
          state: "NY",
          postalCode: "10001",
          country: "US",
          phone: "9999999999"
        },
        paymentMethod: "Razorpay",
        itemsPrice: subtotal,
        shippingPrice: shipping,
        taxPrice: 0,
        totalPrice: total
      };

      const { data: dbOrderResponse } = await axios.post(`${API_BASE}/orders`, orderData, { withCredentials: true });
      const orderId = dbOrderResponse.data._id;

      const { data: rzpOrderResponse } = await axios.post(`${API_BASE}/orders/${orderId}/razorpay`, {}, { withCredentials: true });
      const { id: rzpOrderId, amount, currency, keyId } = rzpOrderResponse.data;

      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: "RoeBook Studio",
        description: "Premium Footwear Purchase",
        order_id: rzpOrderId,
        handler: async function (response) {
          try {
            const verifyRes = await axios.post(`${API_BASE}/orders/${orderId}/razorpay/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            }, { withCredentials: true });
            
            if (verifyRes.data.success) {
              alert("Payment Successful! Order placed securely.");
              setCart([]);
            }
          } catch (error) {
            console.error(error);
            alert("Payment verification failed.");
          }
        },
        prefill: {
          name: user.fullName,
          email: user.email,
          contact: "9999999999"
        },
        theme: {
          color: "#0066FF"
        }
      };
      
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response){
        alert("Payment failed! " + response.error.description);
      });
      rzp.open();

    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Error initiating checkout");
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-6 py-24 flex flex-col items-center text-center">
        <h1 className="text-4xl font-bold mb-6">Your Bag is Empty</h1>
        <p className="opacity-60 mb-10 max-w-md">Looks like you haven't added anything to your bag yet. Start browsing our premium collection.</p>
        <Link to="/" className="px-10 py-4 bg-white text-black font-bold rounded-2xl hover:bg-[var(--accent)] hover:text-white transition-all">
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-12">Your Bag</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence>
            {cart.map((item, index) => (
              <motion.div 
                key={`${item.product._id}-${item.size}-${item.color}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="glass rounded-3xl p-6 flex flex-col sm:flex-row gap-6"
              >
                <div className="h-32 w-32 rounded-2xl overflow-hidden shrink-0">
                  <img src={item.product.image || item.product.images?.[0]?.url || ''} className="h-full w-full object-cover" alt={item.product.name} />
                </div>
                
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold">{item.product.name}</h3>
                      <p className="opacity-60 text-sm">{item.product.category} • Size {item.size} • {item.color}</p>
                    </div>
                    <p className="text-xl font-mono font-bold">${item.product.price}</p>
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center glass rounded-xl px-2 py-1">
                      <button onClick={() => updateQuantity(item.product._id, item.size, item.color, -1)} className="h-8 w-8 hover:bg-white/10 rounded-lg">-</button>
                      <span className="w-10 text-center font-bold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product._id, item.size, item.color, 1)} className="h-8 w-8 hover:bg-white/10 rounded-lg">+</button>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.product._id, item.size, item.color)}
                      className="text-sm text-red-400 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="glass rounded-3xl p-8 sticky top-[100px]">
            <h2 className="text-2xl font-bold mb-8">Summary</h2>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between opacity-70">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between opacity-70">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="border-t border-white/10 pt-4 flex justify-between text-xl font-bold">
                <span>Total</span>
                <span className="text-[var(--accent)]">${total.toFixed(2)}</span>
              </div>
            </div>
            <button 
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="w-full py-5 bg-[var(--accent)] text-white font-bold rounded-2xl hover:brightness-110 transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCheckingOut ? 'Processing...' : 'Checkout with Razorpay'}
            </button>
            <div className="mt-6 flex items-center justify-center gap-2 text-xs opacity-40 uppercase tracking-widest">
              <span>🔒</span> Secure Checkout
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
