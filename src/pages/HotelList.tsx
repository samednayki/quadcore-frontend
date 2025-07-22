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
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [loadingCheckIn, setLoadingCheckIn] = useState(false);
  const [checkInError, setCheckInError] = useState<string | null>(null);
  const [showCheckInCalendar, setShowCheckInCalendar] = useState(false);
  const [showCheckOutCalendar, setShowCheckOutCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentCheckOutMonth, setCurrentCheckOutMonth] = useState(new Date());
  const [showGuestRoomDropdown, setShowGuestRoomDropdown] = useState(false);
  const [loadingAutocomplete, setLoadingAutocomplete] = useState(false);

  // 1. Component başında şu sabitleri tekrar ekle:
  const MAX_ADULTS = 9;
  const MAX_CHILDREN = 4;
  const MAX_ROOMS = 5;
  // 2. showChildAgeModal, setShowChildAgeModal, pendingRoomId, setPendingRoomId, pendingChildAges, setPendingChildAges state'leri component başında kalsın.
  // 3. addRoom, updateRoomGuests fonksiyonlarında hardcoded değerler yerine bu sabitleri kullan.
  // 4. Fonksiyon gövdesi içindeki tekrar eden useState tanımlarını kaldır, sadece component başındaki kalsın.
  const [showChildAgeModal, setShowChildAgeModal] = useState(false);
  const [pendingRoomId, setPendingRoomId] = useState<number | null>(null);
  const [pendingChildAges, setPendingChildAges] = useState<number[]>([]);


  useEffect(() => {
    if (searchParams) {
      setDestinationQuery(searchParams.destinationName || '');
      setSelectedDestination({ id: searchParams.destination, name: searchParams.destinationName, type: 2 });
      setSelectedCheckInDate(searchParams.checkIn);
      setSelectedCheckOutDate(searchParams.checkOut);
      setRooms(searchParams.roomDetails || [{ adults: searchParams.guests, children: 0, childAges: [] }]);
      // Check-in endpointini çağır
      fetchCheckInDates(searchParams.destination, 2);
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
        const totalAdults = Math.min(searchParams.guests, MAX_ADULTS); // Max 9 adults
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
        currency: searchParams?.currency || 'USD',
        nationality: searchParams?.nationality || 'US',
        roomDetails: rooms,
      };
      localStorage.setItem('lastHotelSearchParams', JSON.stringify(newSearchParams));
      navigate('/hotels', { state: { searchParams: newSearchParams } });
    } else {
      alert('Please select destination, dates, and rooms.');
    }
  };

  const fetchAutocomplete = async (query: string) => {
    if (query.length < 3) {
      setAutocompleteResults([]);
      setShowAutocomplete(false);
      return;
    }
    const token = localStorage.getItem('authToken');
    if (!token) return;
    try {
      const requestBody = { productType: 2, query, culture: 'en-US' };
      const response = await fetch('http://localhost:8080/search/autocomplete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(requestBody)
      });
      if (response.ok) {
        const data = await response.json();
        setAutocompleteResults(data.body?.items || []);
        setShowAutocomplete(true);
      } else {
        setAutocompleteResults([]);
        setShowAutocomplete(false);
      }
    } catch {
      setAutocompleteResults([]);
      setShowAutocomplete(false);
    }
  };

  const fetchCheckInDates = async (destinationId: string, destinationType: number) => {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    setLoadingCheckIn(true);
    setCheckInError(null);
    try {
      const requestBody = {
        productType: 2,
        includeSubLocations: true,
        product: null,
        arrivalLocations: [{ id: destinationId, type: destinationType }]
      };
      const response = await fetch('http://localhost:8080/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(requestBody)
      });
      if (response.ok) {
        const data = await response.json();
        setAvailableDates(data.body?.dates || []);
      } else {
        setCheckInError('No dates available');
      }
    } catch {
      setCheckInError('Network error');
    } finally {
      setLoadingCheckIn(false);
    }
  };

  useEffect(() => {
    if (selectedDestination) {
      fetchCheckInDates(selectedDestination.id, selectedDestination.type);
    }
  }, [selectedDestination]);


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

  // Calendar ve guest/room fonksiyonları ve state'leri:
  function formatDateLocal(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const isDateAvailable = (date: Date) => {
    const dateString = formatDateLocal(date);
    return availableDates.some(availableDate => availableDate.startsWith(dateString));
  };

  const isCheckOutDateAvailable = (date: Date) => {
    if (selectedCheckInDate && date <= new Date(selectedCheckInDate)) {
      return false;
    }
    return true;
  };

  const isSelectedDate = (date: Date) => {
    return selectedCheckInDate === formatDateLocal(date);
  };

  const isSelectedCheckOutDate = (date: Date) => {
    return selectedCheckOutDate === formatDateLocal(date);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];
    const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1);
    const daysInPrevMonth = getDaysInMonth(prevMonth);
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), daysInPrevMonth - i);
      days.push({ date: day, isCurrentMonth: false });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const day = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
      days.push({ date: day, isCurrentMonth: true });
    }
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const day = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, i);
      days.push({ date: day, isCurrentMonth: false });
    }
    return days;
  };

  const generateCheckOutCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentCheckOutMonth);
    const firstDay = getFirstDayOfMonth(currentCheckOutMonth);
    const days = [];
    const prevMonth = new Date(currentCheckOutMonth.getFullYear(), currentCheckOutMonth.getMonth() - 1);
    const daysInPrevMonth = getDaysInMonth(prevMonth);
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), daysInPrevMonth - i);
      days.push({ date: day, isCurrentMonth: false });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const day = new Date(currentCheckOutMonth.getFullYear(), currentCheckOutMonth.getMonth(), i);
      days.push({ date: day, isCurrentMonth: true });
    }
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const day = new Date(currentCheckOutMonth.getFullYear(), currentCheckOutMonth.getMonth() + 1, i);
      days.push({ date: day, isCurrentMonth: false });
    }
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newMonth;
    });
  };

  const navigateCheckOutMonth = (direction: 'prev' | 'next') => {
    setCurrentCheckOutMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newMonth;
    });
  };

  const selectDate = (date: Date) => {
    setSelectedCheckInDate(formatDateLocal(date));
    setShowCheckInCalendar(false);
  };

  const selectCheckOutDate = (date: Date) => {
    setSelectedCheckOutDate(formatDateLocal(date));
    setShowCheckOutCalendar(false);
  };

  const clearSelection = () => {
    setSelectedCheckInDate(null);
  };

  const clearCheckOutSelection = () => {
    setSelectedCheckOutDate(null);
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const goToCheckOutToday = () => {
    setCurrentCheckOutMonth(new Date());
  };

  const addRoom = () => {
    if (rooms.length < MAX_ROOMS) { // MAX_ROOMS removed, hardcoded to 5
      setRooms(prev => [...prev, { adults: 1, children: 0, childAges: [] }]);
    }
  };

  const removeRoom = (roomId: number) => {
    setRooms(prev => prev.filter((_, idx) => idx !== roomId));
  };

  const updateRoomGuests = (roomId: number, type: 'adults' | 'children', value: number) => {
    setRooms(prev => prev.map((room, idx) => {
      if (idx === roomId) {
        if (type === 'adults') {
          return { ...room, adults: Math.max(1, Math.min(MAX_ADULTS, value)) }; // MAX_ADULTS removed, hardcoded to 9
        } else {
          return { ...room, children: Math.max(0, Math.min(MAX_CHILDREN, value)) }; // MAX_CHILDREN removed, hardcoded to 4
        }
      }
      return room;
    }));
  };

  const openChildAgeModal = (roomId: number, newChildCount: number, currentAges: number[]) => {
    console.log('openChildAgeModal called', { roomId, newChildCount, currentAges });
    setPendingRoomId(roomId);
    let ages = [...currentAges];
    if (newChildCount > currentAges.length) {
      for (let i = currentAges.length; i < newChildCount; i++) {
        ages.push(5);
      }
    } else if (newChildCount < currentAges.length) {
      ages = ages.slice(0, newChildCount);
    }
    setPendingChildAges(ages);
    setShowChildAgeModal(true);
  };

  const updatePendingChildAge = (idx: number, age: number) => {
    setPendingChildAges(prev => {
      const arr = [...prev];
      arr[idx] = Math.max(0, Math.min(17, age));
      return arr;
    });
  };

  const saveChildAges = () => {
    if (pendingRoomId !== null) {
      setRooms(rooms => rooms.map((room, idx) => {
        if (idx === pendingRoomId) {
          return { ...room, children: pendingChildAges.length, childAges: pendingChildAges };
        }
        return room;
      }));
    }
    setShowChildAgeModal(false);
    setPendingRoomId(null);
    setPendingChildAges([]);
  };

  const getTotalGuests = () => {
    return rooms.reduce((total, r) => total + r.adults + r.children, 0);
  };

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
        <form onSubmit={handleSearchSubmit} style={{ width: '100%' }}>
          <div style={{
            width: '100%',
            maxWidth: 1500,
            margin: '32px auto',
            display: 'flex',
            alignItems: 'center',
            height: 56,
            background: '#fff',
            borderRadius: 24,
            border: '3px solid #fbbf24',
            boxSizing: 'border-box',
            boxShadow: 'none',
            position: 'relative',
            zIndex: 20,
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
              position: 'relative',
              borderRadius: '20px 0 0 20px',
            }}>
              {FaBed({ style: { fontSize: 22, color: '#2563eb', marginRight: 12 } })}
              {/* DESTINATION INPUT */}
              <input
                className="destination-input-v2"
                type="text"
                placeholder="Where are you going?"
                value={destinationQuery}
                onChange={e => {
                  setDestinationQuery(e.target.value);
                  setShowAutocomplete(true);
                  setLoadingAutocomplete(true);
                  fetchAutocomplete(e.target.value).finally(() => setLoadingAutocomplete(false));
                }}
                onFocus={e => {
                  setShowAutocomplete(true);
                  // Diğer dropdownlar varsa burada kapatabilirsin
                }}
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
              {destinationQuery && <span style={{ marginLeft: 8, color: '#888', fontSize: 20, cursor: 'pointer' }} onClick={() => { setDestinationQuery(''); setSelectedDestination(null); setAutocompleteResults([]); setShowAutocomplete(false); }}>×</span>}
              {showAutocomplete && (
                <div className="autocomplete-dropdown" style={{ position: 'absolute', top: 56, left: 0, right: 0, background: '#fff', border: '1.5px solid #fbbf24', borderRadius: 12, zIndex: 50, maxHeight: 220, overflowY: 'auto', boxShadow: '0 4px 24px #2563eb22' }}>
                  {loadingAutocomplete ? (
                    <div className="autocomplete-loading">⏳</div>
                  ) : autocompleteResults.length > 0 ? (
                    autocompleteResults.map((item: any, idx: number) => {
                      let displayText = '';
                      let destinationId = '';
                      let destinationType = 0;
                      let destinationName = '';
                      if (item.hotel) {
                        displayText = `${item.hotel.name}, ${item.city?.name || ''}, ${item.country?.name || ''}`;
                        destinationId = item.hotel.id;
                        destinationType = item.type;
                        destinationName = item.hotel.name;
                      } else if (item.city) {
                        displayText = `${item.city.name}, ${item.state?.name || ''}, ${item.country?.name || ''}`;
                        destinationId = item.city.id;
                        destinationType = item.type;
                        destinationName = item.city.name;
                      } else if (item.state) {
                        displayText = `${item.state.name}, ${item.country?.name || ''}`;
                        destinationId = item.state.id;
                        destinationType = item.type;
                        destinationName = item.state.name;
                      } else if (item.country) {
                        displayText = item.country.name;
                        destinationId = item.country.id;
                        destinationType = item.type;
                        destinationName = item.country.name;
                      }
                      return (
                        <div
                          key={idx}
                          className="autocomplete-item"
                          style={{ padding: 12, cursor: 'pointer', borderBottom: '1px solid #f3f3f3', display: 'flex', alignItems: 'center' }}
                          onClick={() => {
                            setDestinationQuery(displayText);
                            setSelectedDestination({ id: destinationId, type: destinationType, name: destinationName });
                            setShowAutocomplete(false);
                            if (destinationId && destinationType) {
                              fetchCheckInDates(destinationId, destinationType);
                            }
                            setSelectedCheckInDate(null);
                            setSelectedCheckOutDate(null);
                          }}
                        >
                          <div className="autocomplete-icon" style={{ marginRight: 8 }}>{item.hotel ? '🏨' : '📍'}</div>
                          <div className="autocomplete-content">
                            <div className="autocomplete-title">
                              {item.hotel ? item.hotel.name : (item.city ? item.city.name : (item.state ? item.state.name : item.country?.name))}
                            </div>
                            <div className="autocomplete-subtitle" style={{ fontSize: 13, color: '#888' }}>
                              {item.city && item.city.name !== (item.hotel ? item.hotel.name : item.state?.name) && `${item.city.name}, `}
                              {item.state && item.state.name !== item.country?.name && `${item.state.name}, `}
                              {item.country?.name}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="autocomplete-no-results" style={{ padding: 12, color: '#888' }}>
                      <div className="no-results-icon">🔍</div>
                      <div className="no-results-text">No results found</div>
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* Separator */}
            <div style={{ width: 1.5, height: 40, background: '#fbbf24' }} />
            {/* Dates */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', height: '100%', padding: '0 24px', background: '#fff', boxSizing: 'border-box', position: 'relative', gap: 12 }}>
              {FaCalendarAlt({ style: { fontSize: 22, color: '#eab308', marginRight: 12 } })}
              {/* Check-in input */}
              <span
                style={{ fontWeight: selectedCheckInDate ? 700 : 500, fontSize: 17, color: '#232931', fontFamily: 'Inter, Roboto, Segoe UI, Arial, sans-serif', lineHeight: 1, alignItems: 'center', cursor: 'pointer', marginRight: 8 }}
                onClick={() => { setShowCheckInCalendar(true); setShowCheckOutCalendar(false); }}
              >
                {selectedCheckInDate ? new Date(selectedCheckInDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'Check-in'}
              </span>
              {/* Check-out input */}
              <span
                style={{ fontWeight: selectedCheckOutDate ? 700 : 500, fontSize: 17, color: '#232931', fontFamily: 'Inter, Roboto, Segoe UI, Arial, sans-serif', lineHeight: 1, alignItems: 'center', cursor: 'pointer' }}
                onClick={() => { setShowCheckOutCalendar(true); setShowCheckInCalendar(false); }}
              >
                {selectedCheckOutDate ? new Date(selectedCheckOutDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'Check-out'}
              </span>
              {/* Check-in takvim popup */}
              {showCheckInCalendar && (
                <div className="calendar-widget" style={{ position: 'absolute', top: 56, left: 0, zIndex: 100, background: '#fff', border: '1.5px solid #fbbf24', borderRadius: 12, boxShadow: '0 4px 24px #2563eb22', padding: 16, minWidth: 320 }}>
                  <button type="button" style={{ position: 'absolute', top: 4, right: 8, background: 'none', border: 'none', fontSize: 26, fontWeight: 900, color: '#888', cursor: 'pointer', zIndex: 101, padding: 0, lineHeight: 1.1 }} onClick={() => setShowCheckInCalendar(false)}>×</button>
                  <div className="calendar-header">
                    <button type="button" className="calendar-nav-btn" onClick={() => navigateMonth('prev')}>▲</button>
                    <div className="calendar-title">{currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
                    <button type="button" className="calendar-nav-btn" onClick={() => navigateMonth('next')}>▼</button>
                  </div>
                  <div className="calendar-weekdays">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                      <div key={day} className="calendar-weekday">{day}</div>
                    ))}
                  </div>
                  <div className="calendar-grid">
                    {generateCalendarDays().map(({ date, isCurrentMonth }, index) => (
                      <button
                        key={index}
                        type="button"
                        className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isDateAvailable(date) ? 'available' : 'unavailable'} ${isSelectedDate(date) ? 'selected' : ''} ${isToday(date) ? 'today' : ''}`}
                        disabled={!isDateAvailable(date)}
                        onClick={() => {
                          setSelectedCheckInDate(formatDateLocal(date));
                          setShowCheckInCalendar(false);
                          setSelectedCheckOutDate(null);
                        }}
                      >
                        {date.getDate()}
                      </button>
                    ))}
                  </div>
                  <div className="calendar-footer">
                    <button type="button" className="calendar-footer-btn" onClick={clearSelection}>Clear</button>
                    <button type="button" className="calendar-footer-btn" onClick={goToToday}>Today</button>
                  </div>
                </div>
              )}
              {/* Check-out takvim popup */}
              {showCheckOutCalendar && (
                <div className="calendar-widget" style={{ position: 'absolute', top: 56, left: 180, zIndex: 100, background: '#fff', border: '1.5px solid #fbbf24', borderRadius: 12, boxShadow: '0 4px 24px #2563eb22', padding: 16, minWidth: 320 }}>
                  <button type="button" style={{ position: 'absolute', top: 4, right: 8, background: 'none', border: 'none', fontSize: 26, fontWeight: 900, color: '#888', cursor: 'pointer', zIndex: 101, padding: 0, lineHeight: 1.1 }} onClick={() => setShowCheckOutCalendar(false)}>×</button>
                  <div className="calendar-header">
                    <button type="button" className="calendar-nav-btn" onClick={() => navigateCheckOutMonth('prev')}>▲</button>
                    <div className="calendar-title">{currentCheckOutMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
                    <button type="button" className="calendar-nav-btn" onClick={() => navigateCheckOutMonth('next')}>▼</button>
                  </div>
                  <div className="calendar-weekdays">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                      <div key={day} className="calendar-weekday">{day}</div>
                    ))}
                  </div>
                  <div className="calendar-grid">
                    {generateCheckOutCalendarDays().map(({ date, isCurrentMonth }, index) => (
                      <button
                        key={index}
                        type="button"
                        className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isCheckOutDateAvailable(date) ? 'available' : 'unavailable'} ${isSelectedCheckOutDate(date) ? 'selected' : ''} ${isToday(date) ? 'today' : ''}`}
                        disabled={!isCheckOutDateAvailable(date)}
                        onClick={() => {
                          setSelectedCheckOutDate(formatDateLocal(date));
                          setShowCheckOutCalendar(false);
                        }}
                      >
                        {date.getDate()}
                      </button>
                    ))}
                  </div>
                  <div className="calendar-footer">
                    <button type="button" className="calendar-footer-btn" onClick={clearCheckOutSelection}>Clear</button>
                    <button type="button" className="calendar-footer-btn" onClick={goToCheckOutToday}>Today</button>
                  </div>
                </div>
              )}
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
              position: 'relative',
            }}>
              {FaUserFriends({ style: { fontSize: 22, color: '#0ea5e9', marginRight: 12 } })}
              <span
                style={{ fontWeight: 700, fontSize: 17, color: '#232931', fontFamily: 'Inter, Roboto, Segoe UI, Arial, sans-serif', lineHeight: 1, alignItems: 'center', cursor: 'pointer' }}
                onClick={() => setShowGuestRoomDropdown(!showGuestRoomDropdown)}
              >
                {rooms.reduce((total, r) => total + r.adults, 0)} adults · {rooms.reduce((total, r) => total + r.children, 0)} children · {rooms.length} room
                <span style={{ marginLeft: 8, color: '#222', fontSize: 16, userSelect: 'none', cursor: 'pointer' }}>▼</span>
              </span>
              {showGuestRoomDropdown && (
                <div className="guest-room-dropdown" style={{ position: 'absolute', top: 56, right: 0, zIndex: 100, background: '#fff', border: '1.5px solid #fbbf24', borderRadius: 12, boxShadow: '0 4px 24px #2563eb22', padding: 16, minWidth: 320 }}>
                  <button type="button" style={{ position: 'absolute', top: 8, right: 12, background: 'none', border: 'none', fontSize: 22, color: '#888', cursor: 'pointer', zIndex: 101 }} onClick={() => setShowGuestRoomDropdown(false)}>×</button>
                  {rooms.map((room, idx) => (
                    <div key={idx} style={{ marginBottom: 12, borderBottom: idx < rooms.length - 1 ? '1px solid #eee' : 'none', paddingBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontWeight: 600, fontSize: 15 }}>Room {idx + 1}</span>
                        {rooms.length > 1 && (
                          <button type="button" style={{ marginLeft: 12, color: '#e11d48', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }} onClick={() => removeRoom(idx)}>&times;</button>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span>Adults:</span>
                        <button type="button" onClick={() => updateRoomGuests(idx, 'adults', rooms[idx].adults - 1)} disabled={rooms[idx].adults <= 1}>-</button>
                        <span>{rooms[idx].adults}</span>
                        <button type="button" onClick={() => updateRoomGuests(idx, 'adults', rooms[idx].adults + 1)} disabled={rooms[idx].adults >= MAX_ADULTS}>+</button>
                        <span style={{ marginLeft: 16 }}>Children:</span>
                        <button type="button" 
                          onClick={() => updateRoomGuests(idx, 'children', rooms[idx].children - 1)} 
                          disabled={rooms[idx].children <= 0}>-</button>
                        <span>{rooms[idx].children}</span>
                        <button 
                          type="button"
                          onClick={() => openChildAgeModal(idx, rooms[idx].children + 1, rooms[idx].childAges)}
                          disabled={rooms[idx].children >= MAX_CHILDREN}
                        >+</button>
                      </div>
                    </div>
                  ))}
                  <button type="button" style={{ marginTop: 8, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 16px', fontWeight: 700, cursor: 'pointer' }} onClick={addRoom} disabled={rooms.length >= MAX_ROOMS}>+ Add Room</button>
                  <div style={{ marginTop: 8, fontWeight: 600 }}>Total: {getTotalGuests()} guests, {rooms.length} room{rooms.length > 1 ? 's' : ''}</div>
                  {/* ÇOCUK YAŞ MODALI */}
                  {showChildAgeModal && (
                    <div style={{
                      position: 'absolute',
                      left: '50%',
                      top: '100%',
                      transform: 'translate(-50%, 16px)',
                      zIndex: 200,
                      background: '#fff',
                      borderRadius: 16,
                      padding: 32,
                      minWidth: 320,
                      boxShadow: '0 4px 24px #2563eb22'
                    }}>
                      <h3 style={{ marginBottom: 16 }}>Select Child Ages</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {pendingChildAges.map((age, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span>Child {idx + 1} age:</span>
                            <input
                              type="number"
                              min={0}
                              max={17}
                              value={age}
                              onChange={e => updatePendingChildAge(idx, Number(e.target.value))}
                              style={{ width: 60, padding: 4, borderRadius: 6, border: '1.5px solid #fbbf24', fontSize: 16 }}
                            />
                          </div>
                        ))}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                        <button type="button" style={{ background: '#e5e7eb', color: '#222', border: 'none', borderRadius: 8, padding: '6px 16px', fontWeight: 600, cursor: 'pointer' }} onClick={() => { setShowChildAgeModal(false); setPendingRoomId(null); setPendingChildAges([]); }}>Cancel</button>
                        <button type="button" style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 16px', fontWeight: 700, cursor: 'pointer' }} onClick={saveChildAges}>Save</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
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
              height: 56, // bar ile aynı yükseklik
              width: 220, // barı taşmayacak şekilde
              padding: 0,
              margin: 0,
              cursor: 'pointer',
              boxShadow: 'none',
              letterSpacing: 1,
              transition: 'none',
              fontFamily: 'Inter, Roboto, Segoe UI, Arial, sans-serif',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'static', // top/right kaldırıldı
            }}>Search</button>
          </div>
        </form>
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
          <div className="hotel-list-header" style={{ position: 'relative', padding: '32px 0 24px 0', minHeight: 160, background: '#d1fae5', borderRadius: 0 }}>
            <div className="header-center" style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 8 }}>
              <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#1e293b', margin: 0, marginBottom: 0, display: 'flex', alignItems: 'center', gap: 10, textAlign: 'center' }}>
                <img 
                  src={process.env.PUBLIC_URL + '/WhatsApp Image 2025-07-08 at 09.35.08_7abde45a.jpg'}
                  alt="HotelRes Logo"
                  style={{ height: 48, borderRadius: 12, marginRight: 16, verticalAlign: 'middle' }}
                />
                Hotels in {searchParams?.destinationName || 'Unknown'}
              </h1>
              <p style={{ textAlign: 'center', margin: 0 }}>
                {searchParams?.checkIn} - {searchParams?.checkOut} • 
                {searchParams?.guests} Guest{searchParams?.guests !== 1 ? 's' : ''} • 
                {searchParams?.rooms} Room{searchParams?.rooms !== 1 ? 's' : ''}
              </p>
              <p className="results-count" style={{ textAlign: 'center', margin: 0 }}>
                {filteredAndSortedHotels.length} hotel{filteredAndSortedHotels.length !== 1 ? 's' : ''} found
              </p>
            </div>
            <div className="header-sort" style={{ position: 'absolute', top: 24, right: 32, alignSelf: 'flex-start', margin: 0 }}>
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

