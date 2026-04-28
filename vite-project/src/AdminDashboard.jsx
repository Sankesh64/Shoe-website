import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useApp, API_BASE } from './context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDashboard = () => {
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState('products');
  const [stats, setStats] = useState({ products: 0, users: 0, orders: 0 });

  if (user?.role !== 'admin') {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-bold text-[var(--accent)]">403</h1>
        <p className="mt-4 text-xl opacity-70">Unauthorized. Admin eyes only.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto min-h-screen px-6 py-10">
      <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Command Center</h1>
          <p className="mt-2 text-[rgba(241,241,238,0.6)]">Manage products, users, and track orders from one place.</p>
        </div>
        <div className="flex gap-4">
          <div className="glass flex flex-col rounded-2xl px-6 py-3">
            <span className="text-xs uppercase tracking-widest opacity-50">Role</span>
            <span className="font-bold text-[var(--accent)] uppercase">Administrator</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 md:gap-4">
        {['products', 'users', 'orders'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative rounded-full px-8 py-3 text-sm font-medium transition-all duration-300 ${
              activeTab === tab 
              ? 'bg-[var(--accent)] text-white' 
              : 'glass hover:bg-[rgba(255,255,255,0.05)]'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="mt-10">
        <AnimatePresence mode="wait">
          {activeTab === 'products' && <ProductAdmin key="products" />}
          {activeTab === 'users' && <UserAdmin key="users" />}
          {activeTab === 'orders' && <OrderAdmin key="orders" />}
        </AnimatePresence>
      </div>
    </div>
  );
};

const ProductAdmin = () => {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/products?pageSize=100`);
      setProducts(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`${API_BASE}/products/${id}`, { withCredentials: true });
        setProducts(products.filter((p) => p._id !== id));
      } catch (err) {
        alert('Failed to delete product. Make sure you are logged in as admin.');
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="glass rounded-3xl p-8"
    >
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Inventory Management</h2>
        <button 
          onClick={() => { setEditingProduct(null); setShowModal(true); }}
          className="rounded-xl bg-white px-6 py-2.5 text-black font-semibold hover:bg-opacity-90 transition-all"
        >
          Add New Product
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[rgba(255,255,255,0.1)] pb-4 text-sm font-medium opacity-50">
              <th className="pb-4">Product</th>
              <th className="pb-4">Price</th>
              <th className="pb-4">Category</th>
              <th className="pb-4">Stock</th>
              <th className="pb-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
            {products.map((p) => (
              <tr key={p._id} className="group hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                <td className="py-5">
                  <div className="flex items-center gap-4">
                    {p.image ? (
                      <img src={p.image} className="h-12 w-12 rounded-lg object-cover" alt={p.name} />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-white/10 flex items-center justify-center text-xs opacity-40">No img</div>
                    )}
                    <span className="font-medium">{p.name}</span>
                  </div>
                </td>
                <td className="py-5 font-mono">${p.price}</td>
                <td className="py-5 uppercase text-xs tracking-wider opacity-70">{p.category}</td>
                <td className="py-5">
                  <span className={`rounded-full px-3 py-1 text-xs ${p.countInStock > 5 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {p.countInStock} In Stock
                  </span>
                </td>
                <td className="py-5">
                  <div className="flex gap-3">
                    <button onClick={() => { setEditingProduct(p); setShowModal(true); }} className="text-sm text-blue-400 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(p._id)} className="text-sm text-red-400 hover:underline">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Modal would go here - simplified for now */}
      {showModal && <ProductModal product={editingProduct} close={() => setShowModal(false)} refresh={fetchProducts} />}
    </motion.div>
  );
};

const ProductModal = ({ product, close, refresh }) => {
  const [formData, setFormData] = useState(product || {
    name: '', price: 0, image: '', brand: '', category: 'men', countInStock: 0, description: '', gender: 'men'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (product) {
        await axios.put(`${API_BASE}/products/${product._id}`, formData, { withCredentials: true });
      } else {
        await axios.post(`${API_BASE}/products`, formData, { withCredentials: true });
      }
      refresh();
      close();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving product. Make sure you are logged in as admin.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass w-full max-w-2xl rounded-3xl p-8 max-h-[90vh] overflow-y-auto"
      >
        <h2 className="mb-6 text-2xl font-bold">{product ? 'Update Product' : 'Create New Product'}</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm opacity-50 uppercase tracking-widest">Name</label>
            <input 
              required
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)]"
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm opacity-50 uppercase tracking-widest">Price</label>
            <input 
              required type="number"
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)]"
              value={formData.price} 
              onChange={(e) => setFormData({...formData, price: e.target.value})} 
            />
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-sm opacity-50 uppercase tracking-widest">Image URL</label>
            <input 
              required
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)]"
              value={formData.image} 
              onChange={(e) => setFormData({...formData, image: e.target.value})} 
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm opacity-50 uppercase tracking-widest">Category</label>
            <select 
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)]"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              <option value="men" className="bg-slate-900">Men</option>
              <option value="women" className="bg-slate-900">Women</option>
              <option value="kids" className="bg-slate-900">Kids</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm opacity-50 uppercase tracking-widest">Stock</label>
            <input 
              required type="number"
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)]"
              value={formData.countInStock} 
              onChange={(e) => setFormData({...formData, countInStock: e.target.value})} 
            />
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-sm opacity-50 uppercase tracking-widest">Description</label>
            <textarea 
              required rows={3}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)]"
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})} 
            />
          </div>
          <div className="flex gap-4 md:col-span-2 mt-4">
            <button type="submit" className="flex-1 rounded-xl bg-[var(--accent)] py-3 font-bold hover:brightness-110">
              {product ? 'Save Changes' : 'Create Product'}
            </button>
            <button type="button" onClick={close} className="flex-1 rounded-xl glass py-3 font-bold hover:bg-white/10">
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const UserAdmin = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await axios.get(`${API_BASE}/users`);
      setUsers(data.data);
    };
    fetchUsers();
  }, []);

  const toggleAdmin = async (u) => {
    const newRole = u.role === 'admin' ? 'user' : 'admin';
    try {
      await axios.put(`${API_BASE}/users/${u._id}/role`, { role: newRole });
      setUsers(users.map(user => user._id === u._id ? {...user, role: newRole} : user));
    } catch (err) {
      alert('Error updating role');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-3xl p-8">
      <h2 className="mb-8 text-2xl font-bold">User Management</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/10 text-sm opacity-50">
              <th className="pb-4">Name</th>
              <th className="pb-4">Email</th>
              <th className="pb-4">Role</th>
              <th className="pb-4">Joined</th>
              <th className="pb-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="py-4">{u.fullName}</td>
                <td className="py-4">{u.email}</td>
                <td className="py-4">
                  <span className={`px-2 py-1 rounded text-xs ${u.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {u.role.toUpperCase()}
                  </span>
                </td>
                <td className="py-4 text-sm opacity-60">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="py-4">
                  <button 
                    onClick={() => toggleAdmin(u)}
                    className="text-xs text-[var(--accent)] hover:underline"
                  >
                    {u.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

const OrderAdmin = () => {
  const [orders, setOrders] = useState([]);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/orders`, { withCredentials: true });
      setOrders(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRefund = async (orderId) => {
    if (!window.confirm("Are you sure you want to refund this order?")) return;
    
    setProcessingId(orderId);
    try {
      await axios.post(`${API_BASE}/orders/${orderId}/refund`, {}, { withCredentials: true });
      alert("Refund initiated successfully");
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to initiate refund");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-3xl p-8">
      <h2 className="mb-8 text-2xl font-bold">Recent Orders</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/10 text-sm opacity-50">
              <th className="pb-4">Order ID</th>
              <th className="pb-4">Customer</th>
              <th className="pb-4">Total</th>
              <th className="pb-4">Status</th>
              <th className="pb-4">Payment</th>
              <th className="pb-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o._id} className="border-b border-white/5">
                <td className="py-4 font-mono text-xs">{o._id}</td>
                <td className="py-4">{o.user?.fullName || 'Guest'}</td>
                <td className="py-4 font-bold">${o.totalPrice}</td>
                <td className="py-4">
                  <span className={`px-2 py-1 rounded text-xs ${o.status === 'delivered' ? 'bg-green-500/20 text-green-400' : o.status === 'refunded' ? 'bg-purple-500/20 text-purple-400' : o.status === 'cancelled' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {o.status.toUpperCase()}
                  </span>
                </td>
                <td className="py-4">
                  <span className={`px-2 py-1 rounded text-xs ${o.isRefunded ? 'bg-purple-500/20 text-purple-400' : o.isPaid ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {o.isRefunded ? 'Refunded' : o.isPaid ? 'Paid' : 'Pending'}
                  </span>
                </td>
                <td className="py-4">
                  {o.isPaid && !o.isRefunded && (
                    <button 
                      onClick={() => handleRefund(o._id)}
                      disabled={processingId === o._id}
                      className="text-xs text-red-400 hover:underline disabled:opacity-50"
                    >
                      {processingId === o._id ? 'Processing...' : 'Refund'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
