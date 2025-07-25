import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CurrencyNationalityProvider } from './context/CurrencyNationalityContext';
import SearchPage from './pages/SearchPage';
import HotelList from './pages/HotelList';
import HotelDetailsPage from './pages/HotelDetailsPage';
import BookingPage from './pages/BookingPage';
import BookingSuccessPage from './pages/BookingSuccessPage';
import MyReservations from './pages/MyReservations';
import ReservationDetailPage from './pages/ReservationDetailPage';
import FindReservationPage from './pages/FindReservationPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CurrencyNationalityProvider>
      <Router>
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/hotels" element={<HotelList />} />
          <Route path="/hotel-details/:id" element={<HotelDetailsPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/booking-success" element={<BookingSuccessPage />} />
          <Route path="/my-reservations" element={<MyReservations />} />
          <Route path="/reservation-detail/:reservationNumber" element={<ReservationDetailPage />} />
          <Route path="/find-reservation" element={<FindReservationPage />} />
        </Routes>
      </Router>
      </CurrencyNationalityProvider>
    </AuthProvider>
  );
};

export default App;
