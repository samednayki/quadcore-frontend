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
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff' }}>
        <div className="hotel-list-container" style={{ 
          background: '#fff', 
          borderRadius: 0, 
          boxShadow: 'none', 
          margin: '0 auto', 
          maxWidth: 1400, 
          padding: '32px 0',
          border: 'none'
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

          <div className="hotel-list-content" style={{ display: 'flex', flexDirection: 'row', alignItems: 'stretch', gap: 0 }}>
            {/* Filters Sidebar */}
            <div className="filters-sidebar" style={{
              background: '#fff',
              border: '1.5px solid #e5e7eb',
              borderRadius: 18,
              boxShadow: 'none',
              padding: '32px 24px',
              minWidth: 220,
              marginRight: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              height: '100%'
            }}>
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
            {/* Sidebar ile otel listesi arasında ince çizgi */}
            <div style={{ width: 2, background: '#e5e7eb', minHeight: '100%', margin: '0 32px' }}></div>
            {/* Hotels List */}
            <div className="hotels-grid" style={{ background: '#fff', boxShadow: 'none', border: 'none', flex: 1 }}>
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
                    <div key={hotel.id} className="hotel-card" 
                      style={{
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'stretch',
                        background: '#fff',
                        border: '1.5px solid #e5e7eb',
                        boxShadow: '0 2px 12px rgba(80,80,160,0.07)',
                        borderRadius: 22,
                        marginBottom: 32,
                        padding: '40px 40px 40px 40px',
                        minHeight: 220
                      }}
                      onClick={() => {
                        if (bestOffer) {
                          const ownerProviderParam = hotel.ownerProvider ? `&ownerProvider=${encodeURIComponent(String(hotel.ownerProvider))}` : '';
                          navigate(`/hotel-details/${hotel.id}?searchId=${encodeURIComponent(searchId)}&offerId=${encodeURIComponent(bestOffer.offerId)}&currency=${encodeURIComponent(bestOffer.price.currency)}&productType=2&productId=${encodeURIComponent(hotel.id)}${ownerProviderParam}`);
                        }
                      }}
                    >
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
                      {/* Sağdaki içerik ve fiyatı iki sütuna ayır */}
                      <div style={{ display: 'flex', flex: 1, flexDirection: 'row', alignItems: 'stretch' }}>
                        {/* Sol ana içerik */}
                        <div style={{ flex: 3, padding: '32px 32px 32px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                          {/* Hotel Info */}
                          <div className="hotel-header" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <h3 className="hotel-name" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b', margin: 0, marginBottom: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                              {hotel.name}
                              <span className="hotel-stars" style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 18, marginLeft: 8 }}>
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
                              </span>
                            </h3>
                          </div>

                          <div className="hotel-location">
                            📍
                            <span>
                              {hotel.city?.name && <span>{hotel.city.name}</span>}
                              {hotel.country?.name && <span>, {hotel.country.name}</span>}
                            </span>
                          </div>

                          {hotel.description?.text && (
                            <p className="hotel-description" style={{ maxWidth: '60%', whiteSpace: 'normal', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 18 }}>
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
                          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 12 }}>
                            <div style={{ fontWeight: 500, color: '#64748b', fontSize: '0.98rem', lineHeight: 1, marginTop: 12, marginBottom: 4 }}>
                              Rating: {hotel.rating}
                            </div>
                          </div>
                        </div>
                        {/* Sağ fiyat sütunu */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: 180 }}>
                          {bestOffer ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                              <span style={{ fontSize: '2.2rem', fontWeight: 900, color: '#181818', lineHeight: 1, marginBottom: 0, textAlign: 'center' }}>
                                {bestOffer.price.currency} {bestOffer.price.amount}
                              </span>
                              <span style={{ fontSize: '0.98rem', color: '#64748b', fontWeight: 500, opacity: 0.7, marginTop: 2, textAlign: 'center' }}>
                                /per {bestOffer.night} night{bestOffer.night !== 1 ? 's' : ''}
                              </span>
                            </div>
                          ) : (
                            <div className="no-availability">
                              <span>No availability</span>
                            </div>
                          )}
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
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        color: 'white',
        padding: '3.5rem 0 1.5rem 0',
        width: '100%',
        border: 'none',
        boxShadow: 'none',
        position: 'relative',
        overflow: 'hidden',
        zIndex: 1
      }}>
        <div className="footer-content" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2.5rem', position: 'relative', zIndex: 3 }}>
          <div className="footer-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
            <div style={{ fontWeight: 600, fontSize: '1.08rem', marginBottom: 8 }}>Your trusted partner for the best hotel experience</div>
            <div style={{ color: '#b0b0b0', fontSize: '1rem', marginBottom: 8 }}>Facebook</div>
            <div style={{ color: '#b0b0b0', fontSize: '1rem', marginBottom: 8 }}>Instagram</div>
            <div style={{ color: '#b0b0b0', fontSize: '1rem' }}>Twitter</div>
          </div>
          <div className="footer-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
            <div style={{ fontWeight: 700, fontSize: '1.08rem', marginBottom: 8, color: 'white', borderLeft: '3px solid #7c83fd', paddingLeft: 8 }}>Quick Access</div>
            <div style={{ color: '#b0b0b0', fontSize: '1rem', marginBottom: 8 }}>Home Page</div>
            <div style={{ color: '#b0b0b0', fontSize: '1rem', marginBottom: 8 }}>Search Hotels</div>
            <div style={{ color: '#b0b0b0', fontSize: '1rem', marginBottom: 8 }}>My Reservations</div>
            <div style={{ color: '#b0b0b0', fontSize: '1rem' }}>My favorites</div>
          </div>
          <div className="footer-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
            <div style={{ fontWeight: 700, fontSize: '1.08rem', marginBottom: 8, color: 'white', borderLeft: '3px solid #7c83fd', paddingLeft: 8 }}>Contact</div>
            <div style={{ color: '#b0b0b0', fontSize: '1rem', marginBottom: 8 }}>info@hotelres.com</div>
            <div style={{ color: '#b0b0b0', fontSize: '1rem', marginBottom: 8 }}>+90 212 555 0123</div>
            <div style={{ color: '#b0b0b0', fontSize: '1rem', marginBottom: 8 }}>Antalya, Turkey</div>
            <div style={{ color: '#b0b0b0', fontSize: '1rem' }}>7/24 Support</div>
          </div>
          <div className="footer-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
            <div style={{ fontWeight: 700, fontSize: '1.08rem', marginBottom: 8, color: 'white', borderLeft: '3px solid #7c83fd', paddingLeft: 8 }}>Payment Methods</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ color: '#b0b0b0', fontSize: '1rem', border: '1px solid #7c83fd', borderRadius: 16, padding: '4px 16px', fontWeight: 500 }}>Visa</span>
              <span style={{ color: '#b0b0b0', fontSize: '1rem', border: '1px solid #7c83fd', borderRadius: 16, padding: '4px 16px', fontWeight: 500 }}>MasterCard</span>
              <span style={{ color: '#b0b0b0', fontSize: '1rem', border: '1px solid #7c83fd', borderRadius: 16, padding: '4px 16px', fontWeight: 500 }}>PayPal</span>
              <span style={{ color: '#b0b0b0', fontSize: '1rem', border: '1px solid #7c83fd', borderRadius: 16, padding: '4px 16px', fontWeight: 500 }}>Bank Transfer</span>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #2d3250', margin: '2.5rem 0 0 0', width: '100%' }}></div>
        <div className="footer-bottom" style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.2rem 2rem 0 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', position: 'relative', zIndex: 1, color: '#b0b0b0', fontSize: '1rem' }}>
          <span>© 2025 HotelRes. All rights reserved.</span>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <a href="#" style={{ color: '#b0b0b0', fontSize: '1rem', textDecoration: 'none' }}>Privacy Policy</a>
            <a href="#" style={{ color: '#b0b0b0', fontSize: '1rem', textDecoration: 'none' }}>Terms of Use</a>
            <a href="#" style={{ color: '#b0b0b0', fontSize: '1rem', textDecoration: 'none' }}>Cookie Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HotelList; 