import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './HotelList.css';
import { FaHome, FaSearch, FaBookmark } from 'react-icons/fa';

interface Hotel {
  id: string;
  name: string;
  stars: number;
  rating: number;
  address: string;
  thumbnail: string;
  thumbnailFull: string;
  city?: {
    name: string;
  };
  country?: {
    name: string;
  };
  location?: {
    name: string;
  };
  hotelCategory?: {
    name: string;
  };
  facilities?: Array<{
    id: string;
    name: string;
    priced: boolean;
  }>;
  offers: Array<{
    price: {
      amount: number;
      currency: string;
      percent: number;
      oldAmount: number;
    };
    checkIn: string;
    night: number;
    offerId: string;
    available: boolean;
    productType: number;
    productId: string;
  }>;
  description?: {
    text: string;
  };
  ownerProvider?: string;
}

interface RoomDetail {
  adults: number;
  children: number;
  childAges: number[];
}

interface HotelListProps {
  searchParams?: {
    destination: string;
    destinationName: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    rooms: number;
    currency: string;
    nationality: string;
    roomDetails?: RoomDetail[];
  };
}

const HotelList: React.FC<HotelListProps> = ({ searchParams: propSearchParams }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = propSearchParams || location.state?.searchParams;
  
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [searchId, setSearchId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'stars'>('price');
  const [filterStars, setFilterStars] = useState<number[]>([]);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 10000 });
  


  useEffect(() => {
    if (searchParams) {
      fetchHotels();
    } else {
      // If no search params, redirect to home
      navigate('/', { replace: true });
    }
  }, [searchParams, navigate]);



  const fetchHotels = async () => {
    if (!searchParams) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      // Calculate nights between check-in and check-out
      const checkInDate = new Date(searchParams.checkIn);
      const checkOutDate = new Date(searchParams.checkOut);
      const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

      // Use room details if available, otherwise calculate from total guests
      let roomCriteria;
      if (searchParams.roomDetails && searchParams.roomDetails.length > 0) {
        roomCriteria = searchParams.roomDetails.map((room: RoomDetail) => {
          if (room.childAges && room.childAges.length > 0) {
            return { adult: room.adults, childAges: room.childAges };
          } else {
            return { adult: room.adults };
          }
        });
      } else {
        // Fallback: calculate total adults and children
        const totalAdults = Math.min(searchParams.guests, 9); // Max 9 adults
        const totalChildren = Math.max(0, searchParams.guests - totalAdults);
        if (totalChildren > 0) {
          roomCriteria = [
            {
              adult: totalAdults,
              childAges: Array(totalChildren).fill(5) // Default age 5 for children
            }
          ];
        } else {
          roomCriteria = [
            {
              adult: totalAdults
            }
          ];
        }
      }
      
      const requestBody = {
        checkAllotment: true,
        checkStopSale: true,
        getOnlyDiscountedPrice: false,
        getOnlyBestOffers: true,
        productType: 2,
        arrivalLocations: [
          {
            id: searchParams.destination,
            type: 2 // Assuming city type
          }
        ],
        roomCriteria: roomCriteria,
        nationality: searchParams.nationality,
        checkIn: searchParams.checkIn,
        night: nights,
        currency: searchParams.currency,
        culture: "en-US"
      };

      console.log('PriceSearch Request:', requestBody);

      const response = await fetch('http://localhost:8080/api/pricesearch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const responseText = await response.text();
        
        if (!responseText || responseText.trim() === '') {
          setError('Empty response from server');
          return;
        }
        
        try {
          const data = JSON.parse(responseText);
          console.log('PriceSearch Response:', data); // DEBUG
          if (data.body && data.body.hotels) {
            setHotels(data.body.hotels);
            let extractedSearchId = '';
            if (data.body && data.body.searchId) {
              extractedSearchId = data.body.searchId;
            } else if (data.searchId) {
              extractedSearchId = data.searchId;
            }
            setSearchId(extractedSearchId || '');
            console.log('Extracted searchId:', extractedSearchId); // DEBUG
          } else {
            console.log('No hotels in response body:', data);
            setError('No hotels found in response');
          }
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          console.error('Response text:', responseText);
          setError('Invalid response format from server');
        }
      } else {
        const errorText = await response.text();
        setError(`Failed to fetch hotels: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error fetching hotels:', error);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getBestOffer = (hotel: Hotel) => {
    if (!hotel.offers || hotel.offers.length === 0) return null;
    
    // Sort by price and return the cheapest available offer
    const availableOffers = hotel.offers.filter(offer => offer.available);
    if (availableOffers.length === 0) return null;
    
    return availableOffers.sort((a, b) => a.price.amount - b.price.amount)[0];
  };

  const getFacilityIcon = (facilityName: string) => {
    const name = facilityName.toLowerCase();
    if (name.includes('wifi') || name.includes('internet')) return '📶';
    if (name.includes('pool') || name.includes('swimming')) return '🏊';
    if (name.includes('parking') || name.includes('car')) return '🚗';
    if (name.includes('restaurant') || name.includes('dining')) return '🍽️';
    if (name.includes('bed') || name.includes('room')) return '🛏️';
    return '💳';
  };



  const renderStars = (stars: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span 
        key={i} 
        className={i < Math.floor(stars) ? 'star-filled' : 'star-empty'}
        style={{ fontSize: '14px' }}
      >
        ⭐
      </span>
    ));
  };

  const filteredAndSortedHotels = hotels
    .filter(hotel => {
      // Filter by stars
      if (filterStars.length > 0 && !filterStars.includes(Math.floor(hotel.stars))) {
        return false;
      }
      
      // Filter by price range
      const bestOffer = getBestOffer(hotel);
      if (bestOffer) {
        const price = bestOffer.price.amount;
        if (price < priceRange.min || price > priceRange.max) {
          return false;
        }
      }
      
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price':
          const offerA = getBestOffer(a);
          const offerB = getBestOffer(b);
          if (!offerA && !offerB) return 0;
          if (!offerA) return 1;
          if (!offerB) return -1;
          return offerA.price.amount - offerB.price.amount;
        case 'rating':
          console.log('SORTING BY RATING:', a.name, a.rating, b.name, b.rating);
          return (parseFloat(b.rating as any) || 0) - (parseFloat(a.rating as any) || 0);
        case 'stars':
          return b.stars - a.stars;
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="hotel-list-loading">
        <div className="loading-spinner"></div>
        <p>Searching for hotels...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="hotel-list-error">
        <div className="error-icon">⚠️</div>
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={fetchHotels} className="retry-btn">Try Again</button>
      </div>
    );
  }

  const backgroundUrl = process.env.PUBLIC_URL + '/pexels-pixabay-50594.jpg';

  return (
    <div className="hotel-list-root" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* HEADER */}
      <header style={{ 
        width: '100%', 
        background: '#1e3a8a', 
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)', 
        padding: '24px 0 12px 0', 
        marginBottom: 32, 
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
              src={process.env.PUBLIC_URL + '/WhatsApp Image 2025-07-08 at 09.35.08_7abde45a.jpg'} 
              alt="Logo" 
              style={{ height: 48, borderRadius: 12, marginRight: 16 }} 
            />
            <span style={{ fontWeight: 800, fontSize: 28, color: 'white', letterSpacing: -1 }}>HotelRes</span>
          </div>
          <nav style={{ display: 'flex', gap: 32 }}>
            <a href="#" className="nav-btn">
              {FaHome({ style: { marginRight: 8, fontSize: 20 } })} Home
            </a>
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
            <a href="#" className="nav-btn">
              {FaBookmark({ style: { marginRight: 8, fontSize: 20 } })} My Reservations
            </a>
          </nav>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="hotel-list-container" style={{ 
          background: 'rgba(255,255,255,0.92)', 
          borderRadius: 18, 
          boxShadow: '0 4px 24px rgba(80,80,160,0.10)', 
          margin: '0 auto', 
          maxWidth: 1400, 
          padding: '32px 0'
        }}>
          {/* Header */}
          <div className="hotel-list-header">
            <div className="header-back">
              <button 
                onClick={() => navigate('/')} 
                className="header-btn"
                title="Back to Search"
              >
                ← Back to Search
              </button>
            </div>
            <div className="header-center">
              <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                <img 
                  src={process.env.PUBLIC_URL + '/WhatsApp Image 2025-07-08 at 09.35.08_7abde45a.jpg'}
                  alt="HotelRes Logo"
                  style={{ height: 48, borderRadius: 12, marginRight: 16, verticalAlign: 'middle' }}
                />
                Hotels in {searchParams?.destinationName || 'Unknown'}
              </h1>
              <p>
                {searchParams?.checkIn} - {searchParams?.checkOut} • 
                {searchParams?.guests} Guest{searchParams?.guests !== 1 ? 's' : ''} • 
                {searchParams?.rooms} Room{searchParams?.rooms !== 1 ? 's' : ''}
              </p>
              <p className="results-count">
                {filteredAndSortedHotels.length} hotel{filteredAndSortedHotels.length !== 1 ? 's' : ''} found
              </p>
            </div>
            <div className="header-sort">
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value as 'price' | 'rating' | 'stars')}
                className="sort-select"
              >
                <option value="price">Sort by Price</option>
                <option value="rating">Sort by Rating</option>
                <option value="stars">Sort by Stars</option>
              </select>
            </div>
          </div>

          <div className="hotel-list-content">
            {/* Filters Sidebar */}
            <div className="filters-sidebar">
              <h3>🔍 Filters</h3>
              
              {/* Star Rating Filter */}
              <div className="filter-section">
                <h4>Star Rating</h4>
                {[5, 4, 3, 2, 1].map(stars => (
                  <label key={stars} className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={filterStars.includes(stars)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilterStars([...filterStars, stars]);
                        } else {
                          setFilterStars(filterStars.filter(s => s !== stars));
                        }
                      }}
                    />
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="hotel-stars">
                        {Array.from({ length: 5 }, (_, i) => (
                          <span key={i} className={i < stars ? 'star-filled' : 'star-empty'} style={{ fontSize: '18px' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" style={{ verticalAlign: 'middle', display: 'block' }}>
                              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill={i < stars ? '#fbbf24' : '#d1d5db'} />
                            </svg>
                          </span>
                        ))}
                      </span>
                      <span className="star-label" style={{ marginLeft: 10, minWidth: 60, whiteSpace: 'nowrap' }}>{stars} Star{stars !== 1 ? 's' : ''}</span>
                    </span>
                  </label>
                ))}
              </div>

              {/* Price Range Filter */}
              <div className="filter-section">
                <h4>Price Range</h4>
                <div className="price-range">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                    className="price-input"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                    className="price-input"
                  />
                </div>
              </div>
            </div>

            {/* Hotels List */}
            <div className="hotels-grid">
              {filteredAndSortedHotels.length === 0 ? (
                <div className="no-hotels">
                  <div className="no-hotels-icon">🏨</div>
                  <h2>No hotels found</h2>
                  <p>Try adjusting your filters or search criteria</p>
                </div>
              ) : (
                filteredAndSortedHotels.map((hotel) => {
                  const bestOffer = getBestOffer(hotel);
                  
                  return (
                    <div key={hotel.id} className="hotel-card">
                      {/* Hotel Image */}
                      <div className="hotel-image">
                        <img 
                          src={hotel.thumbnailFull || hotel.thumbnail || process.env.PUBLIC_URL + '/fernando-alvarez-rodriguez-M7GddPqJowg-unsplash.jpg'} 
                          alt={hotel.name}
                          onError={(e) => {
                            e.currentTarget.src = process.env.PUBLIC_URL + '/fernando-alvarez-rodriguez-M7GddPqJowg-unsplash.jpg';
                          }}
                        />
                        <div className="hotel-actions">
                          <button className="action-btn favorite-btn">
                            ❤️
                          </button>
                          <button className="action-btn share-btn">
                            📤
                          </button>
                        </div>
                      </div>

                      {/* Hotel Info */}
                      <div className="hotel-info">
                        <div className="hotel-header">
                          <h3 className="hotel-name">{hotel.name}</h3>
                        </div>

                        <div className="hotel-location">
                          📍
                          <span>
                            {hotel.city?.name || hotel.location?.name || 'Unknown location'}
                            {hotel.country?.name && `, ${hotel.country.name}`}
                          </span>
                        </div>

                        {hotel.description?.text && (
                          <p className="hotel-description">
                            {hotel.description.text.substring(0, 150)}...
                          </p>
                        )}

                        {/* Facilities */}
                        {hotel.facilities && hotel.facilities.length > 0 && (
                          <div className="hotel-facilities">
                            {hotel.facilities.slice(0, 4).map((facility, index) => (
                              <span key={index} className="facility-tag">
                                {getFacilityIcon(facility.name)}
                                {facility.name}
                              </span>
                            ))}
                            {hotel.facilities.length > 4 && (
                              <span className="facility-more">+{hotel.facilities.length - 4} more</span>
                            )}
                          </div>
                        )}

                        {/* YENİ: Fiyat ve Yıldızlar Yanyana */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                          {/* Yıldızlar */}
                          <div className="hotel-stars">
                            {Array.from({ length: 5 }, (_, i) => {
                              const fullStars = Math.floor(hotel.stars);
                              const hasHalfStar = hotel.stars % 1 >= 0.5;
                              // SVG yıldız path'i
                              const starSvg = (fill: string) => (
                                <svg width="22" height="22" viewBox="0 0 24 24" style={{ verticalAlign: 'middle', display: 'block' }}>
                                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill={fill} />
                                </svg>
                              );
                              if (i < fullStars) {
                                // Dolu yıldız
                                return (
                                  <span key={i} style={{ display: 'inline-flex', alignItems: 'center' }}>
                                    {starSvg('#fbbf24')}
                                  </span>
                                );
                              } else if (i === fullStars && hasHalfStar) {
                                // Yarım yıldız
                                return (
                                  <span key={i} style={{ display: 'inline-flex', alignItems: 'center' }}>
                                    <svg width="22" height="22" viewBox="0 0 24 24" style={{ verticalAlign: 'middle', display: 'block' }}>
                                      <defs>
                                        <linearGradient id={`half-star-${hotel.id}-${i}`} x1="0" y1="0" x2="1" y2="0">
                                          <stop offset="50%" stopColor="#fbbf24"/>
                                          <stop offset="50%" stopColor="#d1d5db"/>
                                        </linearGradient>
                                      </defs>
                                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill={`url(#half-star-${hotel.id}-${i})`} />
                                    </svg>
                                  </span>
                                );
                              } else {
                                // Boş yıldız
                                return (
                                  <span key={i} style={{ display: 'inline-flex', alignItems: 'center' }}>
                                    {starSvg('#d1d5db')}
                                  </span>
                                );
                              }
                            })}
                            <span className="star-count" style={{ marginLeft: 4 }}>({hotel.stars})</span>
                          </div>
                          {/* Rating biraz aşağıda, kart yüksekliği için margin/padding artırıldı */}
                          <div style={{ fontWeight: 500, color: '#64748b', fontSize: '0.98rem', lineHeight: 1, marginTop: 12, marginBottom: 4 }}>
                            Rating: {hotel.rating}
                          </div>
                          {/* Fiyat ve Book Now */}
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                            {/* Price Box */}
                            <div style={{ background: 'rgba(30, 58, 138, 0.06)', borderRadius: 10, padding: '12px 18px', marginBottom: 6, minWidth: 140, boxShadow: '0 2px 8px rgba(30,58,138,0.04)', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                              {bestOffer ? (
                                <div className="price-info" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                  <div className="price-main">
                                    <span className="price-amount">
                                      {bestOffer.price.currency} {bestOffer.price.amount}
                                    </span>
                                    <span className="price-per-night" style={{ marginLeft: 8 }}>
                                      per {bestOffer.night} night{bestOffer.night !== 1 ? 's' : ''}
                                    </span>
                                  </div>
                                  {bestOffer.price.percent < 0 && (
                                    <div className="price-discount" style={{ marginTop: 4 }}>
                                      <span className="old-price">
                                        {bestOffer.price.currency} {bestOffer.price.oldAmount}
                                      </span>
                                      <span className="discount-percent">
                                        {Math.abs(bestOffer.price.percent)}% OFF
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="no-availability">
                                  <span>No availability</span>
                                </div>
                              )}
                            </div>
                            {/* See Details of Offer Button */}
                            {bestOffer ? (
                              <button
                                className="see-details-btn"
                                onClick={() => {
                                  console.log('Navigating with searchId:', searchId); // DEBUG
                                  const ownerProviderParam = hotel.ownerProvider ? `&ownerProvider=${encodeURIComponent(String(hotel.ownerProvider))}` : '';
                                  navigate(`/hotel-details/${hotel.id}?searchId=${encodeURIComponent(searchId)}&offerId=${encodeURIComponent(bestOffer.offerId)}&currency=${encodeURIComponent(bestOffer.price.currency)}&productType=2&productId=${encodeURIComponent(hotel.id)}${ownerProviderParam}`);
                                }}
                                style={{ marginTop: 8, width: '100%', background: '#2563eb', color: 'white', fontWeight: 700, borderRadius: 8, padding: '10px 0', fontSize: 16, border: 'none', cursor: 'pointer', boxShadow: '0 2px 8px #2563eb22', opacity: bestOffer.available ? 1 : 0.5 }}
                                disabled={!bestOffer.available}
                              >
                                See Details
                              </button>
                            ) : (
                              <button className="see-details-btn" disabled style={{ marginTop: 8, width: '100%', background: '#d1d5db', color: '#64748b', fontWeight: 700, borderRadius: 8, padding: '10px 0', fontSize: 16, border: 'none', cursor: 'not-allowed', opacity: 0.7 }}>
                                No Offer Available
                              </button>
                            )}
                            

                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>



      {/* FOOTER */}
      <footer className="footer" style={{ 
        marginTop: 'auto',
        backgroundColor: '#1e3a8a', 
        color: 'white', 
        padding: '40px 0 20px 0',
        width: '100%'
      }}>
        <div className="footer-content" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div className="footer-section" style={{ marginBottom: '30px' }}>
            <h3 style={{ color: '#fbbf24', marginBottom: '15px', fontSize: '1.5rem' }}>🏨 HotelRes</h3>
            <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>En iyi otel deneyimi için güvenilir partneriniz</p>
            <div className="social-links" style={{ display: 'flex', gap: '15px' }}>
              <a href="#" className="social-link" style={{ color: 'white', textDecoration: 'none', padding: '8px 12px', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.1)', transition: 'all 0.3s ease' }}>📘 Facebook</a>
              <a href="#" className="social-link" style={{ color: 'white', textDecoration: 'none', padding: '8px 12px', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.1)', transition: 'all 0.3s ease' }}>📷 Instagram</a>
              <a href="#" className="social-link" style={{ color: 'white', textDecoration: 'none', padding: '8px 12px', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.1)', transition: 'all 0.3s ease' }}>🐦 Twitter</a>
            </div>
          </div>
          <div className="footer-section" style={{ marginBottom: '30px' }}>
            <h4 style={{ color: '#fbbf24', marginBottom: '15px', fontSize: '1.2rem' }}>🔍 Hızlı Erişim</h4>
            <ul className="footer-links" style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '10px' }}><a href="#" style={{ color: 'white', textDecoration: 'none', transition: 'color 0.3s ease' }}>🏠 Ana Sayfa</a></li>
              <li style={{ marginBottom: '10px' }}><a href="#" style={{ color: 'white', textDecoration: 'none', transition: 'color 0.3s ease' }}>🔍 Otel Ara</a></li>
              <li style={{ marginBottom: '10px' }}><a href="#" style={{ color: 'white', textDecoration: 'none', transition: 'color 0.3s ease' }}>📋 Rezervasyonlarım</a></li>
              <li style={{ marginBottom: '10px' }}><a href="#" style={{ color: 'white', textDecoration: 'none', transition: 'color 0.3s ease' }}>⭐ Favorilerim</a></li>
            </ul>
          </div>
          <div className="footer-section" style={{ marginBottom: '30px' }}>
            <h4 style={{ color: '#fbbf24', marginBottom: '15px', fontSize: '1.2rem' }}>📞 İletişim</h4>
            <ul className="footer-links" style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '10px', color: 'white' }}>📧 info@hotelres.com</li>
              <li style={{ marginBottom: '10px', color: 'white' }}>�� +90 212 555 0123</li>
              <li style={{ marginBottom: '10px', color: 'white' }}>📍 İstanbul, Türkiye</li>
              <li style={{ marginBottom: '10px', color: 'white' }}>🕒 7/24 Destek</li>
            </ul>
          </div>
          <div className="footer-section" style={{ marginBottom: '30px' }}>
            <h4 style={{ color: '#fbbf24', marginBottom: '15px', fontSize: '1.2rem' }}>💳 Ödeme Yöntemleri</h4>
            <div className="payment-methods" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              <span className="payment-method" style={{ color: 'white', padding: '6px 10px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.1)', fontSize: '0.9rem' }}>💳 Visa</span>
              <span className="payment-method" style={{ color: 'white', padding: '6px 10px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.1)', fontSize: '0.9rem' }}>💳 MasterCard</span>
              <span className="payment-method" style={{ color: 'white', padding: '6px 10px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.1)', fontSize: '0.9rem' }}>💳 PayPal</span>
              <span className="payment-method" style={{ color: 'white', padding: '6px 10px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.1)', fontSize: '0.9rem' }}>🏦 Bank Transfer</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom" style={{ borderTop: '1px solid rgba(255,255,255,0.2)', marginTop: '30px', paddingTop: '20px', textAlign: 'center' }}>
          <p style={{ marginBottom: '15px', color: 'rgba(255,255,255,0.8)' }}>&copy; 2024 HotelRes. Tüm hakları saklıdır.</p>
          <div className="footer-bottom-links" style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <a href="#" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.3s ease' }}>Gizlilik Politikası</a>
            <a href="#" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.3s ease' }}>Kullanım Şartları</a>
            <a href="#" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.3s ease' }}>Çerez Politikası</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HotelList; 