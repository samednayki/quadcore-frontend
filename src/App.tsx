import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import SearchPage from './pages/SearchPage';
import HotelList from './pages/HotelList';
import HotelDetailsPage from './pages/HotelDetailsPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/hotels" element={<HotelList />} />
          <Route path="/hotel-details/:id" element={<HotelDetailsPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
