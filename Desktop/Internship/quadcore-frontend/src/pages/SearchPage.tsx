import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaCalendarAlt, FaUserFriends, FaBed, FaUser, FaChild, FaPlus, FaMinus, FaGlobe, FaMoneyBillWave, FaSearch, FaKey, FaUsers, FaHome, FaBookmark } from 'react-icons/fa';
import './SearchPage.css';

interface Room {
  id: number;
  adults: number;
  children: number;
  childAges: number[];
}

const backgroundUrl = process.env.PUBLIC_URL + "/pexels-pixabay-50594.jpg";
const logoUrl = process.env.PUBLIC_URL + "/WhatsApp Image 2025-07-08 at 09.35.08_7abde45a.jpg";

// Function to convert country code to flag emoji
const getCountryFlag = (countryCode: string): string => {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

// Define a unique gradient for each animated message
const animatedGradients = [
  'linear-gradient(90deg, #0077ff 0%, #00e0ff 50%, #a259ff 100%)', // blue-cyan-purple
  'linear-gradient(90deg, #ff7e5f 0%, #feb47b 100%)', // orange-yellow
  'linear-gradient(90deg, #43e97b 0%, #38f9d7 50%, #a259ff 100%)', // green-cyan-purple
  'linear-gradient(90deg, #ff6a88 0%, #6a82fb 100%)', // pink-purple-blue
];

const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [currencies, setCurrencies] = useState<{ code: string; name: string }[]>([]);
  const [nationalities, setNationalities] = useState<{ id: string; name: string }[]>([]);
  const [loadingCurrency, setLoadingCurrency] = useState(true);
  const [loadingNationality, setLoadingNationality] = useState(true);
  const [loading, setLoading] = useState(true);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  // Autocomplete states
  const [destinationQuery, setDestinationQuery] = useState('');
  const [autocompleteResults, setAutocompleteResults] = useState<any[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [loadingAutocomplete, setLoadingAutocomplete] = useState(false);

  // Currency and nationality dropdown states
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [showNationalityDropdown, setShowNationalityDropdown] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('TRY'); // Turkish Lira default
  const [selectedNationality, setSelectedNationality] = useState('DE'); // Germany default

  // Search states for currency and nationality
  const [currencySearch, setCurrencySearch] = useState('');
  const [nationalitySearch, setNationalitySearch] = useState('');

  // Guest count states with limits
  const [adultCount, setAdultCount] = useState(1);
  const [childCount, setChildCount] = useState(0);
  const MAX_ADULTS = 9;
  const MAX_CHILDREN = 4;

  // Room management states
  const [rooms, setRooms] = useState<Room[]>([
    { id: 1, adults: 1, children: 0, childAges: [] }
  ]);
  const MAX_ROOMS = 5;

  // Check-in states
  const [selectedDestination, setSelectedDestination] = useState<{
    id: string;
    type: number;
    name: string;
  } | null>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [loadingCheckIn, setLoadingCheckIn] = useState(false);
  const [checkInError, setCheckInError] = useState<string | null>(null);

  // Calendar states
  const [showCheckInCalendar, setShowCheckInCalendar] = useState(false);
  const [showCheckOutCalendar, setShowCheckOutCalendar] = useState(false);
  const [selectedCheckInDate, setSelectedCheckInDate] = useState<string>('');
  const [selectedCheckOutDate, setSelectedCheckOutDate] = useState<string>('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentCheckOutMonth, setCurrentCheckOutMonth] = useState(new Date());
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const currencyRef = useRef<HTMLDivElement>(null);
  const nationalityRef = useRef<HTMLDivElement>(null);
  const [currencyDropdownPos, setCurrencyDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const [nationalityDropdownPos, setNationalityDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  // Dropdown positioning functions
  const calculateDropdownPosition = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      return {
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      };
    }
    return { top: 0, left: 0, width: 0 };
  };

  // Calendar helper functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const isDateAvailable = (date: Date) => {
    const dateString = formatDate(date);
    // Check if the date is in the available dates array
    // Backend returns ISO format, so we need to check if any date starts with our date string
    return availableDates.some(availableDate => availableDate.startsWith(dateString));
  };

  const isCheckOutDateAvailable = (date: Date) => {
    // Check if checkout date is after checkin date
    if (selectedCheckInDate && date <= new Date(selectedCheckInDate)) {
      return false;
    }
    return true;
  };

  const isSelectedDate = (date: Date) => {
    return selectedCheckInDate === formatDate(date);
  };

  const isSelectedCheckOutDate = (date: Date) => {
    return selectedCheckOutDate === formatDate(date);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Previous month days
    const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1);
    const daysInPrevMonth = getDaysInMonth(prevMonth);
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), daysInPrevMonth - i);
      days.push({ date: day, isCurrentMonth: false });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const day = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
      days.push({ date: day, isCurrentMonth: true });
    }

    // Next month days
    const remainingDays = 42 - days.length; // 6 rows * 7 days
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

    // Previous month days
    const prevMonth = new Date(currentCheckOutMonth.getFullYear(), currentCheckOutMonth.getMonth() - 1);
    const daysInPrevMonth = getDaysInMonth(prevMonth);
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), daysInPrevMonth - i);
      days.push({ date: day, isCurrentMonth: false });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const day = new Date(currentCheckOutMonth.getFullYear(), currentCheckOutMonth.getMonth(), i);
      days.push({ date: day, isCurrentMonth: true });
    }

    // Next month days
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      const day = new Date(currentCheckOutMonth.getFullYear(), currentCheckOutMonth.getMonth() + 1, i);
      days.push({ date: day, isCurrentMonth: false });
    }

    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const navigateCheckOutMonth = (direction: 'prev' | 'next') => {
    setCurrentCheckOutMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const selectDate = (date: Date) => {
    if (isDateAvailable(date)) {
      setSelectedCheckInDate(formatDate(date));
      setShowCheckInCalendar(false);
    }
  };

  const selectCheckOutDate = (date: Date) => {
    // Check if checkout date is after checkin date
    if (selectedCheckInDate && date <= new Date(selectedCheckInDate)) {
      return; // Don't allow checkout date before or equal to checkin date
    }
    setSelectedCheckOutDate(formatDate(date));
    setShowCheckOutCalendar(false);
  };

  const clearSelection = () => {
    setSelectedCheckInDate('');
  };

  const clearCheckOutSelection = () => {
    setSelectedCheckOutDate('');
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    if (isDateAvailable(today)) {
      setSelectedCheckInDate(formatDate(today));
    }
  };

  const goToCheckOutToday = () => {
    const today = new Date();
    setCurrentCheckOutMonth(today);
    if (selectedCheckInDate && today > new Date(selectedCheckInDate)) {
      setSelectedCheckOutDate(formatDate(today));
    }
  };

  // Room management functions
  const addRoom = () => {
    if (rooms.length < MAX_ROOMS) {
      const newRoom: Room = {
        id: Math.max(...rooms.map(r => r.id)) + 1,
        adults: 1,
        children: 0,
        childAges: []
      };
      setRooms([...rooms, newRoom]);
    }
  };

  const removeRoom = (roomId: number) => {
    if (rooms.length > 1) {
      setRooms(rooms.filter(room => room.id !== roomId));
    }
  };

  const updateRoomGuests = (roomId: number, type: 'adults' | 'children', value: number) => {
    setRooms(rooms.map(room => {
      if (room.id === roomId) {
        const newValue = Math.max(type === 'adults' ? 1 : 0, Math.min(type === 'adults' ? MAX_ADULTS : MAX_CHILDREN, value));
        
        if (type === 'children') {
          // Update child ages array when children count changes
          let newChildAges = [...room.childAges];
          if (newValue > room.children) {
            // Adding children - add default age (5 years old)
            for (let i = room.children; i < newValue; i++) {
              newChildAges.push(5);
            }
          } else if (newValue < room.children) {
            // Removing children - remove from end
            newChildAges = newChildAges.slice(0, newValue);
          }
          
          return { ...room, children: newValue, childAges: newChildAges };
        } else {
          return { ...room, [type]: newValue };
        }
      }
      return room;
    }));
  };

  const updateChildAge = (roomId: number, childIndex: number, age: number) => {
    setRooms(rooms.map(room => {
      if (room.id === roomId) {
        const newChildAges = [...room.childAges];
        newChildAges[childIndex] = Math.max(0, Math.min(17, age));
        return { ...room, childAges: newChildAges };
      }
      return room;
    }));
  };

  const getTotalGuests = () => {
    return rooms.reduce((total, room) => total + room.adults + room.children, 0);
  };

  // Check-in API function
  const fetchCheckInDates = async (destinationId: string, destinationType: number) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No auth token found');
      return;
    }

    setLoadingCheckIn(true);
    setCheckInError(null);

    try {
      const requestBody = {
        productType: 2,
        includeSubLocations: true,
        product: null,
        arrivalLocations: [
          {
            id: destinationId,
            type: destinationType
          }
        ]
      };

      const response = await fetch('http://localhost:8080/api/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.body && data.body.dates) {
          setAvailableDates(data.body.dates);
        } else {
          setCheckInError('No dates available');
        }
      } else {
        const errorText = await response.text();
        console.error('Check-in API error:', response.status, errorText);
        setCheckInError(`Failed to fetch dates: ${response.status}`);
      }
    } catch (error) {
      console.error('Check-in error:', error);
      setCheckInError('Network error occurred');
    } finally {
      setLoadingCheckIn(false);
    }
  };

  // Otomatik login fonksiyonu
  const performAutoLogin = async () => {
    try {
      const loginResponse = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agency: "internship",
          user: "internship",
          password: "@San2025"
        })
      });

      if (loginResponse.ok) {
        const authToken = await loginResponse.text();
        
        // Token'ı localStorage'a kaydet
        localStorage.setItem('authToken', authToken);
        
        // Currency ve nationality verilerini çek
        await fetchCurrencyAndNationalityData(authToken);
      } else {
        console.error('Auto login failed');
      }
    } catch (error) {
      console.error('Auto login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrencyAndNationalityData = (token: string) => {
    // Currency fetch
    fetch('http://localhost:8080/api/currency', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setCurrencies(data.body?.currencies || []);
        setLoadingCurrency(false);
        
        // Check if TRY exists in the currencies, if not, set to first available
        if (data.body?.currencies) {
          const tryCurrency = data.body.currencies.find((c: any) => c.code === 'TRY');
          if (!tryCurrency && data.body.currencies.length > 0) {
            setSelectedCurrency(data.body.currencies[0].code);
          }
        }
      })
      .catch(() => setLoadingCurrency(false));
    
    // Nationality fetch
    fetch('http://localhost:8080/api/nationalities', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setNationalities(data.body?.nationalities || []);
        setLoadingNationality(false);
        
        // Check if DE exists in the nationalities, if not, set to first available
        if (data.body?.nationalities) {
          const deNationality = data.body.nationalities.find((n: any) => n.id === 'DE');
          if (!deNationality && data.body.nationalities.length > 0) {
            setSelectedNationality(data.body.nationalities[0].id);
          }
        }
      })
      .catch(() => setLoadingNationality(false));
  };

  // Autocomplete API call
  const fetchAutocomplete = async (query: string) => {
    if (query.length < 3) {
      setAutocompleteResults([]);
      setShowAutocomplete(false);
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      console.log('No auth token found');
      return;
    }

    setLoadingAutocomplete(true);
    console.log('Fetching autocomplete for query:', query);
    
    try {
      const requestBody = {
        productType: 2,
        query: query,
        culture: "en-US"
      };
      
      console.log('Request body:', requestBody);
      
      const response = await fetch('http://localhost:8080/search/autocomplete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Response data:', data);
        console.log('Items found:', data.body?.items?.length || 0);
        
        setAutocompleteResults(data.body?.items || []);
        setShowAutocomplete(true);
        console.log('DEBUG - showAutocomplete:', true);
        console.log('DEBUG - autocompleteResults:', data.body?.items?.length || 0);
        console.log('DEBUG - first item:', data.body?.items?.[0]);
      } else {
        console.error('Response not ok:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
      }
    } catch (error) {
      console.error('Autocomplete error:', error);
    } finally {
      setLoadingAutocomplete(false);
    }
  };

  useEffect(() => {
    // Sayfa yüklendiğinde otomatik login yap
    performAutoLogin();
  }, []);

  useEffect(() => {
    if (showCurrencyDropdown && currencyRef.current) {
      const rect = currencyRef.current.getBoundingClientRect();
      setCurrencyDropdownPos({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, [showCurrencyDropdown]);

  useEffect(() => {
    if (showNationalityDropdown && nationalityRef.current) {
      const rect = nationalityRef.current.getBoundingClientRect();
      setNationalityDropdownPos({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, [showNationalityDropdown]);

  // Search form submit handler
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);

    // Validation
    if (!selectedDestination) {
      setSearchError('Please select a destination');
      return;
    }

    if (!selectedCheckInDate) {
      setSearchError('Please select check-in date');
      return;
    }

    if (!selectedCheckOutDate) {
      setSearchError('Please select check-out date');
      return;
    }

    if (getTotalGuests() === 0) {
      setSearchError('Please add at least one guest');
      return;
    }

    // Prepare search parameters
    const searchParams = {
      destination: selectedDestination.id,
      destinationName: selectedDestination.name,
      checkIn: selectedCheckInDate,
      checkOut: selectedCheckOutDate,
      guests: getTotalGuests(),
      rooms: rooms.length,
      currency: selectedCurrency,
      nationality: selectedNationality,
      roomDetails: rooms.map(room => ({
        adults: room.adults,
        children: room.children,
        childAges: room.childAges
      }))
    };

    // Navigate to hotel list with search parameters
    navigate('/hotels', { 
      state: { searchParams } 
    });
  };

  // Animated text effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prevIndex) => (prevIndex + 1) % 6);
    }, 3000); // Her 3 saniyede bir değiş

    return () => clearInterval(interval);
  }, []);

  if (loading) {
      return (
    <div 
      className="search-page-outer"
      style={{
        backgroundImage: `url(${process.env.PUBLIC_URL}/pexels-pixabay-50594.jpg)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          backgroundImage: `url(${backgroundUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
          width: '100vw',
          position: 'relative',
        }}
      >
        <header className="app-header">
          <div className="logo-title">
            <img src={logoUrl} alt="HotelRes Logo" className="app-logo" />
            <span className="app-title">HotelRes</span>
          </div>
          <nav className="nav-links">
            <a href="#" className="nav-link nav-box">{FaHome({ className: "nav-icon" })}<span className="nav-text">Home</span></a>
            <a href="#" className="nav-link nav-box">{FaSearch({ className: "nav-icon" })}<span className="nav-text">Search Hotels</span></a>
            <a href="#" className="nav-link nav-box">{FaBookmark({ className: "nav-icon" })}<span className="nav-text">My Reservations</span></a>
          </nav>
        </header>
        <div
          className="search-page-outer"
          style={{
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Animated Intro Section */}
            <div className="animated-intro-section">
              <div className="animated-text-container">
                <div className={`animated-text ${currentTextIndex === 0 ? 'active' : ''}`}>
                  <img src={logoUrl} alt="HotelRes Logo" className="intro-logo" />
                  Welcome to HotelRes
                </div>
                <div className={`animated-text ${currentTextIndex === 1 ? 'active' : ''}`}>🌟 The World's Best Hotels</div>
                <div className={`animated-text ${currentTextIndex === 2 ? 'active' : ''}`}>💎 Luxury and Comfort Together</div>
                <div className={`animated-text ${currentTextIndex === 3 ? 'active' : ''}`}>🌍 Service in 150+ Countries</div>
                <div className={`animated-text ${currentTextIndex === 4 ? 'active' : ''}`}>🎯 Best Price Guarantee</div>
                <div className={`animated-text ${currentTextIndex === 5 ? 'active' : ''}`}>✨ Unforgettable Holiday Experiences</div>
              </div>
            </div>
            
            <div className="search-card search-card-v2">
              <form className="search-form-v2" onSubmit={handleSearchSubmit}>
                <h2 className="search-title-v2">Where do you want to go?</h2>
                
                {searchError && (
                  <div className="search-error-message">
                    <span className="error-icon">⚠️</span>
                    {searchError}
                  </div>
                )}
                <div className="destination-row-v2">
                  <span className="destination-icon-v2">📍</span>
                  <input 
                    className="destination-input-v2" 
                    type="text" 
                    placeholder="City, hotel or destination"
                    value={destinationQuery}
                    onChange={(e) => {
                      setDestinationQuery(e.target.value);
                      fetchAutocomplete(e.target.value);
                    }}
                    onFocus={() => {
                      if (destinationQuery.length >= 3) {
                        setShowAutocomplete(true);
                      }
                      setShowCurrencyDropdown(false);
                      setShowNationalityDropdown(false);
                    }}
                    onBlur={() => {
                      // Delay hiding to allow clicking on suggestions
                      setTimeout(() => setShowAutocomplete(false), 300);
                    }}
                  />
                  {loadingAutocomplete && (
                    <div className="autocomplete-loading">⏳</div>
                  )}
                  
                  {/* Autocomplete Dropdown */}
                  {showAutocomplete && (
                    <div className="autocomplete-dropdown">
                      {autocompleteResults.length > 0 ? (
                        autocompleteResults.map((item, index) => (
                          <div 
                            key={index} 
                            className="autocomplete-item"
                                                    onClick={() => {
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

                            setDestinationQuery(displayText);
                            setSelectedDestination({
                              id: destinationId,
                              type: destinationType,
                              name: destinationName
                            });
                            setShowAutocomplete(false);

                            // Fetch check-in dates for selected destination
                            if (destinationId && destinationType) {
                              fetchCheckInDates(destinationId, destinationType);
                            }
                          }}
                          >
                            <div className="autocomplete-icon">
                              {item.hotel ? '🏨' : '📍'}
                            </div>
                            <div className="autocomplete-content">
                              <div className="autocomplete-title">
                                {item.hotel ? item.hotel.name : (item.city ? item.city.name : (item.state ? item.state.name : item.country?.name))}
                              </div>
                              <div className="autocomplete-subtitle">
                                {item.city && item.city.name !== (item.hotel ? item.hotel.name : item.state?.name) && `${item.city.name}, `}
                                {item.state && item.state.name !== item.country?.name && `${item.state.name}, `}
                                {item.country?.name}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="autocomplete-no-results">
                          <div className="no-results-icon">🔍</div>
                          <div className="no-results-text">No results found</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="dates-row-v2">
                  <div className="date-col-v2">
                    <label className="date-label-v2">
                      {FaCalendarAlt({ className: "date-icon-v2" })} Check-in Date
                      {loadingCheckIn && <span className="loading-indicator"> ⏳</span>}
                    </label>
                    <div className="calendar-input-container">
                      <input 
                        className="date-input-v2" 
                        type="text"
                        placeholder={
                          !selectedDestination 
                            ? 'Select destination first' 
                            : loadingCheckIn 
                              ? 'Loading available dates...' 
                              : availableDates.length > 0 
                                ? 'Select check-in date' 
                                : 'No dates available'
                        }
                        value={selectedCheckInDate ? new Date(selectedCheckInDate).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        }) : ''}
                        readOnly
                        disabled={!selectedDestination || loadingCheckIn}
                        onClick={() => setShowCheckInCalendar(!showCheckInCalendar)}
                      />
                      <button 
                        type="button"
                        className="calendar-toggle-btn"
                        onClick={() => setShowCheckInCalendar(!showCheckInCalendar)}
                      >
                        📅
                      </button>
                    </div>
                    
                    {showCheckInCalendar && (
                      <div className="calendar-widget">
                        <div className="calendar-header">
                          <button 
                            type="button" 
                            className="calendar-nav-btn"
                            onClick={() => navigateMonth('prev')}
                          >
                            ▲
                          </button>
                          <div className="calendar-title">
                            {currentMonth.toLocaleDateString('en-US', { 
                              month: 'long', 
                              year: 'numeric' 
                            })}
                          </div>
                          <button 
                            type="button" 
                            className="calendar-nav-btn"
                            onClick={() => navigateMonth('next')}
                          >
                            ▼
                          </button>
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
                              className={`calendar-day ${
                                !isCurrentMonth ? 'other-month' : ''
                              } ${
                                isDateAvailable(date) ? 'available' : 'unavailable'
                              } ${
                                isSelectedDate(date) ? 'selected' : ''
                              } ${
                                isToday(date) ? 'today' : ''
                              }`}
                              disabled={!isDateAvailable(date)}
                              onClick={() => selectDate(date)}
                            >
                              {date.getDate()}
                            </button>
                          ))}
                        </div>
                        
                        <div className="calendar-footer">
                          <button 
                            type="button" 
                            className="calendar-footer-btn"
                            onClick={clearSelection}
                          >
                            Clear
                          </button>
                          <button 
                            type="button" 
                            className="calendar-footer-btn"
                            onClick={goToToday}
                          >
                            Today
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {checkInError && (
                      <div className="error-message">{checkInError}</div>
                    )}
                    

                  </div>
                  <div className="date-col-v2">
                    <label className="date-label-v2">{FaCalendarAlt({ className: "date-icon-v2" })} Check-out Date</label>
                    <div className="calendar-input-container">
                      <input
                        className="date-input-v2"
                        type="text"
                        placeholder={
                          !selectedCheckInDate
                            ? 'Select check-in first'
                            : 'Select check-out date'
                        }
                        value={selectedCheckOutDate ? new Date(selectedCheckOutDate).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        }) : ''}
                        readOnly
                        disabled={!selectedCheckInDate}
                        onClick={() => setShowCheckOutCalendar(!showCheckOutCalendar)}
                      />
                      <button
                        type="button"
                        className="calendar-toggle-btn"
                        disabled={!selectedCheckInDate}
                        onClick={() => setShowCheckOutCalendar(!showCheckOutCalendar)}
                      >
                        📅
                      </button>
                    </div>
                    {showCheckOutCalendar && (
                      <div className="calendar-widget">
                        <div className="calendar-header">
                          <button
                            type="button"
                            className="calendar-nav-btn"
                            onClick={() => navigateCheckOutMonth('prev')}
                          >
                            ▲
                          </button>
                          <div className="calendar-title">
                            {currentCheckOutMonth.toLocaleDateString('en-US', {
                              month: 'long',
                              year: 'numeric'
                            })}
                          </div>
                          <button
                            type="button"
                            className="calendar-nav-btn"
                            onClick={() => navigateCheckOutMonth('next')}
                          >
                            ▼
                          </button>
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
                              className={`calendar-day ${
                                !isCurrentMonth ? 'other-month' : ''
                              } ${
                                isCheckOutDateAvailable(date) ? 'available' : 'unavailable'
                              } ${
                                isSelectedCheckOutDate(date) ? 'selected' : ''
                              } ${
                                isToday(date) ? 'today' : ''
                              }`}
                              disabled={!isCheckOutDateAvailable(date)}
                              onClick={() => selectCheckOutDate(date)}
                            >
                              {date.getDate()}
                            </button>
                          ))}
                        </div>
                        <div className="calendar-footer">
                          <button
                            type="button"
                            className="calendar-footer-btn"
                            onClick={clearCheckOutSelection}
                          >
                            Clear
                          </button>
                          <button
                            type="button"
                            className="calendar-footer-btn"
                            onClick={goToCheckOutToday}
                          >
                            Today
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="guests-section-v2">
                  <div className="guests-header-v2">👥 Guests</div>
                  <div className="guests-rooms-label-v2">Guests and Rooms</div>
                  <div className="guests-rooms-box-v2">
                    {rooms.map((room, index) => (
                      <div key={room.id} className="room-container-v2">
                        <div className="room-header-v2">
                          <span className="room-title-v2">🛏️ Room {index + 1}</span>
                          <div className="room-header-controls">
                            <span className="room-summary-v2">{room.adults + room.children} Guest</span>
                            {rooms.length > 1 && (
                              <button 
                                type="button" 
                                className="remove-room-btn-v2"
                                onClick={() => removeRoom(room.id)}
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="room-row-v2">
                          <span className="room-row-label-v2">🧑‍🦱 Adult</span>
                          <div className="room-row-controls-v2">
                            <button 
                              type="button" 
                              className={`room-minus-btn-v2 ${room.adults <= 1 ? 'disabled' : ''}`}
                              onClick={() => updateRoomGuests(room.id, 'adults', room.adults - 1)}
                              disabled={room.adults <= 1}
                            >
                              {FaMinus({})}
                            </button>
                            <span className="room-count-v2">{room.adults}</span>
                            <button 
                              type="button" 
                              className={`room-plus-btn-v2 ${room.adults >= MAX_ADULTS ? 'disabled' : ''}`}
                              onClick={() => updateRoomGuests(room.id, 'adults', room.adults + 1)}
                              disabled={room.adults >= MAX_ADULTS}
                            >
                              {FaPlus({})}
                            </button>
                          </div>
                        </div>
                        <div className="room-row-v2">
                          <span className="room-row-label-v2">🧒 Children <span className="room-row-age-v2">[0-17]</span></span>
                          <div className="room-row-controls-v2">
                            <button 
                              type="button" 
                              className={`room-minus-btn-v2 ${room.children <= 0 ? 'disabled' : ''}`}
                              onClick={() => updateRoomGuests(room.id, 'children', room.children - 1)}
                              disabled={room.children <= 0}
                            >
                              {FaMinus({})}
                            </button>
                            <span className="room-count-v2">{room.children}</span>
                            <button 
                              type="button" 
                              className={`room-plus-btn-v2 ${room.children >= MAX_CHILDREN ? 'disabled' : ''}`}
                              onClick={() => updateRoomGuests(room.id, 'children', room.children + 1)}
                              disabled={room.children >= MAX_CHILDREN}
                            >
                              {FaPlus({})}
                            </button>
                          </div>
                        </div>
                        
                        {/* Child Ages Section */}
                        {room.children > 0 && (
                          <div className="child-ages-section-v2">
                            <div className="child-ages-header-v2">
                              <span className="child-ages-title-v2">👶 Child Ages</span>
                            </div>
                            <div className="child-ages-grid-v2">
                              {room.childAges.map((age, childIndex) => (
                                <div key={childIndex} className="child-age-item-v2">
                                  <span className="child-age-label-v2">Child {childIndex + 1}</span>
                                  <div className="child-age-controls-v2">
                                    <button 
                                      type="button" 
                                      className={`room-minus-btn-v2 ${age <= 0 ? 'disabled' : ''}`}
                                      onClick={() => updateChildAge(room.id, childIndex, age - 1)}
                                      disabled={age <= 0}
                                    >
                                      {FaMinus({})}
                                    </button>
                                    <span className="room-count-v2">{age}</span>
                                    <button 
                                      type="button" 
                                      className={`room-plus-btn-v2 ${age >= 17 ? 'disabled' : ''}`}
                                      onClick={() => updateChildAge(room.id, childIndex, age + 1)}
                                      disabled={age >= 17}
                                    >
                                      {FaPlus({})}
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {index < rooms.length - 1 && <div className="room-divider-v2"></div>}
                      </div>
                    ))}
                  </div>
                  <button 
                    type="button" 
                    className={`add-room-btn-v2 ${rooms.length >= MAX_ROOMS ? 'disabled' : ''}`}
                    onClick={addRoom}
                    disabled={rooms.length >= MAX_ROOMS}
                  >
                    {FaPlus({})} Add Room
                  </button>
                  <div className="total-guests-v2">
                    Total: {getTotalGuests()} Guests, {rooms.length} Room{rooms.length > 1 ? 's' : ''}
                  </div>
                </div>
                <div className="bottom-row-v2">
                  <div className="currency-col-v2">
                    <label className="currency-label-v2">💵 Currency</label>
                    <div className="custom-select-container" ref={currencyRef}>
                      <div 
                        className="custom-select-input"
                        onClick={() => {
                          console.log('Currency clicked!', !showCurrencyDropdown);
                          setShowCurrencyDropdown(!showCurrencyDropdown);
                          setShowNationalityDropdown(false);
                          setShowAutocomplete(false);
                        }}
                      >
                        <span className="select-text">
                          {selectedCurrency ? currencies.find(c => c.code === selectedCurrency)?.name : 'Select...'}
                        </span>
                        <span className="select-arrow">▼</span>
                      </div>
                      
                      {showCurrencyDropdown && createPortal(
                        <div 
                          className="custom-select-dropdown"
                          style={{
                            position: 'absolute',
                            top: `${currencyDropdownPos.top}px`,
                            left: `${currencyDropdownPos.left}px`,
                            width: `${currencyDropdownPos.width}px`,
                            zIndex: 9999,
                            backgroundColor: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                            maxHeight: '300px',
                            overflow: 'auto',
                            marginTop: 0
                          }}
                        >
                          <div className="dropdown-search-container">
                            <input
                              type="text"
                              placeholder="Search currency..."
                              value={currencySearch}
                              onChange={(e) => setCurrencySearch(e.target.value)}
                              className="dropdown-search-input"
                              autoFocus
                            />
                          </div>
                          <div className="dropdown-items-container">
                            {!loadingCurrency && currencies
                              .filter(currency => 
                                currency.name.toLowerCase().includes(currencySearch.toLowerCase()) ||
                                currency.code.toLowerCase().includes(currencySearch.toLowerCase())
                              )
                              .map((currency) => (
                                <div 
                                  key={currency.code} 
                                  className="custom-select-item"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setSelectedCurrency(currency.code);
                                    setShowCurrencyDropdown(false);
                                    setCurrencySearch('');
                                  }}
                                >
                                  <div className="select-item-icon">💵</div>
                                  <div className="select-item-content">
                                    <div className="select-item-title">{currency.name}</div>
                                    <div className="select-item-subtitle">{currency.code}</div>
                                  </div>
                                </div>
                              ))}
                            {!loadingCurrency && currencies.filter(currency => 
                              currency.name.toLowerCase().includes(currencySearch.toLowerCase()) ||
                              currency.code.toLowerCase().includes(currencySearch.toLowerCase())
                            ).length === 0 && (
                              <div className="dropdown-no-results">
                                <div className="no-results-icon">🔍</div>
                                <div className="no-results-text">No currencies found</div>
                              </div>
                            )}
                          </div>
                        </div>,
                        document.body
                      )}
                    </div>
                  </div>
                  
                  <div className="nationality-col-v2">
                    <label className="nationality-label-v2">🏳️ Nationality</label>
                    <div className="custom-select-container" ref={nationalityRef}>
                      <div 
                        className="custom-select-input"
                        onClick={() => {
                          console.log('Nationality clicked!', !showNationalityDropdown);
                          setShowNationalityDropdown(!showNationalityDropdown);
                          setShowCurrencyDropdown(false);
                          setShowAutocomplete(false);
                        }}
                      >
                        <span className="select-text">
                          {selectedNationality ? (
                            <>
                              <span className="selected-flag">{getCountryFlag(selectedNationality)}</span>
                              <span className="selected-text">{nationalities.find(n => n.id === selectedNationality)?.name}</span>
                            </>
                          ) : 'Select...'}
                        </span>
                        <span className="select-arrow">▼</span>
                      </div>
                      
                      {showNationalityDropdown && createPortal(
                        <div 
                          className="custom-select-dropdown"
                          style={{
                            position: 'absolute',
                            top: `${nationalityDropdownPos.top}px`,
                            left: `${nationalityDropdownPos.left}px`,
                            width: `${nationalityDropdownPos.width}px`,
                            zIndex: 9999,
                            backgroundColor: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                            maxHeight: '300px',
                            overflow: 'auto',
                            marginTop: 0
                          }}
                        >
                          <div className="dropdown-search-container">
                            <input
                              type="text"
                              placeholder="Search nationality..."
                              value={nationalitySearch}
                              onChange={(e) => setNationalitySearch(e.target.value)}
                              className="dropdown-search-input"
                              autoFocus
                            />
                          </div>
                          <div className="dropdown-items-container">
                            {!loadingNationality && nationalities
                              .filter(nationality => 
                                nationality.name.toLowerCase().includes(nationalitySearch.toLowerCase()) ||
                                nationality.id.toLowerCase().includes(nationalitySearch.toLowerCase())
                              )
                              .map((nationality) => (
                                <div 
                                  key={nationality.id} 
                                  className="custom-select-item"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setSelectedNationality(nationality.id);
                                    setShowNationalityDropdown(false);
                                    setNationalitySearch('');
                                  }}
                                >
                                  <div className="select-item-icon">
                                    {getCountryFlag(nationality.id)}
                                  </div>
                                  <div className="select-item-content">
                                    <div className="select-item-title">{nationality.name}</div>
                                  </div>
                                </div>
                              ))}
                            {!loadingNationality && nationalities.filter(nationality => 
                              nationality.name.toLowerCase().includes(nationalitySearch.toLowerCase()) ||
                              nationality.id.toLowerCase().includes(nationalitySearch.toLowerCase())
                            ).length === 0 && (
                              <div className="dropdown-no-results">
                                <div className="no-results-icon">🔍</div>
                                <div className="no-results-text">No nationalities found</div>
                              </div>
                            )}
                          </div>
                        </div>,
                        document.body
                      )}
                    </div>
                  </div>
                </div>
                <button type="submit" className="search-btn-v2">
                  {FaSearch({ className: "search-btn-icon-v2" })} Search Hotels
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <footer className="footer" style={{ marginTop: '50px', backgroundColor: '#1e3a8a', color: 'white', padding: '40px 0 20px 0' }}>
        <div className="footer-content" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div className="footer-section" style={{ marginBottom: '30px' }}>
            <h3 style={{ color: '#fbbf24', marginBottom: '15px', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img 
                src={process.env.PUBLIC_URL + '/WhatsApp Image 2025-07-08 at 09.35.08_7abde45a.jpg'}
                alt="HotelRes Logo"
                style={{ height: 48, borderRadius: 12, marginRight: 14, verticalAlign: 'middle' }}
              />
              HotelRes
            </h3>
            <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>Your trusted partner for the best hotel experience</p>
            <div className="social-links" style={{ display: 'flex', gap: '15px' }}>
              <a href="#" className="social-link" style={{ color: 'white', textDecoration: 'none', padding: '8px 12px', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.1)', transition: 'all 0.3s ease' }}>📘 Facebook</a>
              <a href="#" className="social-link" style={{ color: 'white', textDecoration: 'none', padding: '8px 12px', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.1)', transition: 'all 0.3s ease' }}>📷 Instagram</a>
              <a href="#" className="social-link" style={{ color: 'white', textDecoration: 'none', padding: '8px 12px', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.1)', transition: 'all 0.3s ease' }}>🐦 Twitter</a>
            </div>
          </div>
          
          <div className="footer-section" style={{ marginBottom: '30px' }}>
            <h4 style={{ color: '#fbbf24', marginBottom: '15px', fontSize: '1.2rem' }}>🔍 Quick Access</h4>
            <ul className="footer-links" style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '10px' }}><a href="#" style={{ color: 'white', textDecoration: 'none', transition: 'color 0.3s ease' }}>🏠 Home Page</a></li>
              <li style={{ marginBottom: '10px' }}><a href="#" style={{ color: 'white', textDecoration: 'none', transition: 'color 0.3s ease' }}>🔍 Search Hotels</a></li>
              <li style={{ marginBottom: '10px' }}><a href="#" style={{ color: 'white', textDecoration: 'none', transition: 'color 0.3s ease' }}>📋 My Reservations</a></li>
              <li style={{ marginBottom: '10px' }}><a href="#" style={{ color: 'white', textDecoration: 'none', transition: 'color 0.3s ease' }}>⭐ My favorites</a></li>
            </ul>
          </div>
          
          <div className="footer-section" style={{ marginBottom: '30px' }}>
            <h4 style={{ color: '#fbbf24', marginBottom: '15px', fontSize: '1.2rem' }}>📞 Contact</h4>
            <ul className="footer-links" style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '10px', color: 'white' }}>📧 info@hotelres.com</li>
              <li style={{ marginBottom: '10px', color: 'white' }}>📱 +90 212 555 0123</li>
              <li style={{ marginBottom: '10px', color: 'white' }}>📍 Antalya, Turkey</li>
              <li style={{ marginBottom: '10px', color: 'white' }}>🕒 7/24 Support</li>
            </ul>
          </div>
          
          <div className="footer-section" style={{ marginBottom: '30px' }}>
            <h4 style={{ color: '#fbbf24', marginBottom: '15px', fontSize: '1.2rem' }}>💳 Payment Methods</h4>
            <div className="payment-methods" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              <span className="payment-method" style={{ color: 'white', padding: '6px 10px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.1)', fontSize: '0.9rem' }}>💳 Visa</span>
              <span className="payment-method" style={{ color: 'white', padding: '6px 10px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.1)', fontSize: '0.9rem' }}>💳 MasterCard</span>
              <span className="payment-method" style={{ color: 'white', padding: '6px 10px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.1)', fontSize: '0.9rem' }}>💳 PayPal</span>
              <span className="payment-method" style={{ color: 'white', padding: '6px 10px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.1)', fontSize: '0.9rem' }}>🏦 Bank Transfer</span>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom" style={{ borderTop: '1px solid rgba(255,255,255,0.2)', marginTop: '30px', paddingTop: '20px', textAlign: 'center' }}>
          <p style={{ marginBottom: '15px', color: 'rgba(255,255,255,0.8)' }}>&copy; 2025 HotelRes. All rights reserved.</p>
          <div className="footer-bottom-links" style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <a href="#" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.3s ease' }}>Privacy Policy</a>
            <a href="#" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.3s ease' }}>Terms of Use</a>
            <a href="#" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.3s ease' }}>Cookie Policy</a>
          </div>
        </div>
      </footer>
    </>
  );
};

export default SearchPage;
