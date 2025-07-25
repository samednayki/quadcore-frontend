import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useCurrencyNationality } from '../context/CurrencyNationalityContext';

const BookingSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { reservationNumber } = location.state || {};

  const { currency, currencyList, nationality, nationalityList } = useCurrencyNationality();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e0e7ff 0%, #f8fafc 100%)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Header
        currency={currency}
        currencyList={currencyList}
        nationality={nationality}
        nationalityList={nationalityList}
        showSelectors={false}
      />
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        minHeight: 'calc(100vh - 80px)',
      }}>
        <div style={{
          background: '#fff',
          borderRadius: 28,
          boxShadow: '0 8px 40px #2563eb22',
          padding: '56px 48px 48px 48px',
          minWidth: 340,
          maxWidth: 440,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
          border: '2.5px solid #22c55e33',
          position: 'relative',
        }}>
          <div style={{ fontSize: 70, color: '#22c55e', marginBottom: 8, animation: 'pop 0.5s cubic-bezier(.17,.67,.83,.67)' }}>✔️</div>
          <div style={{ fontWeight: 900, fontSize: 30, color: '#18181b', marginBottom: 4, letterSpacing: -1, textAlign: 'center' }}>Reservation Completed!</div>
          <div style={{ color: '#64748b', fontSize: 19, fontWeight: 600, textAlign: 'center', marginBottom: 8 }}>
            Your reservation number:
            <div style={{ color: '#2563eb', fontWeight: 900, fontSize: 28, marginTop: 8, letterSpacing: 1 }}>{reservationNumber}</div>
          </div>
          <button
            onClick={() => navigate('/my-reservations')}
            style={{
              background: 'linear-gradient(90deg, #2563eb 0%, #22c55e 100%)',
              color: 'white',
              fontWeight: 800,
              fontSize: 20,
              padding: '16px 0',
              border: 'none',
              borderRadius: 14,
              cursor: 'pointer',
              boxShadow: '0 2px 12px #2563eb33',
              letterSpacing: 1,
              width: '100%',
              marginTop: 12,
              transition: 'background 0.18s, transform 0.12s',
            }}
          >
            Go to My Reservations
          </button>
        </div>
      </div>
      <style>{`
        @keyframes pop {
          0% { transform: scale(0.7); opacity: 0; }
          80% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default BookingSuccessPage; 