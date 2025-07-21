import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const BookingSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { reservationNumber } = location.state || {};

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #e0e7ff 0%, #f8fafc 100%)'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 22,
        boxShadow: '0 8px 32px #2563eb22',
        padding: '48px 36px',
        minWidth: 340,
        maxWidth: 420,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 18,
        border: '2.5px solid #2563eb22',
      }}>
        <div style={{ fontSize: 54, color: '#16a34a', marginBottom: 8 }}>✔️</div>
        <div style={{ fontWeight: 900, fontSize: 28, color: '#1e3a8a', marginBottom: 4, letterSpacing: -1 }}>Reservation Completed!</div>
        <div style={{ color: '#64748b', fontSize: 18, fontWeight: 600, textAlign: 'center', marginBottom: 8 }}>
          Your reservation number:<br />
          <span style={{ color: '#2563eb', fontWeight: 900, fontSize: 22 }}>{reservationNumber}</span>
        </div>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'linear-gradient(90deg, #16a34a 0%, #2563eb 100%)',
            color: 'white',
            fontWeight: 800,
            fontSize: 18,
            padding: '14px 44px',
            border: 'none',
            borderRadius: 12,
            cursor: 'pointer',
            boxShadow: '0 2px 12px #2563eb33',
            letterSpacing: 1,
            transition: 'background 0.18s, transform 0.12s',
            marginTop: 8
          }}
        >
          Go Home
        </button>
      </div>
    </div>
  );
};

export default BookingSuccessPage; 