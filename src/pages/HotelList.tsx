import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './HotelList.css';
import { FaHome, FaSearch, FaBookmark, FaBed, FaCalendarAlt, FaUserFriends } from 'react-icons/fa';
import './SearchPage.css'; // SearchPage bar still uses this CSS

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
  
  const [destinationQuery, setDestinationQuery] = useState('');
  const [selectedDestination, setSelectedDestination] = useState<{ id: string; name: string; type: number } | null>(null);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteResults, setAutocompleteResults] = useState<any[]>([]);
  const [selectedCheckInDate, setSelectedCheckInDate] = useState<string | null>(null);
  const [selectedCheckOutDate, setSelectedCheckOutDate] = useState<string | null>(null);
  const [rooms, setRooms] = useState<RoomDetail[]>([]);


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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDestination && selectedCheckInDate && selectedCheckOutDate && rooms.length > 0) {
      const newSearchParams = {
        destination: selectedDestination.id,
        destinationName: selectedDestination.name,
        checkIn: selectedCheckInDate,
        checkOut: selectedCheckOutDate,
        guests: rooms.reduce((total, r) => total + r.adults, 0) + rooms.reduce((total, r) => total + r.children, 0),
        rooms: rooms.length,
        currency: 'USD', // Default currency
        nationality: 'US', // Default nationality
        roomDetails: rooms,
      };
      navigate('/hotels', { state: { searchParams: newSearchParams } });
    } else {
      alert('Please select destination, dates, and rooms.');
    }
  };

  const fetchAutocomplete = async (query: string) => {
    if (query.length < 3) {
      setAutocompleteResults([]);
      return;
    }
    try {
      const response = await fetch(`http://localhost:8080/api/autocomplete?query=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setAutocompleteResults(data.body.results);
      } else {
        setAutocompleteResults([]);
      }
    } catch (error) {
      console.error('Error fetching autocomplete:', error);
      setAutocompleteResults([]);
    }
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
        {/* NİZAMİ, BİRLEŞİK, MODERN SEARCH BAR */}
        <div style={{
          width: '100%',
          maxWidth: 1100,
          margin: '32px auto',
          display: 'flex',
          alignItems: 'center',
          height: 56,
          background: '#fff',
          borderRadius: 16,
          border: '2.5px solid #fbbf24',
          boxSizing: 'border-box',
          boxShadow: 'none',
          overflow: 'hidden',
        }}>
          {/* Destination */}
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            height: '100%',
            padding: '0 24px',
            background: '#fff',
            boxSizing: 'border-box',
          }}>
            {FaBed({ style: { fontSize: 22, color: '#2563eb', marginRight: 12 } })}
            <input
              className="destination-input-v2"
              type="text"
              placeholder="Where are you going?"
              value={destinationQuery}
              onChange={e => {
                setDestinationQuery(e.target.value);
                fetchAutocomplete(e.target.value);
              }}
              onFocus={() => { if (destinationQuery.length >= 3) setShowAutocomplete(true); }}
              onBlur={() => setTimeout(() => setShowAutocomplete(false), 300)}
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                width: '100%',
                fontWeight: destinationQuery ? 700 : 500,
                fontSize: 17,
                color: '#232931',
                fontFamily: 'Inter, Roboto, Segoe UI, Arial, sans-serif',
                transition: 'color 0.2s',
                padding: 0,
                lineHeight: 1,
                alignItems: 'center',
              }}
            />
            {destinationQuery && <span style={{ marginLeft: 8, color: '#888', fontSize: 20, cursor: 'pointer' }} onClick={() => { setDestinationQuery(''); setSelectedDestination(null); }}>×</span>}
            {showAutocomplete && (
              <div className="autocomplete-dropdown" style={{ position: 'absolute', top: 56, left: 0, right: 0, background: '#fff', border: '1.5px solid #fbbf24', borderRadius: 12, zIndex: 10, maxHeight: 220, overflowY: 'auto', boxShadow: '0 4px 24px #2563eb22' }}>
                {autocompleteResults.length > 0 ? autocompleteResults.map((item: any, idx: number) => (
                  <div key={idx} style={{ padding: 12, cursor: 'pointer', borderBottom: '1px solid #f3f3f3' }}
                    onMouseDown={() => {
                      setSelectedDestination({ id: item.id, name: item.name, type: item.type });
                      setDestinationQuery(item.name);
                      setShowAutocomplete(false);
                    }}
                  >{item.name}</div>
                )) : <div style={{ padding: 12, color: '#888' }}>No results</div>}
              </div>
            )}
          </div>
          {/* Separator */}
          <div style={{ width: 1.5, height: 40, background: '#fbbf24' }} />
          {/* Dates */}
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            height: '100%',
            padding: '0 24px',
            background: '#fff',
            boxSizing: 'border-box',
          }}>
            {FaCalendarAlt({ style: { fontSize: 22, color: '#eab308', marginRight: 12 } })}
            <span style={{ fontWeight: selectedCheckInDate && selectedCheckOutDate ? 700 : 500, fontSize: 17, color: '#232931', fontFamily: 'Inter, Roboto, Segoe UI, Arial, sans-serif', lineHeight: 1, alignItems: 'center' }}>
              {selectedCheckInDate && selectedCheckOutDate
                ? `${new Date(selectedCheckInDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} — ${new Date(selectedCheckOutDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`
                : 'Select dates'}
            </span>
          </div>
          {/* Separator */}
          <div style={{ width: 1.5, height: 40, background: '#fbbf24' }} />
          {/* Guests & Rooms */}
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            height: '100%',
            padding: '0 24px',
            background: '#fff',
            boxSizing: 'border-box',
          }}>
            {FaUserFriends({ style: { fontSize: 22, color: '#0ea5e9', marginRight: 12 } })}
            <span style={{ fontWeight: 700, fontSize: 17, color: '#232931', fontFamily: 'Inter, Roboto, Segoe UI, Arial, sans-serif', lineHeight: 1, alignItems: 'center' }}>{rooms.reduce((total, r) => total + r.adults, 0)} adults · {rooms.reduce((total, r) => total + r.children, 0)} children · {rooms.length} room</span>
            <span style={{ marginLeft: 8, color: '#222', fontSize: 16, userSelect: 'none', cursor: 'pointer' }}>▼</span>
          </div>
          {/* Search Button */}
          <button type="submit" className="search-btn-v2" style={{
            background: 'linear-gradient(90deg, #2563eb 0%, #1e40af 100%)',
            color: '#fff',
            fontWeight: 900,
            fontSize: 22,
            lineHeight: 1.1,
            border: 'none',
            borderRadius: '0 16px 16px 0',
            height: 60,
            width: 235,
            padding: 0,
            cursor: 'pointer',
            boxShadow: 'none',
            letterSpacing: 1,
            transition: 'background 0.2s, box-shadow 0.2s',
            fontFamily: 'Inter, Roboto, Segoe UI, Arial, sans-serif',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            top: '-2px',
          }}>Search</button>
        </div>
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
                <>
                  {filteredAndSortedHotels.map((hotel) => {
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
                                    }
                                  })}
                                </span>
                              </h3>
                              <p style={{ fontSize: '1rem', color: '#6b7280', margin: 0, marginBottom: 8 }}>{hotel.address}</p>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                                <span style={{ fontSize: '1rem', color: '#fbbf24' }}>{hotel.rating.toFixed(1)}</span>
                                <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>({hotel.rating})</span>
                              </div>
                            </div>
                            {/* Facilities */}
                            <div className="hotel-facilities" style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 16 }}>
                              {hotel.facilities?.map(facility => (
                                <span key={facility.id} className="hotel-facility-tag" style={{ background: '#f3f4f6', color: '#374151', padding: '4px 10px', borderRadius: 10, fontSize: '0.85rem' }}>
                                  {getFacilityIcon(facility.name)} {facility.name}
                                </span>
                              ))}
                            </div>
                            {/* Description */}
                            <p style={{ fontSize: '0.95rem', color: '#4b5563', marginTop: 16, lineHeight: 1.5 }}>{hotel.description?.text}</p>
                          </div>
                          {/* Right side: Price and Booking */}
                          <div style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            alignItems: 'flex-end',
                            padding: '32px 32px 32px 0',
                            borderLeft: '1px solid #e5e7eb',
                          }}>
                            {bestOffer && (
                              <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', margin: 0, marginBottom: 8 }}>
                                  {bestOffer.price.currency} {bestOffer.price.amount.toLocaleString()}
                                  {bestOffer.price.percent > 0 && ` (${bestOffer.price.percent}% off)`}
                                </p>
                                <p style={{ fontSize: '0.9rem', color: '#6b7280', textDecoration: 'line-through' }}>
                                  {bestOffer.price.currency} {bestOffer.price.oldAmount.toLocaleString()}
                                </p>
                                <button 
                                  className="book-btn" 
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevent card click
                                    if (bestOffer) {
                                      const ownerProviderParam = hotel.ownerProvider ? `&ownerProvider=${encodeURIComponent(String(hotel.ownerProvider))}` : '';
                                      navigate(`/hotel-details/${hotel.id}?searchId=${encodeURIComponent(searchId)}&offerId=${encodeURIComponent(bestOffer.offerId)}&currency=${encodeURIComponent(bestOffer.price.currency)}&productType=2&productId=${encodeURIComponent(hotel.id)}${ownerProviderParam}`);
                                    }
                                  }}
                                >
                                  Book Now
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default HotelList;

