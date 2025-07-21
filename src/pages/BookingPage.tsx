import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaSearch, FaBookmark, FaArrowLeft } from 'react-icons/fa';

const BookingPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { transactionData, hotelData, offerData } = location.state || {};
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleTravellerChange = (index: number, field: string, value: string) => {
    const updatedTravellers = [...travellers];
    updatedTravellers[index] = {
      ...updatedTravellers[index],
      [field]: value
    };
    setTravellers(updatedTravellers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      const requiredFields = ['name', 'surname', 'email', 'birthDate', 'nationality'];
      const missingFields = travellers.some(traveller => 
        requiredFields.some(field => !traveller[field])
      );

      if (missingFields) {
        setError('Please fill in all required fields for all travellers.');
        setLoading(false);
        return;
      }

      // Here you would typically call the SetReservationInfo API
      // For now, we'll just show a success message
      alert('Booking information submitted successfully!');
      
    } catch (err) {
      setError('Failed to submit booking information.');
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
            <a href="#" className="nav-btn">
              {FaBookmark({ style: { marginRight: 8, fontSize: 20 } })} My Reservations
            </a>
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
          borderRadius: 16,
          boxShadow: '0 4px 24px #1e3a8a11',
          padding: '32px'
        }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 24px 0', color: '#1e3a8a' }}>
            Traveller Information
          </h2>

          {travellers.map((traveller, index) => (
            <div key={index} style={{
              border: '2px solid #e0e7ff',
              borderRadius: 12,
              padding: '24px',
              marginBottom: '24px',
              backgroundColor: '#f8fafc'
            }}>
              <h3 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 16px 0', color: '#2563eb' }}>
                Traveller {index + 1} {traveller.isLeader ? '(Leader)' : ''}
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
                {/* Title */}
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                    Title *
                  </label>
                  <select
                    value={traveller.title || ''}
                    onChange={(e) => handleTravellerChange(index, 'title', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #d1d5db',
                      borderRadius: 8,
                      fontSize: '16px',
                      backgroundColor: '#fff'
                    }}
                    required
                  >
                    <option value="">Select Title</option>
                    {traveller.availableTitles?.map((title: any) => (
                      <option key={title.id} value={title.id}>{title.name}</option>
                    ))}
                  </select>
                </div>

                {/* Name */}
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={traveller.name || ''}
                    onChange={(e) => handleTravellerChange(index, 'name', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #d1d5db',
                      borderRadius: 8,
                      fontSize: '16px'
                    }}
                    required
                  />
                </div>

                {/* Surname */}
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={traveller.surname || ''}
                    onChange={(e) => handleTravellerChange(index, 'surname', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #d1d5db',
                      borderRadius: 8,
                      fontSize: '16px'
                    }}
                    required
                  />
                </div>

                {/* Email (only for leader) */}
                {traveller.isLeader && (
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                      Email *
                    </label>
                    <input
                      type="email"
                      value={traveller.email || ''}
                      onChange={(e) => handleTravellerChange(index, 'email', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #d1d5db',
                        borderRadius: 8,
                        fontSize: '16px'
                      }}
                      required
                    />
                  </div>
                )}

                {/* Phone (only for leader) */}
                {traveller.isLeader && (
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                      Phone *
                    </label>
                    <input
                      type="tel"
                      value={traveller.phone || ''}
                      onChange={(e) => handleTravellerChange(index, 'phone', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #d1d5db',
                        borderRadius: 8,
                        fontSize: '16px'
                      }}
                      required
                    />
                  </div>
                )}

                {/* Birth Date */}
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                    Birth Date *
                  </label>
                  <input
                    type="date"
                    value={traveller.birthDate || ''}
                    onChange={(e) => handleTravellerChange(index, 'birthDate', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #d1d5db',
                      borderRadius: 8,
                      fontSize: '16px'
                    }}
                    required
                  />
                </div>

                {/* Nationality */}
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                    Nationality *
                  </label>
                  <input
                    type="text"
                    value={traveller.nationality || ''}
                    onChange={(e) => handleTravellerChange(index, 'nationality', e.target.value)}
                    placeholder="e.g., TR, US, DE"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #d1d5db',
                      borderRadius: 8,
                      fontSize: '16px'
                    }}
                    required
                  />
                </div>

                {/* Passport Number */}
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                    Passport Number
                  </label>
                  <input
                    type="text"
                    value={traveller.passportNumber || ''}
                    onChange={(e) => handleTravellerChange(index, 'passportNumber', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #d1d5db',
                      borderRadius: 8,
                      fontSize: '16px'
                    }}
                  />
                </div>

                {/* Passport Expiry */}
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                    Passport Expiry Date
                  </label>
                  <input
                    type="date"
                    value={traveller.passportExpiry || ''}
                    onChange={(e) => handleTravellerChange(index, 'passportExpiry', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #d1d5db',
                      borderRadius: 8,
                      fontSize: '16px'
                    }}
                  />
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
            disabled={loading}
            style={{
              background: 'linear-gradient(90deg, #2563eb 0%, #1e3a8a 100%)',
              color: 'white',
              fontWeight: 900,
              fontSize: 20,
              padding: '16px 48px',
              border: 'none',
              borderRadius: 12,
              cursor: loading ? 'not-allowed' : 'pointer',
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