import React, { useState } from 'react';
import { getReservationDetail } from '../api';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useCurrencyNationality } from '../context/CurrencyNationalityContext';

const FindReservationPage: React.FC = () => {
  const [reservationNumber, setReservationNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<any>(null);
  const navigate = useNavigate();
  const { currency, currencyList, nationality, nationalityList, setCurrency, setNationality } = useCurrencyNationality();

  // Context'teki currency veya nationality boşsa localStorage'dan yükle (BookingPage'deki gibi)
  React.useEffect(() => {
    if (!currency || !nationality) {
      const lastParams = localStorage.getItem('lastHotelSearchParams');
      if (lastParams) {
        try {
          const parsed = JSON.parse(lastParams);
          if (!currency && parsed.currency) setCurrency(parsed.currency);
          if (!nationality && parsed.nationality) setNationality(parsed.nationality);
        } catch {}
      }
    }
  }, [currency, nationality, setCurrency, setNationality]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setDetail(null);
    if (!reservationNumber.trim()) {
      setError('Please enter your reservation number.');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Authentication required.');
      const detailData = await getReservationDetail({ token, reservationNumber: reservationNumber.trim() });
      if (detailData.body && detailData.body.reservationNumber) {
        setDetail(detailData.body);
      } else {
        setError('No reservation found for this number.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch reservation details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e0e7ff 0%, #f8fafc 100%)', display: 'flex', flexDirection: 'column' }}>
      <Header
        currency={currency}
        currencyList={currencyList}
        nationality={nationality}
        nationalityList={nationalityList}
        showSelectors={true}
        editableSelectors={false}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ maxWidth: 480, margin: '48px auto 0 auto', background: '#fff', borderRadius: 20, boxShadow: '0 4px 24px #2563eb11', padding: '40px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, border: '2px solid #e0e7ff' }}>
          <div style={{ fontWeight: 900, fontSize: 28, color: '#1e3a8a', marginBottom: 4, letterSpacing: -1, textAlign: 'center' }}>Reservation Lookup</div>
          <div style={{ color: '#64748b', fontSize: 17, fontWeight: 500, textAlign: 'center', marginBottom: 8 }}>
            Please enter your <b>reservation number</b> to view your reservation details.
          </div>
          <form onSubmit={handleSearch} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Reservation number..."
              value={reservationNumber}
              onChange={e => setReservationNumber(e.target.value)}
              style={{
                fontSize: 20,
                padding: '16px 24px',
                borderRadius: 12,
                border: '2px solid #2563eb',
                outline: 'none',
                width: '100%',
                fontWeight: 700,
                letterSpacing: 1,
                textAlign: 'center',
                marginBottom: 4
              }}
              autoFocus
              disabled={loading}
            />
            <button
              type="submit"
              style={{
                background: 'linear-gradient(90deg, #2563eb 0%, #16a34a 100%)',
                color: 'white',
                fontWeight: 800,
                fontSize: 20,
                padding: '14px 0',
                border: 'none',
                borderRadius: 10,
                cursor: loading ? 'not-allowed' : 'pointer',
                width: '100%',
                boxShadow: '0 2px 8px #2563eb22',
                letterSpacing: 1
              }}
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Show Details'}
            </button>
          </form>
          {error && <div style={{ color: '#f43f5e', fontWeight: 700, marginTop: 8 }}>{error.replace('Lütfen rezervasyon numaranızı girin.', 'Please enter your reservation number.').replace('Giriş yapmanız gerekmektedir.', 'Authentication required.').replace('Bu numaraya ait bir rezervasyon bulunamadı.', 'No reservation found for this number.').replace('Rezervasyon sorgulanamadı.', 'Failed to fetch reservation details.')}</div>}
          {detail && (
            <div style={{ width: '100%', marginTop: 16, background: '#f6faff', borderRadius: 14, boxShadow: '0 2px 8px #2563eb11', padding: 24, color: '#1e293b', fontSize: 17 }}>
              <div style={{ fontWeight: 800, fontSize: 22, color: '#2563eb', marginBottom: 12 }}>Reservation Details</div>
              <div style={{ marginBottom: 8 }}><b>Reservation No:</b> {detail.reservationNumber}</div>
              <div style={{ marginBottom: 8 }}><b>Hotel:</b> {detail.reservationData?.services?.[0]?.serviceDetails?.hotelDetail?.name || '-'}</div>
              <div style={{ marginBottom: 8 }}><b>Check-in Date:</b> {detail.reservationData?.reservationInfo?.beginDate ? new Date(detail.reservationData.reservationInfo.beginDate).toLocaleDateString() : '-'}</div>
              <div style={{ marginBottom: 8 }}><b>Check-out Date:</b> {detail.reservationData?.reservationInfo?.endDate ? new Date(detail.reservationData.reservationInfo.endDate).toLocaleDateString() : '-'}</div>
              <div style={{ marginBottom: 8 }}><b>Guest(s):</b> {detail.reservationData?.travellers?.map((t: any) => t.name + ' ' + t.surname).join(', ') || '-'}</div>
              <div style={{ marginBottom: 8 }}><b>Price:</b> {detail.reservationData?.reservationInfo?.salePrice?.amount} {detail.reservationData?.reservationInfo?.salePrice?.currency}</div>
              <div style={{ marginBottom: 8 }}><b>Status:</b> {detail.reservationData?.reservationInfo?.reservationStatus === 0 ? 'Active' : detail.reservationData?.reservationInfo?.reservationStatus === 1 ? 'Cancelled' : 'Unknown'}</div>
            </div>
          )}
        </div>
      </div>
      <footer className="footer" style={{ marginTop: '0', backgroundColor: '#1a1a2e', color: '#e0e0e0', padding: '24px 0 8px 0', fontFamily: `'Inter', 'Roboto', 'Arial', sans-serif`, fontWeight: 400, fontSize: '1rem', border: 'none', boxShadow: 'none', width: '100%' }}>
        <div className="footer-content" style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
          <div className="footer-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <p style={{ fontSize: '1.08rem', fontWeight: 400, color: '#e0e0e0', marginBottom: '1.1rem', lineHeight: 1.5, textAlign: 'left' }}>
              Your trusted partner for the best hotel experience
            </p>
            <div className="social-links" style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: 'flex-start' }}>
              <a href="#" style={{ color: '#e0e0e0', fontSize: '1rem', fontWeight: 400, textDecoration: 'none' }}>Facebook</a>
              <a href="#" style={{ color: '#e0e0e0', fontSize: '1rem', fontWeight: 400, textDecoration: 'none' }}>Instagram</a>
              <a href="#" style={{ color: '#e0e0e0', fontSize: '1rem', fontWeight: 400, textDecoration: 'none' }}>Twitter</a>
            </div>
          </div>
          <div className="footer-section">
            <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#e0e0e0', marginBottom: '0.7rem', background: 'none' }}>Quick Access</h4>
            <ul className="footer-links" style={{ listStyle: 'none', padding: 0, margin: 0, gap: '0.5rem' }}>
              <li style={{ marginBottom: '0.3rem' }}><a href="#" style={{ color: '#e0e0e0', fontSize: '1rem', fontWeight: 400, textDecoration: 'none' }}>Home Page</a></li>
              <li style={{ marginBottom: '0.3rem' }}><a href="#" style={{ color: '#e0e0e0', fontSize: '1rem', fontWeight: 400, textDecoration: 'none' }}>Search Hotels</a></li>
              <li style={{ marginBottom: '0.3rem' }}><a href="#" style={{ color: '#e0e0e0', fontSize: '1rem', fontWeight: 400, textDecoration: 'none' }}>My Reservations</a></li>
              <li style={{ marginBottom: '0.3rem' }}><a href="#" style={{ color: '#e0e0e0', fontSize: '1rem', fontWeight: 400, textDecoration: 'none' }}>My favorites</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#e0e0e0', marginBottom: '0.7rem', background: 'none' }}>Contact</h4>
            <ul className="footer-links" style={{ listStyle: 'none', padding: 0, margin: 0, gap: '0.5rem' }}>
              <li style={{ marginBottom: '0.3rem', color: '#e0e0e0' }}>info@hotelres.com</li>
              <li style={{ marginBottom: '0.3rem', color: '#e0e0e0' }}>+90 212 555 0123</li>
              <li style={{ marginBottom: '0.3rem', color: '#e0e0e0' }}>Antalya, Turkey</li>
              <li style={{ marginBottom: '0.3rem', color: '#e0e0e0' }}>7/24 Support</li>
            </ul>
          </div>
          <div className="footer-section">
            <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#e0e0e0', marginBottom: '0.7rem', background: 'none' }}>Payment Methods</h4>
            <div className="payment-methods" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className="payment-method" style={{ color: '#e0e0e0', fontSize: '1rem', fontWeight: 400, background: 'none', padding: '0.2rem 0.7rem' }}>Visa</span>
              <span className="payment-method" style={{ color: '#e0e0e0', fontSize: '1rem', fontWeight: 400, background: 'none', padding: '0.2rem 0.7rem' }}>MasterCard</span>
              <span className="payment-method" style={{ color: '#e0e0e0', fontSize: '1rem', fontWeight: 400, background: 'none', padding: '0.2rem 0.7rem' }}>PayPal</span>
              <span className="payment-method" style={{ color: '#e0e0e0', fontSize: '1rem', fontWeight: 400, background: 'none', padding: '0.2rem 0.7rem' }}>Bank Transfer</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom" style={{ padding: '0.7rem 1rem 0 1rem', fontSize: '0.95rem', color: '#b0b0b0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <span>© {new Date().getFullYear()} HotelRes. All rights reserved.</span>
          <div className="footer-bottom-links" style={{ display: 'flex', gap: '1rem' }}>
            <a href="#" style={{ color: '#b0b0b0', fontSize: '0.95rem', padding: '0.2rem 0.7rem', textDecoration: 'none' }}>Privacy Policy</a>
            <a href="#" style={{ color: '#b0b0b0', fontSize: '0.95rem', padding: '0.2rem 0.7rem', textDecoration: 'none' }}>Terms of Use</a>
            <a href="#" style={{ color: '#b0b0b0', fontSize: '0.95rem', padding: '0.2rem 0.7rem', textDecoration: 'none' }}>Cookie Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FindReservationPage; 