import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import SearchPage from './pages/SearchPage/SearchPage';
import SearchResultsPage from './pages/SearchResultsPage/SearchResultsPage';
import HotelDetailPage from './pages/HotelDetailPage/HotelDetailPage';
import ReservationPage from './pages/ReservationPage/ReservationPage';
import HelpCenterPage from './pages/FooterPage/HelpCenterPage';
import ContactPage from './pages/FooterPage/ContactPage';
import FAQPage from './pages/FooterPage/FAQPage';
import { authAPI } from './services/api';

function App() {
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      // Anonim kullanıcı bilgileri
      const loginRequest = {
        user: 'Internship',
        password: '@San2025',
        agency: 'Internship',
      };
      authAPI.login(loginRequest)
        .then((token) => {
          console.log('Login request successful, token:', token);
          localStorage.setItem('token', token);
        })
        .catch((err) => {
          console.error('Anonymous login failed:', err);
        });
    }
  }, []);

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