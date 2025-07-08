import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Menu, X, Home, Search, CalendarCheck } from 'lucide-react';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src="/WhatsApp Image 2025-07-08 at 09.35.08_7abde45a.jpg" alt="OtelRez Logo" className="h-16 max-h-16 w-auto my-1" />
            <span className="text-xl font-bold text-gray-900">HotelRes</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-gray-600 hover:text-primary-600 transition-colors flex items-center gap-1"
            >
              <Home size={16} className="inline-block" /> Home Page
            </Link>
            <Link 
              to="/search" 
              className="text-gray-600 hover:text-primary-600 transition-colors flex items-center gap-1"
            >
              <Search size={16} className="inline-block" /> Search Hotels
            </Link>
            <Link 
              to="/reservation" 
              className="text-gray-600 hover:text-primary-600 transition-colors flex items-center gap-1"
            >
              <CalendarCheck size={16} className="inline-block" /> My Reservations
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="text-gray-600 hover:text-primary-600 transition-colors px-4 py-2 flex items-center gap-1"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Home size={16} className="inline-block" /> Home Page
              </Link>
              <Link 
                to="/search" 
                className="text-gray-600 hover:text-primary-600 transition-colors px-4 py-2 flex items-center gap-1"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Search size={16} className="inline-block" /> Search Hotels
              </Link>
              <Link 
                to="/reservation" 
                className="text-gray-600 hover:text-primary-600 transition-colors px-4 py-2 flex items-center gap-1"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <CalendarCheck size={16} className="inline-block" /> My Reservations
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 