import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg-secondary)] py-16">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col px-6 sm:px-12">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4 lg:gap-8 mb-16">
          <div>
            <h4 className="font-bold text-[var(--text)] mb-6 uppercase tracking-wider text-sm">Products</h4>
            <ul className="flex flex-col gap-4 text-sm text-[var(--text-body)]">
              <li><Link to="/category/shoes" className="hover:text-[var(--text)] transition-colors">Shoes</Link></li>
              <li><Link to="/category/clothing" className="hover:text-[var(--text)] transition-colors">Clothing</Link></li>
              <li><Link to="/category/accessories" className="hover:text-[var(--text)] transition-colors">Accessories</Link></li>
              <li><Link to="/category/sale" className="hover:text-[var(--text)] transition-colors">Sale</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-[var(--text)] mb-6 uppercase tracking-wider text-sm">Sports</h4>
            <ul className="flex flex-col gap-4 text-sm text-[var(--text-body)]">
              <li><Link to="/category/running" className="hover:text-[var(--text)] transition-colors">Running</Link></li>
              <li><Link to="/category/basketball" className="hover:text-[var(--text)] transition-colors">Basketball</Link></li>
              <li><Link to="/category/training" className="hover:text-[var(--text)] transition-colors">Training</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-[var(--text)] mb-6 uppercase tracking-wider text-sm">Support</h4>
            <ul className="flex flex-col gap-4 text-sm text-[var(--text-body)]">
              <li><Link to="#" className="hover:text-[var(--text)] transition-colors">Help & FAQ</Link></li>
              <li><Link to="#" className="hover:text-[var(--text)] transition-colors">Returns & Exchanges</Link></li>
              <li><Link to="#" className="hover:text-[var(--text)] transition-colors">Track Order</Link></li>
              <li><Link to="#" className="hover:text-[var(--text)] transition-colors">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-[var(--text)] mb-6 uppercase tracking-wider text-sm">About RoeBook</h4>
            <ul className="flex flex-col gap-4 text-sm text-[var(--text-body)]">
              <li><Link to="#" className="hover:text-[var(--text)] transition-colors">News</Link></li>
              <li><Link to="#" className="hover:text-[var(--text)] transition-colors">Careers</Link></li>
              <li><Link to="#" className="hover:text-[var(--text)] transition-colors">Investors</Link></li>
              <li><Link to="#" className="hover:text-[var(--text)] transition-colors">Sustainability</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-6 border-t border-[var(--border)] pt-8 md:flex-row">
          <div className="flex items-center gap-2">
            <img src="/images/roebook-logo.png" alt="RoeBook" className="h-6 w-auto dark:invert opacity-70" />
            <span className="text-sm font-medium text-[var(--text-muted)]">
              © {new Date().getFullYear()} RoeBook. All rights reserved.
            </span>
          </div>
          <div className="flex gap-6 text-sm text-[var(--text-muted)]">
            <Link to="#" className="hover:text-[var(--text)] transition-colors">Privacy Policy</Link>
            <Link to="#" className="hover:text-[var(--text)] transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
