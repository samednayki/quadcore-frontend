import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { FaHome, FaSearch, FaBookmark, FaArrowLeft } from 'react-icons/fa';
import { setReservationInfo, commitTransaction } from '../api';

const BookingPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { transactionData, hotelData, offerData } = location.state || {};
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<any[]>([]);
  const [isFormValid, setIsFormValid] = useState(false);

  // Form state for traveller information
  const [travellers, setTravellers] = useState<any[]>([]);

  useEffect(() => {
    if (!transactionData || !hotelData || !offerData) {
      setError('Booking data not found. Please try again.');
      return;
    }

    // Initialize travellers from transaction data
    if (transactionData.reservationData?.travellers) {
      setTravellers(transactionData.reservationData.travellers.map((traveller: any) => ({
        ...traveller,
        name: '',
        surname: '',
        email: '',
        phone: '',
        birthDate: '',
        nationality: traveller.nationality?.twoLetterCode || '',
        passportNumber: '',
        passportExpiry: ''
      })));
    }
  }, [transactionData, hotelData, offerData]);

  const validateTravellers = (travellersToCheck = travellers) => {
    const newErrors = travellersToCheck.map((traveller) => {
      const tErrors: any = {};
      if (!traveller.name || !/^[A-Za-z]+$/.test(traveller.name)) {
        tErrors.name = 'First name is required and must contain only letters.';
      }
      if (!traveller.surname || !/^[A-Za-z]+$/.test(traveller.surname)) {
        tErrors.surname = 'Last name is required and must contain only letters.';
      }
      if (traveller.isLeader && (!traveller.email || !/^[^@]+@[^@]+\.[^@]+$/.test(traveller.email))) {
        tErrors.email = 'Valid email is required.';
      }
      if (traveller.isLeader && (!traveller.phone || !/^[0-9+]{10,15}$/.test(traveller.phone))) {
        tErrors.phone = 'Phone must be 10-15 digits and can start with +.';
      }
      if (!traveller.birthDate) {
        tErrors.birthDate = 'Birth date is required.';
      } else if (new Date(traveller.birthDate) >= new Date()) {
        tErrors.birthDate = 'Birth date must be in the past.';
      }
      if (!traveller.nationality || !/^[A-Z]{2}$/.test(traveller.nationality)) {
        tErrors.nationality = 'Nationality must be 2 uppercase letters.';
      }
      if (!traveller.passportNumber || !/^[A-Z0-9]{6,9}$/.test(traveller.passportNumber)) {
        tErrors.passportNumber = 'Passport number must be 6-9 characters, uppercase letters and/or digits.';
      }
      if (!traveller.passportExpiry) {
        tErrors.passportExpiry = 'Passport expiry date is required.';
      } else if (new Date(traveller.passportExpiry) <= new Date()) {
        tErrors.passportExpiry = 'Expiry date must be in the future.';
      }
      return tErrors;
    });
    setErrors(newErrors);
    const valid = newErrors.every((tErr) => Object.keys(tErr).length === 0);
    setIsFormValid(valid);
    return valid;
  };

  const handleTravellerChange = (index: number, field: string, value: string) => {
    const updatedTravellers = [...travellers];
    updatedTravellers[index] = {
      ...updatedTravellers[index],
      [field]: value
    };
    setTravellers(updatedTravellers);
    validateTravellers(updatedTravellers);
  };

  // İlk render ve travellers değiştiğinde validasyonu tetikle
  React.useEffect(() => {
    validateTravellers(travellers);
    // eslint-disable-next-line
  }, [travellers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (!validateTravellers()) {
      setLoading(false);
      setError('Please fix the errors in the form.');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication token not found');
        setLoading(false);
        return;
      }

      // Traveller objelerini backend modeline uygun hale getir
      const mappedTravellers = travellers.map((t) => ({
        ...t,
        nationality: { twoLetterCode: t.nationality },
        passportInfo: {
          number: t.passportNumber,
          expireDate: t.passportExpiry,
        },
        address: {
          email: t.email,
          phone: t.phone,
        },
      }));

      // CustomerInfo'yu örnekle (geliştirilebilir)
      const customerInfo = {
        isCompany: false,
        passportInfo: {},
        address: {
          city: { name: 'Antalya' },
          country: { name: 'Turkey' },
          email: travellers[0]?.email || '',
          phone: travellers[0]?.phone || '',
          address: 'Customer test',
          zipCode: '07000',
        },
        taxInfo: {},
        title: 1,
        name: travellers[0]?.name || '',
        surname: travellers[0]?.surname || '',
        birthDate: travellers[0]?.birthDate || '',
        identityNumber: '11111111111',
      };

      const data = {
        transactionId: transactionData.transactionId,
        travellers: mappedTravellers,
        customerInfo,
        reservationNote: 'Reservation note',
        agencyReservationNumber: 'Agency reservation number text',
      };

      // 1. Adım: setReservationInfo
      const setResResponse = await setReservationInfo({ token, data });
      const commitTransactionId = setResResponse.body?.transactionId || data.transactionId;
      if (!commitTransactionId) throw new Error('TransactionId bulunamadı!');

      // 2. Adım: commitTransaction
      const commitResponse = await commitTransaction({
        token,
        data: { transactionId: commitTransactionId }
      });

      // 3. Adım: Başarı mesajı veya yönlendirme
      navigate('/booking-success', { state: { reservationNumber: commitResponse.body.reservationNumber } });
    } catch (err) {
      setError('Rezervasyon tamamlanamadı!');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #e0e7ff 0%, #2563eb 100%)',
        padding: 0
      }}>
        <div style={{
          background: '#fff',
          borderRadius: 22,
          boxShadow: '0 8px 32px #f43f5e22',
          padding: '48px 36px',
          minWidth: 340,
          maxWidth: 420,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 18,
          border: '2.5px solid #f43f5e22',
        }}>
          <div style={{ fontSize: 54, color: '#f43f5e', marginBottom: 8 }}>⚠️</div>
          <div style={{ fontWeight: 900, fontSize: 28, color: '#1e3a8a', marginBottom: 4, letterSpacing: -1 }}>Error</div>
          <div style={{ color: '#64748b', fontSize: 18, fontWeight: 600, textAlign: 'center', marginBottom: 8 }}>{error}</div>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'linear-gradient(90deg, #f43f5e 0%, #2563eb 100%)',
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
  }

  if (!transactionData || !hotelData || !offerData) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #e0e7ff 0%, #2563eb 100%)',
        padding: 0
      }}>
        <div style={{
          background: '#fff',
          borderRadius: 22,
          boxShadow: '0 8px 32px #f43f5e22',
          padding: '48px 36px',
          minWidth: 340,
          maxWidth: 420,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 18,
          border: '2.5px solid #f43f5e22',
        }}>
          <div style={{ fontSize: 54, color: '#f43f5e', marginBottom: 8 }}>⚠️</div>
          <div style={{ fontWeight: 900, fontSize: 28, color: '#1e3a8a', marginBottom: 4, letterSpacing: -1 }}>No Data</div>
          <div style={{ color: '#64748b', fontSize: 18, fontWeight: 600, textAlign: 'center', marginBottom: 8 }}>Booking data not found</div>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'linear-gradient(90deg, #f43f5e 0%, #2563eb 100%)',
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
  }

  const logoUrl = process.env.PUBLIC_URL + '/WhatsApp Image 2025-07-08 at 09.35.08_7abde45a.jpg';

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e0e7ff 0%, #f8fafc 100%)' }}>
      {/* HEADER */}
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
            <a href="#" className="nav-btn" onClick={e => { e.preventDefault(); navigate('/'); }}>
              {FaHome({ style: { marginRight: 8, fontSize: 20 } })} Home
            </a>
            <a href="#" className="nav-btn" onClick={e => { e.preventDefault(); navigate('/hotels'); }}>
              {FaSearch({ style: { marginRight: 8, fontSize: 20 } })} Search Hotels
            </a>
            <Link to="/find-reservation" className="nav-btn">
              {FaBookmark({ style: { marginRight: 8, fontSize: 20 } })} My Reservations
            </Link>
          </nav>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px' }}>
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'none',
            border: 'none',
            color: '#2563eb',
            fontSize: 18,
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: 24,
            padding: '8px 16px',
            borderRadius: 8,
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e0e7ff'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          {FaArrowLeft({ style: { fontSize: 16 } })} Back to Hotel Details
        </button>

        {/* Booking Summary */}
        <div style={{
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 4px 24px #1e3a8a11',
          padding: '32px',
          marginBottom: 32
        }}>
          <h1 style={{ fontSize: 32, fontWeight: 900, margin: '0 0 24px 0', color: '#1e3a8a', letterSpacing: -1 }}>
            Complete Your Booking
          </h1>
          
          {/* Hotel Info */}
          <div style={{
            display: 'flex',
            gap: 24,
            padding: '24px',
            backgroundColor: '#f8fafc',
            borderRadius: 12,
            marginBottom: 24
          }}>
            <img
              src={hotelData?.seasons?.[0]?.mediaFiles?.[0]?.urlFull || hotelData?.thumbnailFull || process.env.PUBLIC_URL + '/fernando-alvarez-rodriguez-M7GddPqJowg-unsplash.jpg'}
              alt={hotelData?.name}
              style={{
                width: 120,
                height: 80,
                borderRadius: 8,
                objectFit: 'cover'
              }}
            />
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 700, color: '#1e3a8a' }}>
                {hotelData?.name}
              </h3>
              <p style={{ margin: '0 0 4px 0', color: '#64748b', fontSize: '16px' }}>
                📍 {hotelData?.address?.addressLines?.join(', ') || hotelData?.city?.name || 'Unknown location'}
                {hotelData?.country?.name && `, ${hotelData.country.name}`}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8 }}>
                <span style={{ color: '#64748b', fontSize: '16px' }}>
                  📅 {new Date(offerData?.checkIn).toLocaleDateString()} - {new Date(offerData?.checkOut).toLocaleDateString()}
                </span>
                <span style={{ color: '#64748b', fontSize: '16px' }}>
                  🛏️ {offerData?.rooms?.[0]?.roomName || 'Standard Room'}
                </span>
                <span style={{ color: '#64748b', fontSize: '16px' }}>
                  🍽️ {offerData?.rooms?.[0]?.boardName || 'Room Only'}
                </span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#2563eb' }}>
                {offerData?.price?.currency} {offerData?.price?.amount}
              </div>
              <div style={{ color: '#64748b', fontSize: '14px' }}>
                Total for {Math.ceil((new Date(offerData?.checkOut).getTime() - new Date(offerData?.checkIn).getTime()) / (1000 * 60 * 60 * 24))} nights
              </div>
            </div>
          </div>

          {/* Transaction Info */}
          <div style={{
            padding: '20px',
            backgroundColor: '#f0f9ff',
            borderRadius: 12,
            border: '2px solid #0ea5e9',
            marginBottom: 24
          }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: 600, color: '#0c4a6e' }}>
              Transaction Information
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '14px' }}>Transaction ID:</span>
                <div style={{ fontWeight: 600, color: '#0c4a6e' }}>{transactionData.transactionId}</div>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '14px' }}>Expires On:</span>
                <div style={{ fontWeight: 600, color: '#dc2626' }}>
                  {new Date(transactionData.expiresOn).toLocaleString()}
                </div>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '14px' }}>Total Price:</span>
                <div style={{ fontWeight: 600, color: '#0c4a6e' }}>
                  {transactionData.reservationData?.reservationInfo?.totalPrice?.currency} {transactionData.reservationData?.reservationInfo?.totalPrice?.amount}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Traveller Information Form */}
        <form onSubmit={handleSubmit} style={{
          background: '#fff',
          borderRadius: 20,
          boxShadow: '0 6px 32px #2563eb18',
          padding: 40,
          maxWidth: 1000,
          margin: '0 auto',
        }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, margin: '0 0 32px 0', color: '#1e3a8a', letterSpacing: -1 }}>
            Traveller Information
          </h2>

          {travellers.map((traveller, index) => (
            <div key={index} style={{
              border: '2px solid #e0e7ff',
              borderRadius: 18,
              padding: '40px',
              marginBottom: '40px',
              background: 'linear-gradient(135deg, #f8fafc 60%, #e0e7ff 100%)',
              boxShadow: '0 2px 16px #2563eb0a',
              maxWidth: 900,
              margin: '0 auto 40px auto',
            }}>
              <h3 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 32px 0', color: '#2563eb', letterSpacing: -0.5 }}>
                Traveller {index + 1} <span style={{ color: '#0ea5e9', fontWeight: 700 }}>{traveller.isLeader ? '(Leader)' : ''}</span>
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 32,
                alignItems: 'start',
              }}>
                {/* Title */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <label style={{ fontWeight: 700, color: '#1e293b', fontSize: 15, marginBottom: 2, letterSpacing: 0.2 }}>Title *</label>
                  <select
                    value={traveller.title || ''}
                    onChange={(e) => handleTravellerChange(index, 'title', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: 10,
                      fontSize: 16,
                      background: '#f8fafc',
                      outline: 'none',
                      transition: 'border 0.2s',
                      minHeight: 44
                    }}
                    required
                  >
                    <option value="">Select Title</option>
                    {traveller.availableTitles?.map((title: any) => (
                      <option key={title.id} value={title.id}>{title.name}</option>
                    ))}
                  </select>
                  <div style={{ minHeight: 18, color: '#ef4444', fontSize: 13, marginTop: 2, fontWeight: 500 }}>
                    {errors[index]?.title}
                  </div>
                </div>
                {/* First Name */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <label style={{ fontWeight: 700, color: '#1e293b', fontSize: 15, marginBottom: 2, letterSpacing: 0.2 }}>First Name *</label>
                  <input
                    type="text"
                    value={traveller.name || ''}
                    onChange={(e) => handleTravellerChange(index, 'name', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: 10,
                      border: '1.5px solid #cbd5e1',
                      fontSize: 16,
                      background: '#f8fafc',
                      outline: 'none',
                      transition: 'border 0.2s',
                      minHeight: 44
                    }}
                    required
                  />
                  <div style={{ minHeight: 18, color: '#ef4444', fontSize: 13, marginTop: 2, fontWeight: 500 }}>
                    {errors[index]?.name}
                  </div>
                </div>
                {/* Last Name */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <label style={{ fontWeight: 700, color: '#1e293b', fontSize: 15, marginBottom: 2, letterSpacing: 0.2 }}>Last Name *</label>
                  <input
                    type="text"
                    value={traveller.surname || ''}
                    onChange={(e) => handleTravellerChange(index, 'surname', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: 10,
                      border: '1.5px solid #cbd5e1',
                      fontSize: 16,
                      background: '#f8fafc',
                      outline: 'none',
                      transition: 'border 0.2s',
                      minHeight: 44
                    }}
                    required
                  />
                  <div style={{ minHeight: 18, color: '#ef4444', fontSize: 13, marginTop: 2, fontWeight: 500 }}>
                    {errors[index]?.surname}
                  </div>
                </div>
                {/* Email (only for leader) */}
                {traveller.isLeader && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <label style={{ fontWeight: 700, color: '#1e293b', fontSize: 15, marginBottom: 2, letterSpacing: 0.2 }}>Email *</label>
                    <input
                      type="email"
                      value={traveller.email || ''}
                      onChange={(e) => handleTravellerChange(index, 'email', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: 10,
                        border: '1.5px solid #cbd5e1',
                        fontSize: 16,
                        background: '#f8fafc',
                        outline: 'none',
                        transition: 'border 0.2s',
                        minHeight: 44
                      }}
                      required
                    />
                    <div style={{ minHeight: 18, color: '#ef4444', fontSize: 13, marginTop: 2, fontWeight: 500 }}>
                      {errors[index]?.email}
                    </div>
                  </div>
                )}
                {/* Phone (only for leader) */}
                {traveller.isLeader && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <label style={{ fontWeight: 700, color: '#1e293b', fontSize: 15, marginBottom: 2, letterSpacing: 0.2 }}>Phone *</label>
                    <input
                      type="tel"
                      value={traveller.phone || ''}
                      onChange={(e) => handleTravellerChange(index, 'phone', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: 10,
                        border: '1.5px solid #cbd5e1',
                        fontSize: 16,
                        background: '#f8fafc',
                        outline: 'none',
                        transition: 'border 0.2s',
                        minHeight: 44
                      }}
                      required
                    />
                    <div style={{ minHeight: 18, color: '#ef4444', fontSize: 13, marginTop: 2, fontWeight: 500 }}>
                      {errors[index]?.phone}
                    </div>
                  </div>
                )}
                {/* Birth Date */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <label style={{ fontWeight: 700, color: '#1e293b', fontSize: 15, marginBottom: 2, letterSpacing: 0.2 }}>Birth Date *</label>
                  <input
                    type="date"
                    value={traveller.birthDate || ''}
                    onChange={(e) => handleTravellerChange(index, 'birthDate', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: 10,
                      border: '1.5px solid #cbd5e1',
                      fontSize: 16,
                      background: '#f8fafc',
                      outline: 'none',
                      transition: 'border 0.2s',
                      minHeight: 44
                    }}
                    required
                  />
                  <div style={{ minHeight: 18, color: '#ef4444', fontSize: 13, marginTop: 2, fontWeight: 500 }}>
                    {errors[index]?.birthDate}
                  </div>
                </div>
                {/* Nationality */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <label style={{ fontWeight: 700, color: '#1e293b', fontSize: 15, marginBottom: 2, letterSpacing: 0.2 }}>Nationality *</label>
                  <input
                    type="text"
                    value={traveller.nationality || ''}
                    onChange={(e) => handleTravellerChange(index, 'nationality', e.target.value)}
                    placeholder="e.g., TR, US, DE"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: 10,
                      border: '1.5px solid #cbd5e1',
                      fontSize: 16,
                      background: '#f8fafc',
                      outline: 'none',
                      transition: 'border 0.2s',
                      minHeight: 44
                    }}
                    required
                  />
                  <div style={{ minHeight: 18, color: '#ef4444', fontSize: 13, marginTop: 2, fontWeight: 500 }}>
                    {errors[index]?.nationality}
                  </div>
                </div>
                {/* Passport Number */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <label style={{ fontWeight: 700, color: '#1e293b', fontSize: 15, marginBottom: 2, letterSpacing: 0.2 }}>Passport Number</label>
                  <input
                    type="text"
                    value={traveller.passportNumber || ''}
                    onChange={(e) => handleTravellerChange(index, 'passportNumber', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: 10,
                      border: '1.5px solid #cbd5e1',
                      fontSize: 16,
                      background: '#f8fafc',
                      outline: 'none',
                      transition: 'border 0.2s',
                      minHeight: 44
                    }}
                  />
                  <div style={{ minHeight: 18, color: '#ef4444', fontSize: 13, marginTop: 2, fontWeight: 500 }}>
                    {errors[index]?.passportNumber}
                  </div>
                </div>
                {/* Passport Expiry */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <label style={{ fontWeight: 700, color: '#1e293b', fontSize: 15, marginBottom: 2, letterSpacing: 0.2 }}>Passport Expiry Date</label>
                  <input
                    type="date"
                    value={traveller.passportExpiry || ''}
                    onChange={(e) => handleTravellerChange(index, 'passportExpiry', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: 10,
                      border: '1.5px solid #cbd5e1',
                      fontSize: 16,
                      background: '#f8fafc',
                      outline: 'none',
                      transition: 'border 0.2s',
                      minHeight: 44
                    }}
                  />
                  <div style={{ minHeight: 18, color: '#ef4444', fontSize: 13, marginTop: 2, fontWeight: 500 }}>
                    {errors[index]?.passportExpiry}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Error Message */}
          {error && (
            <div style={{
              color: '#dc2626',
              backgroundColor: '#fef2f2',
              border: '2px solid #fecaca',
              borderRadius: 8,
              padding: '16px',
              marginBottom: '24px',
              fontWeight: 600
            }}>
              ❌ {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !isFormValid}
            style={{
              background: 'linear-gradient(90deg, #2563eb 0%, #1e3a8a 100%)',
              color: 'white',
              fontWeight: 900,
              fontSize: 20,
              padding: '16px 48px',
              border: 'none',
              borderRadius: 12,
              cursor: loading || !isFormValid ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 16px #2563eb33',
              letterSpacing: 1,
              transition: 'all 0.2s',
              opacity: loading ? 0.7 : 1,
              width: '100%'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background = 'linear-gradient(90deg, #1e3a8a 0%, #2563eb 100%)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px #2563eb44';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.background = 'linear-gradient(90deg, #2563eb 0%, #1e3a8a 100%)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px #2563eb33';
              }
            }}
          >
            {loading ? 'Processing...' : 'Complete Booking'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingPage; 