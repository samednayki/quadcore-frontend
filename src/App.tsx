import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import SearchPage from './pages/SearchPage/SearchPage';
import SearchResultsPage from './pages/SearchResultsPage/SearchResultsPage';
import HotelDetailPage from './pages/HotelDetailPage/HotelDetailPage';
import ReservationPage from './pages/ReservationPage/ReservationPage';
import HelpCenterPage from './pages/HelpCenterPage';
import ContactPage from './pages/ContactPage';
import FAQPage from './pages/FAQPage';

function App() {
  return (
    <div className="App">
      <Layout>
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/hotel/:id" element={<HotelDetailPage />} />
          <Route path="/reservation" element={<ReservationPage />} />
          <Route path="/help-center" element={<HelpCenterPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FAQPage />} />
        </Routes>
      </Layout>
    </div>
  );
}

export default App; 