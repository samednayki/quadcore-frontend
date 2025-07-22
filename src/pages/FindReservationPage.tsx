import React, { useState } from 'react';
import { getReservationList, getReservationDetail } from '../api';
import { useNavigate } from 'react-router-dom';

const FindReservationPage: React.FC = () => {
  const [reservationNumber, setReservationNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reservation, setReservation] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [detail, setDetail] = useState<any>(null);
  const navigate = useNavigate();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setReservation(null);
    setShowDetail(false);
    setDetail(null);
    if (!reservationNumber.trim()) {
      setError('Please enter a reservation number.');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Authentication required');
      // Use a wide date range to get all reservations
      const dateCriteria = [{ type: 1, from: '2000-01-01', to: '2100-12-31' }];
      const data = await getReservationList({ token, dateCriteria });
      const found = data.body?.reservations?.find((r: any) => r.reservationNumber === reservationNumber.trim());
      if (found) {
        setReservation(found);
      } else {
        setError('No reservation found with this number.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch reservation');
    } finally {
      setLoading(false);
    }
  };

  const handleSeeDetails = async () => {
    if (!reservation) return;
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Authentication required');
      const detailData = await getReservationDetail({ token, reservationNumber: reservation.reservationNumber });
      setDetail(detailData.body);
      setShowDetail(true);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch reservation details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e0e7ff 0%, #f8fafc 100%)', padding: 32 }}>
      <h1 style={{ fontSize: 32, fontWeight: 900, color: '#1e3a8a', marginBottom: 32 }}>Find Your Reservation</h1>
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
        <input
          type="text"
          placeholder="Enter reservation number..."
          value={reservationNumber}
          onChange={e => setReservationNumber(e.target.value)}
          style={{
            fontSize: 18,
            padding: '12px 20px',
            borderRadius: 10,
            border: '2px solid #2563eb',
            outline: 'none',
            minWidth: 320,
            fontWeight: 600
          }}
        />
        <button
          type="submit"
          style={{
            background: 'linear-gradient(90deg, #2563eb 0%, #16a34a 100%)',
            color: 'white',
            fontWeight: 700,
            fontSize: 18,
            padding: '12px 32px',
            border: 'none',
            borderRadius: 10,
            cursor: 'pointer',
            boxShadow: '0 2px 8px #2563eb22',
            letterSpacing: 1
          }}
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Find Reservation'}
        </button>
      </form>
      {error && <div style={{ color: '#f43f5e', fontWeight: 700, marginBottom: 24 }}>{error}</div>}
      {reservation && !showDetail && (
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px #2563eb11', padding: 28, maxWidth: 420, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12, border: '2px solid #e0e7ff' }}>
          <div style={{ fontWeight: 800, fontSize: 22, color: '#2563eb' }}>Reservation #{reservation.reservationNumber}</div>
          <div style={{ color: '#64748b', fontSize: 16 }}>Leader: <b>{reservation.leaderName}</b></div>
          <div style={{ color: '#64748b', fontSize: 16 }}>Country: <b>{reservation.country}</b></div>
          <div style={{ color: '#64748b', fontSize: 16 }}>Dates: <b>{reservation.beginDate?.slice(0,10)} - {reservation.endDate?.slice(0,10)}</b> ({reservation.night} nights)</div>
          <div style={{ color: '#64748b', fontSize: 16 }}>Price: <b>{reservation.salePrice?.amount} {reservation.salePrice?.currency}</b></div>
          <div style={{ color: '#64748b', fontSize: 16 }}>Status: <b>{reservation.reservationStatus === 0 ? 'Active' : reservation.reservationStatus === 1 ? 'Cancelled' : 'Unknown'}</b></div>
          <button onClick={handleSeeDetails} style={{ marginTop: 12, background: 'linear-gradient(90deg, #2563eb 0%, #16a34a 100%)', color: 'white', fontWeight: 700, fontSize: 16, padding: '10px 28px', border: 'none', borderRadius: 10, cursor: 'pointer', boxShadow: '0 2px 8px #2563eb22', letterSpacing: 1 }}>See Details</button>
        </div>
      )}
      {showDetail && detail && (
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px #2563eb11', padding: 32, maxWidth: 700, margin: '32px auto', color: '#1e293b' }}>
          <h2 style={{ color: '#2563eb', fontWeight: 800, fontSize: 24, marginBottom: 18 }}>Reservation Details</h2>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: '#f8fafc', borderRadius: 8, padding: 16, fontSize: 15 }}>{JSON.stringify(detail, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default FindReservationPage; 