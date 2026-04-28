import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useApp, API_BASE } from './context/AppContext';

const ProfilePage = () => {
  const { user, logout } = useApp();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/orders/myorders`, { withCredentials: true });
        setOrders(data.data);
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const handleRetryPayment = async (order) => {
    setProcessingId(order._id);
    try {
      const { data: rzpOrderResponse } = await axios.post(`${API_BASE}/orders/${order._id}/razorpay`, {}, { withCredentials: true });
      const { id: rzpOrderId, amount, currency, keyId } = rzpOrderResponse.data;

      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: "RoeBook Studio",
        description: "Retry Payment",
        order_id: rzpOrderId,
        handler: async function (response) {
          try {
            const verifyRes = await axios.post(`${API_BASE}/orders/${order._id}/razorpay/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            }, { withCredentials: true });
            
            if (verifyRes.data.success) {
              alert("Payment Successful! Order placed securely.");
              window.location.reload();
            }
          } catch (error) {
            console.error(error);
            alert("Payment verification failed.");
          }
        },
        prefill: {
          name: user.fullName,
          email: user.email,
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
    } catch (err) {
      alert("Failed to initiate payment retry");
    } finally {
      setProcessingId(null);
    }
  };

  const handlePrintInvoice = (order) => {
    const printWindow = window.open('', '_blank');
    const itemsHtml = order.orderItems.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.name} (${item.size}, ${item.color})</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">$${item.price}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${order._id}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { text-align: left; padding: 10px; border-bottom: 2px solid #333; }
            .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #333; padding-bottom: 20px;}
            .total { font-weight: bold; font-size: 20px; text-align: right; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 style="margin:0;">RoeBook Studio</h1>
              <p>Premium Footwear</p>
            </div>
            <div style="text-align: right;">
              <h2>INVOICE</h2>
              <p>Order ID: ${order._id}</p>
              <p>Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
              <p>Status: ${order.isPaid ? 'PAID' : 'UNPAID'}</p>
            </div>
          </div>
          
          <div>
            <h3>Billed To:</h3>
            <p>${order.shippingAddress.fullName}</p>
            <p>${order.shippingAddress.address}, ${order.shippingAddress.city}</p>
            <p>${order.shippingAddress.state}, ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div class="total">
            <p>Subtotal: $${order.itemsPrice}</p>
            <p>Shipping: $${order.shippingPrice}</p>
            <p>Total: $${order.totalPrice}</p>
          </div>

          <div style="margin-top: 50px; text-align: center; font-size: 12px; color: #666;">
            Thank you for shopping with RoeBook Studio.
          </div>
          
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (!user) return <div className="p-20 text-center text-xl">Please login</div>;

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="flex justify-between items-center mb-12 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-4xl font-bold">My Account</h1>
          <p className="opacity-60 mt-2">Welcome back, {user.fullName}</p>
        </div>
        <button onClick={logout} className="px-6 py-2 border border-red-500/50 text-red-400 rounded-xl hover:bg-red-500/10 transition-all">
          Logout
        </button>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Order History</h2>
        {loading ? (
          <p>Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="opacity-50">You haven't placed any orders yet.</p>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order._id} className="glass rounded-3xl p-6 lg:p-8 flex flex-col md:flex-row justify-between gap-6 items-center">
                <div className="flex-1 w-full space-y-2">
                  <div className="flex justify-between w-full">
                    <span className="font-mono text-xs opacity-50">ID: {order._id}</span>
                    <span className="text-xs opacity-50">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-xl font-bold">${order.totalPrice.toFixed(2)}</h3>
                  <div className="flex gap-2 text-sm mt-2">
                    <span className={`px-3 py-1 rounded-full ${order.isPaid ? 'bg-green-500/20 text-green-400' : order.status === 'refunded' ? 'bg-purple-500/20 text-purple-400' : 'bg-red-500/20 text-red-400'}`}>
                      {order.isRefunded ? 'Refunded' : order.isPaid ? 'Paid' : 'Unpaid'}
                    </span>
                    <span className={`px-3 py-1 rounded-full ${order.status === 'delivered' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                      {order.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm opacity-60 mt-4">
                    {order.orderItems.length} items • Shipping to: {order.shippingAddress.city}
                  </div>
                </div>

                <div className="flex flex-col gap-3 w-full md:w-auto shrink-0">
                  <button 
                    onClick={() => handlePrintInvoice(order)}
                    className="px-6 py-3 glass hover:bg-white/10 rounded-xl text-sm font-bold transition-all text-center"
                  >
                    View Invoice
                  </button>
                  
                  {!order.isPaid && order.status !== 'cancelled' && (
                    <button 
                      onClick={() => handleRetryPayment(order)}
                      disabled={processingId === order._id}
                      className="px-6 py-3 bg-[var(--accent)] hover:brightness-110 text-white rounded-xl text-sm font-bold transition-all text-center shadow-lg shadow-blue-500/20"
                    >
                      {processingId === order._id ? 'Processing...' : 'Pay Now'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
