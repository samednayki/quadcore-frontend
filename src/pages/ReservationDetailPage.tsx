import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getReservationDetail } from '../api';
import Header from '../components/Header';
import { useCurrencyNationality } from '../context/CurrencyNationalityContext';

const ReservationDetailPage: React.FC = () => {
  const { reservationNumber } = useParams<{ reservationNumber: string }>();
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { currency, currencyList, nationality, nationalityList } = useCurrencyNationality();

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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e0e7ff 0%, #f8fafc 100%)', padding: '0 32px 32px 32px', display: 'flex', flexDirection: 'column' }}>
      <Header
        currency={currency}
        currencyList={currencyList}
        nationality={nationality}
        nationalityList={nationalityList}
        showSelectors={false}
      />
      <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <h1 style={{ fontSize: 34, fontWeight: 900, color: '#1e3a8a', margin: '36px 0 36px 0', textAlign: 'center', letterSpacing: -1 }}>Reservation Detail</h1>
        <div style={{ background: '#fff', borderRadius: 22, boxShadow: '0 8px 40px #2563eb11', padding: 44, maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 22, alignItems: 'center', border: '2.5px solid #2563eb22' }}>
          <div style={{ fontWeight: 900, fontSize: 26, color: '#2563eb', marginBottom: 8, letterSpacing: 0.5 }}>Reservation #{detail.reservationNumber}</div>
          <div style={{ color: '#475569', fontSize: 18, marginBottom: 2 }}>Leader: <b>{travellers[0]?.name} {travellers[0]?.surname}</b></div>
          <div style={{ color: '#475569', fontSize: 18, marginBottom: 2 }}>Country: <b>{info.country?.name || travellers[0]?.nationality?.name || '-'}</b></div>
          <div style={{ color: '#475569', fontSize: 18, marginBottom: 2 }}>Dates: <b>{info.beginDate ? info.beginDate.slice(0,10) : '-'} - {info.endDate ? info.endDate.slice(0,10) : '-'}</b></div>
          <div style={{ color: '#475569', fontSize: 18, marginBottom: 2 }}>Price: <b style={{ color: '#22c55e' }}>{info.salePrice?.amount ? `${info.salePrice.amount} ${info.salePrice.currency}` : '-'}</b></div>
          <div style={{ color: '#475569', fontSize: 18, marginBottom: 2 }}>Status: <b style={{ color: '#2563eb' }}>{statusString(info.reservationStatus)}</b></div>
          <div style={{ color: '#475569', fontSize: 18, marginBottom: 2 }}>Traveller Count: <b>{travellers.length || '-'}</b></div>
          <div style={{ color: '#475569', fontSize: 18, marginBottom: 2 }}>Documents:</div>
          <ul style={{ margin: 0, paddingLeft: 18, width: '100%' }}>
            {info.documents && info.documents.length > 0 ? (
              info.documents.map((doc: any, idx: number) => (
                <li key={idx}><a href={doc.url} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'underline' }}>{doc.name || doc.url}</a></li>
              ))
            ) : (
              <li style={{ color: '#64748b' }}>No documents.</li>
            )}
          </ul>
          <button onClick={() => navigate('/my-reservations')} style={{ marginTop: 18, background: 'linear-gradient(90deg, #2563eb 0%, #16a34a 100%)', color: 'white', fontWeight: 800, fontSize: 18, padding: '14px 0', border: 'none', borderRadius: 12, cursor: 'pointer', boxShadow: '0 2px 8px #2563eb22', letterSpacing: 1, width: '100%' }}>Back to My Reservations</button>
        </div>
      </div>
    </div>
  );
};

export default ReservationDetailPage; 