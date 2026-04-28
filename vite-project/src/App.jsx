import { Routes, Route } from 'react-router-dom';
import Navigation from './Navigation';
import Footer from './Footer';
import HomePage from './HomePage';
import CategoryPage from './CategoryPage';
import ProductDetail from './ProductDetail';
import CartPage from './CartPage';
import LoginPage from './LoginPage';
import ProfilePage from './ProfilePage';
import AdminDashboard from './AdminDashboard';
import RegisterPage from './RegisterPage';
import ScrollToTop from './ScrollToTop';
import { AppProvider } from './context/AppContext';

const App = () => {
  return (
    <AppProvider>
      <div
        className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)] transition-colors duration-300 relative"
        id="top"
      >
        <ScrollToTop />
        <Navigation />

        <main className="flex-1 mt-[88px]">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/category/:categoryId" element={<CategoryPage />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </AppProvider>
  );
};

export default App;
