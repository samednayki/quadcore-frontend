import React, { useEffect, useState } from 'react';
import { getReservationList } from '../api';
import { useNavigate, Link } from 'react-router-dom';
import { FaHome, FaSearch, FaBookmark } from 'react-icons/fa';

const logoUrl = process.env.PUBLIC_URL + '/WhatsApp Image 2025-07-08 at 09.35.08_7abde45a.jpg';

const MyReservations: React.FC = () => {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReservations = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('Authentication required');
        const today = new Date();
        const weekLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        const dateCriteria = [{ type: 1, from: today.toISOString().slice(0, 10), to: weekLater.toISOString().slice(0, 10) }];
        const data = await getReservationList({ token, dateCriteria });
        setReservations(data.body?.reservations || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch reservations');
      } finally {
        setLoading(false);
      }
    };
    fetchReservations();
  }, []);

  return (
    <>
      {/* HEADER (same as HotelDetailsPage) */}
      <header style={{
        width: '100%',
        background: '#1e3a8a',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        padding: '24px 0 12px 0',
        marginBottom: 0,
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          maxWidth: 1400,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <img
              src={logoUrl}
              alt="Logo"
              style={{ height: 48, borderRadius: 12, marginRight: 16 }}
            />
            <span style={{ fontWeight: 800, fontSize: 28, color: 'white', letterSpacing: -1 }}>HotelRes</span>
          </div>
          <nav style={{ display: 'flex', gap: 32 }}>
            <Link to="/" className="nav-btn">
              {FaHome({ style: { marginRight: 8, fontSize: 20 } })} Home
            </Link>
            <a
              href="#"
              className="nav-btn"
              onClick={e => {
                e.preventDefault();
                const lastParams = localStorage.getItem('lastHotelSearchParams');
                if (lastParams) {
                  try {
                    const parsed = JSON.parse(lastParams);
                    navigate('/hotels', { state: { searchParams: parsed } });
                  } catch {
                    navigate('/');
                  }
                } else {
                  navigate('/');
                }
              }}
            >
              {FaSearch({ style: { marginRight: 8, fontSize: 20 } })} Search Hotels
            </a>
            <Link to="/find-reservation" className="nav-btn">
              {FaBookmark({ style: { marginRight: 8, fontSize: 20 } })} My Reservations
            </Link>
          </nav>
        </div>
      </header>
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e0e7ff 0%, #f8fafc 100%)', padding: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: '#1e3a8a', marginBottom: 32 }}>My Reservations</h1>
        {loading && <div style={{ fontSize: 20, color: '#2563eb' }}>Loading...</div>}
        {error && <div style={{ color: '#f43f5e', fontWeight: 700 }}>{error}</div>}
        {!loading && reservations.length === 0 && <div style={{ color: '#64748b', fontSize: 18 }}>No reservations found.</div>}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
          {reservations.map((r) => (
            <div key={r.reservationNumber} style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px #2563eb11', padding: 28, display: 'flex', flexDirection: 'column', gap: 12, border: '2px solid #e0e7ff' }}>
              <div style={{ fontWeight: 800, fontSize: 22, color: '#2563eb' }}>Reservation #{r.reservationNumber}</div>
              <div style={{ color: '#64748b', fontSize: 16 }}>Leader: <b>{r.leaderName}</b></div>
              <div style={{ color: '#64748b', fontSize: 16 }}>Country: <b>{r.country}</b></div>
              <div style={{ color: '#64748b', fontSize: 16 }}>Dates: <b>{r.beginDate?.slice(0,10)} - {r.endDate?.slice(0,10)}</b> ({r.night} nights)</div>
              <div style={{ color: '#64748b', fontSize: 16 }}>Price: <b>{r.salePrice?.amount} {r.salePrice?.currency}</b></div>
              <div style={{ color: '#64748b', fontSize: 16 }}>Status: <b>{r.reservationStatus === 0 ? 'Active' : r.reservationStatus === 1 ? 'Cancelled' : 'Unknown'}</b></div>
              <button onClick={() => navigate(`/reservation-detail/${r.reservationNumber}`)} style={{ marginTop: 12, background: 'linear-gradient(90deg, #2563eb 0%, #16a34a 100%)', color: 'white', fontWeight: 700, fontSize: 16, padding: '10px 28px', border: 'none', borderRadius: 10, cursor: 'pointer', boxShadow: '0 2px 8px #2563eb22', letterSpacing: 1 }}>See Details</button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default MyReservations; 