import React from 'react';
import { Link } from 'react-router-dom';
import { LifeBuoy, Mail, BookOpen, Home, Search, CalendarCheck } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold mb-4">HotelRes</h3>
            <p className="text-gray-300 mb-4">
            Make your hotel reservation at the best prices. Choose the one that suits you best among thousands of hotels and make your reservation safely.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors flex items-center gap-1">
                  <Home size={16} className="inline-block" /> Home Page
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-gray-300 hover:text-white transition-colors flex items-center gap-1">
                  <Search size={16} className="inline-block" /> Search Hotels
                </Link>
              </li>
              <li>
                <Link to="/reservation" className="text-gray-300 hover:text-white transition-colors flex items-center gap-1">
                  <CalendarCheck size={16} className="inline-block" /> My Reservations
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-2">Support</h3>
            <ul className="space-y-1">
              <li><Link to="/help-center" className="hover:underline flex items-center gap-2"><LifeBuoy size={16} className="inline-block text-gray-300" /> Help Center</Link></li>
              <li><Link to="/contact" className="hover:underline flex items-center gap-2"><Mail size={16} className="inline-block text-gray-300" /> Contact Us</Link></li>
              <li><Link to="/faq" className="hover:underline flex items-center gap-2"><BookOpen size={16} className="inline-block text-gray-300" /> FAQ</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; 2025 HotelRes. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 