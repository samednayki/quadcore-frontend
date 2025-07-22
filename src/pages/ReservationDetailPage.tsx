import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getReservationDetail } from '../api';

const ReservationDetailPage: React.FC = () => {
  const { reservationNumber } = useParams<{ reservationNumber: string }>();
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('Authentication required');
        const data = await getReservationDetail({ token, reservationNumber: reservationNumber || '' });
        setDetail(data.body || null);
        console.log('Reservation detail:', data.body);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch reservation detail');
      } finally {
        setLoading(false);
      }
    };
    if (reservationNumber) fetchDetail();
  }, [reservationNumber]);

  if (loading) return <div style={{ padding: 32, fontSize: 20, color: '#2563eb' }}>Loading...</div>;
  if (error) return <div style={{ padding: 32, color: '#f43f5e', fontWeight: 700 }}>{error}</div>;
  if (!detail) return <div style={{ padding: 32, color: '#64748b', fontSize: 18 }}>No detail found.</div>;

  // Helper: status string
  const statusString = (status: number | undefined) => {
    if (status === 0) return 'Active';
    if (status === 1) return 'Cancelled';
    if (status === 2) return 'Completed';
    return 'Unknown';
  };

  const info = detail.reservationData?.reservationInfo || {};
  const travellers = detail.reservationData?.travellers || [];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e0e7ff 0%, #f8fafc 100%)', padding: 32 }}>
      <h1 style={{ fontSize: 32, fontWeight: 900, color: '#1e3a8a', marginBottom: 32 }}>Reservation Detail</h1>
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px #2563eb11', padding: 32, maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ fontWeight: 800, fontSize: 22, color: '#2563eb' }}>Reservation #{detail.reservationNumber}</div>
        <div style={{ color: '#64748b', fontSize: 16 }}>Leader: <b>{travellers[0]?.name} {travellers[0]?.surname}</b></div>
        <div style={{ color: '#64748b', fontSize: 16 }}>Country: <b>{info.country?.name || travellers[0]?.nationality?.name || '-'}</b></div>
        <div style={{ color: '#64748b', fontSize: 16 }}>Dates: <b>{info.beginDate ? info.beginDate.slice(0,10) : '-'} - {info.endDate ? info.endDate.slice(0,10) : '-'}</b></div>
        <div style={{ color: '#64748b', fontSize: 16 }}>Price: <b>{info.salePrice?.amount ? `${info.salePrice.amount} ${info.salePrice.currency}` : '-'}</b></div>
        <div style={{ color: '#64748b', fontSize: 16 }}>Status: <b>{statusString(info.reservationStatus)}</b></div>
        <div style={{ color: '#64748b', fontSize: 16 }}>Traveller Count: <b>{travellers.length || '-'}</b></div>
        <div style={{ color: '#64748b', fontSize: 16 }}>Documents:</div>
        <ul>
          {info.documents && info.documents.length > 0 ? (
            info.documents.map((doc: any, idx: number) => (
              <li key={idx}><a href={doc.url} target="_blank" rel="noopener noreferrer">{doc.name || doc.url}</a></li>
            ))
          ) : (
            <li style={{ color: '#64748b' }}>No documents.</li>
          )}
        </ul>
        <button onClick={() => navigate('/my-reservations')} style={{ marginTop: 12, background: 'linear-gradient(90deg, #2563eb 0%, #16a34a 100%)', color: 'white', fontWeight: 700, fontSize: 16, padding: '10px 28px', border: 'none', borderRadius: 10, cursor: 'pointer', boxShadow: '0 2px 8px #2563eb22', letterSpacing: 1 }}>Back to My Reservations</button>
      </div>
    </div>
  );
};

export default ReservationDetailPage; 