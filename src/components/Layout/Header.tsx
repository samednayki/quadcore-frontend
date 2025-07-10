import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Building2, Menu, X, Home, Search, CalendarCheck } from 'lucide-react';

const navLinks = [
  { to: '/', label: 'Home', icon: <Home size={18} /> },
  { to: '/search', label: 'Search Hotels', icon: <Search size={18} /> },
  { to: '/reservation', label: 'My Reservations', icon: <CalendarCheck size={18} /> },
];

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const location = useLocation();

  return (
    <header className="backdrop-blur-md bg-white/70 shadow-lg border-b border-gray-200 rounded-b-2xl sticky top-0 z-30">
      <div className="container-custom py-2">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img src="/WhatsApp Image 2025-07-08 at 09.35.08_7abde45a.jpg" alt="HotelRes Logo" className="h-14 w-14 rounded-xl shadow-md object-cover" />
            <span className="text-2xl font-extrabold text-primary-700 tracking-tight drop-shadow-sm">HotelRes</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2 bg-white/60 rounded-full px-4 py-2 shadow-sm border border-gray-100">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-lg transition-all duration-200
                  ${location.pathname === link.to
                    ? 'bg-primary-100 text-primary-700 shadow-md border border-primary-200'
                    : 'text-gray-700 hover:bg-primary-50 hover:text-primary-700'}
                `}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-full text-gray-700 hover:text-primary-700 hover:bg-primary-50 transition-all"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-7 w-7" />
            ) : (
              <Menu className="h-7 w-7" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 mt-2 rounded-b-2xl bg-white/80 shadow-lg">
            <nav className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-lg transition-all duration-200
                    ${location.pathname === link.to
                      ? 'bg-primary-100 text-primary-700 shadow-md border border-primary-200'
                      : 'text-gray-700 hover:bg-primary-50 hover:text-primary-700'}
                  `}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 