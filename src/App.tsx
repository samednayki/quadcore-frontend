import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import SearchPage from './pages/SearchPage';
import HotelList from './pages/HotelList';
import HotelDetailsPage from './pages/HotelDetailsPage';
import BookingPage from './pages/BookingPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/hotels" element={<HotelList />} />
          <Route path="/hotel-details/:id" element={<HotelDetailsPage />} />
          <Route path="/booking" element={<BookingPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
