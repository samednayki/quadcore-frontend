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
  const [selectedCurrency, setSelectedCurrency] = useState('EUR'); // Euro default
  const [selectedNationality, setSelectedNationality] = useState('DE'); // Germany default

  // Search states for currency and nationality
  const [currencySearch, setCurrencySearch] = useState('EUR');
  const [nationalitySearch, setNationalitySearch] = useState('Germany');

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

  // Modal için state'ler
  const [showChildAgeModal, setShowChildAgeModal] = useState(false);
  const [pendingRoomId, setPendingRoomId] = useState<number | null>(null);
  const [pendingChildAges, setPendingChildAges] = useState<number[]>([]);

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

  // Tarih formatlama fonksiyonu (UTC değil, yerel saat)
  function formatDateLocal(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const isDateAvailable = (date: Date) => {
    const dateString = formatDateLocal(date);
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
    return selectedCheckInDate === formatDateLocal(date);
  };

  const isSelectedCheckOutDate = (date: Date) => {
    return selectedCheckOutDate === formatDateLocal(date);
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
      setSelectedCheckInDate(formatDateLocal(date));
      setShowCheckInCalendar(false);
    }
  };

  const selectCheckOutDate = (date: Date) => {
    // Check if checkout date is after checkin date
    if (selectedCheckInDate && date <= new Date(selectedCheckInDate)) {
      return; // Don't allow checkout date before or equal to checkin date
    }
    setSelectedCheckOutDate(formatDateLocal(date));
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
      setSelectedCheckInDate(formatDateLocal(today));
    }
  };

  const goToCheckOutToday = () => {
    const today = new Date();
    setCurrentCheckOutMonth(today);
    if (selectedCheckInDate && today > new Date(selectedCheckInDate)) {
      setSelectedCheckOutDate(formatDateLocal(today));
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
        
        // Check if EUR exists in the currencies, if not, set to first available
        if (data.body?.currencies) {
          const eurCurrency = data.body.currencies.find((c: any) => c.code === 'EUR');
          if (!eurCurrency && data.body.currencies.length > 0) {
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

  // Modal açıldığında yaşları ayarla
  const openChildAgeModal = (roomId: number, newChildCount: number, currentAges: number[]) => {
    setPendingRoomId(roomId);
    // Yeni çocuk ekleniyorsa varsayılan yaş 5 ekle
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

  // Modalda yaş güncelle
  const updatePendingChildAge = (idx: number, age: number) => {
    setPendingChildAges(prev => {
      const arr = [...prev];
      arr[idx] = Math.max(0, Math.min(17, age));
      return arr;
    });
  };

  // Modalda kaydet
  const saveChildAges = () => {
    if (pendingRoomId !== null) {
      setRooms(rooms => rooms.map(room => {
        if (room.id === pendingRoomId) {
          return { ...room, children: pendingChildAges.length, childAges: pendingChildAges };
        }
        return room;
      }));
    }
    setShowChildAgeModal(false);
    setPendingRoomId(null);
    setPendingChildAges([]);
  };

  // Guests dropdown modal state
  const [showGuestsDropdown, setShowGuestsDropdown] = useState(false);

  // Check-in ve check-out inputları için ref ekle
  const checkInRef = useRef<HTMLInputElement | null>(null);
  const checkOutRef = useRef<HTMLInputElement | null>(null);
  const [checkInCalendarPos, setCheckInCalendarPos] = useState({ top: 0, left: 0, width: 0 });
  const [checkOutCalendarPos, setCheckOutCalendarPos] = useState({ top: 0, left: 0, width: 0 });

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

  // Check-in calendar açıldığında pozisyonu hesapla
  useEffect(() => {
    if (showCheckInCalendar && checkInRef.current) {
      const rect = checkInRef.current.getBoundingClientRect();
      setCheckInCalendarPos({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, [showCheckInCalendar]);
  // Check-out calendar açıldığında pozisyonu hesapla
  useEffect(() => {
    if (showCheckOutCalendar && checkOutRef.current) {
      const rect = checkOutRef.current.getBoundingClientRect();
      setCheckOutCalendarPos({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, [showCheckOutCalendar]);

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

    if (!currencySearch || currencySearch.trim() === '') {
      setSearchError('Please select a currency');
      return;
    }
    if (!nationalitySearch || nationalitySearch.trim() === '') {
      setSearchError('Please select a nationality');
      return;
    }

    // Prepare search parameters
    const searchParams = {
      destination: selectedDestination.id,
      destinationName: selectedDestination.name,
      destinationType: selectedDestination.type,
      checkIn: selectedCheckInDate,
      checkOut: selectedCheckOutDate,
      guests: getTotalGuests(),
      rooms: rooms.length,
      currency: currencySearch,
      nationality: nationalitySearch, // nationalitySearch'e ülke kodu atanacak
      roomDetails: rooms.map(room => ({
        adults: room.adults,
        children: room.children,
        childAges: room.childAges
      }))
    };

    // Store last search params in localStorage
    localStorage.setItem('lastHotelSearchParams', JSON.stringify(searchParams));

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
          fontFamily: `'Inter', 'Roboto', 'Segoe UI', 'Arial', sans-serif`,
          fontWeight: 400,
          letterSpacing: 0.01,
          color: '#232931'
        }}
      >
        <header className="app-header">
          <div className="logo-title">
            <img src={logoUrl} alt="HotelRes Logo" className="app-logo" />
            <span className="app-title">HotelRes</span>
          </div>
          <nav className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: 24, justifyContent: 'flex-end', width: '100%' }}>
            {/* Currency & Nationality dropdowns önce gelsin */}
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginRight: 32 }}>
              {/* Currency Dropdown */}
              <div ref={currencyRef} style={{ position: 'relative', minWidth: 120 }}>
                <input
                  type="text"
                  value={currencySearch}
                  onChange={e => {
                    setCurrencySearch(e.target.value);
                    setShowCurrencyDropdown(true);
                    setShowNationalityDropdown(false);
                    setShowAutocomplete(false);
                  }}
                  onFocus={() => setShowCurrencyDropdown(true)}
                  onBlur={() => setTimeout(() => setShowCurrencyDropdown(false), 200)}
                  placeholder="Currency"
                  style={{
                    border: '1.5px solid #bbdefb',
                    borderRadius: '12px',
                    padding: '0.5rem 1.2rem',
                    background: '#fff',
                    width: 100,
                    fontWeight: 500,
                    fontSize: '1rem',
                    color: '#232931',
                    marginRight: 8
                  }}
                />
                <span style={{ marginLeft: 4, color: '#888', fontSize: 16, userSelect: 'none', cursor: 'pointer' }} onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}>▼</span>
                {showCurrencyDropdown && createPortal(
                  <div
                    className="custom-select-dropdown"
                    style={{
                      position: 'absolute',
                      top: currencyDropdownPos.top,
                      left: currencyDropdownPos.left,
                      width: currencyDropdownPos.width,
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
                    <div className="dropdown-items-container">
                      {currencies
                        .filter(currency =>
                          currency.name.toLowerCase().includes((currencySearch || '').toLowerCase()) ||
                          currency.code.toLowerCase().includes((currencySearch || '').toLowerCase())
                        )
                        .map(currency => (
                          <div
                            key={currency.code}
                            className="custom-select-item"
                            onMouseDown={e => {
                e.preventDefault();
                              setSelectedCurrency(currency.code);
                              setCurrencySearch(currency.name);
                              setShowCurrencyDropdown(false);
                            }}
                          >
                            <div className="select-item-icon">💵</div>
                            <div className="select-item-content">
                              <div className="select-item-title">{currency.name}</div>
                              <div className="select-item-subtitle">{currency.code}</div>
                            </div>
                          </div>
                        ))}
                      {currencies.filter(currency =>
                        currency.name.toLowerCase().includes((currencySearch || '').toLowerCase()) ||
                        currency.code.toLowerCase().includes((currencySearch || '').toLowerCase())
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
              {/* Nationality Dropdown */}
              <div ref={nationalityRef} style={{ position: 'relative', minWidth: 120 }}>
                <input
                  type="text"
                  value={nationalitySearch}
                  onChange={e => {
                    setNationalitySearch(e.target.value);
                    setShowNationalityDropdown(true);
                    setShowCurrencyDropdown(false);
                    setShowAutocomplete(false);
                  }}
                  onFocus={() => setShowNationalityDropdown(true)}
                  onBlur={() => setTimeout(() => setShowNationalityDropdown(false), 200)}
                  placeholder="Nationality"
                  style={{
                    border: '1.5px solid #bbdefb',
                    borderRadius: '12px',
                    padding: '0.5rem 1.2rem',
                    background: '#fff',
                    width: 100,
                    fontWeight: 500,
                    fontSize: '1rem',
                    color: '#232931',
                  }}
                />
                <span style={{ marginLeft: 4, color: '#888', fontSize: 16, userSelect: 'none', cursor: 'pointer' }} onClick={() => setShowNationalityDropdown(!showNationalityDropdown)}>▼</span>
                {showNationalityDropdown && createPortal(
                  <div
                    className="custom-select-dropdown"
          style={{
                      position: 'absolute',
                      top: nationalityDropdownPos.top,
                      left: nationalityDropdownPos.left,
                      width: nationalityDropdownPos.width,
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
                    <div className="dropdown-items-container">
                      {nationalities
                        .filter(nationality =>
                          nationality.name.toLowerCase().includes((nationalitySearch || '').toLowerCase()) ||
                          nationality.id.toLowerCase().includes((nationalitySearch || '').toLowerCase())
                        )
                        .map(nationality => (
                          <div
                            key={nationality.id}
                            className="custom-select-item"
                            onMouseDown={e => {
                              e.preventDefault();
                              setSelectedNationality(nationality.id);
                              setNationalitySearch(nationality.id); // KODU ata
                              setShowNationalityDropdown(false);
                            }}
                          >
                            <div className="select-item-icon">{getCountryFlag(nationality.id)}</div>
                            <div className="select-item-content">
                              <div className="select-item-title">{nationality.name}</div>
                </div>
              </div>
                        ))}
                      {nationalities.filter(nationality =>
                        nationality.name.toLowerCase().includes((nationalitySearch || '').toLowerCase()) ||
                        nationality.id.toLowerCase().includes((nationalitySearch || '').toLowerCase())
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
            {/* Nav linkler sağda */}
            <a href="#" className="nav-link nav-box">{FaHome({ className: "nav-icon" })}<span className="nav-text">Home</span></a>
            <a href="#" className="nav-link nav-box">{FaBookmark({ className: "nav-icon" })}<span className="nav-text">My Reservations</span></a>
          </nav>
        </header>
        <div
          style={{ position: 'relative', zIndex: 1, minHeight: 'calc(100vh - 120px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <form
            className="searchbar-unified"
            onSubmit={handleSearchSubmit}
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255,255,255,0.98)',
              borderRadius: 32,
              boxShadow: '0 10px 36px 0 rgba(30, 58, 138, 0.13)',
              minHeight: 80,
              maxWidth: 1600,
              width: '100%',
              padding: 0,
              gap: 0,
              overflow: 'visible',
            }}
          >
            {/* Destination */}
            <div style={{ flex: 2, minWidth: 320, maxWidth: 600, display: 'flex', alignItems: 'center', position: 'relative', background: 'none', borderRight: '1.5px solid #e0e7ef', height: 80 }}>
              <span style={{ position: 'absolute', left: 22, fontSize: 26, color: '#2563eb', zIndex: 2 }}>📍</span>
                  <input 
                className="searchbar-input"
                    type="text" 
                placeholder="Destination"
                    value={destinationQuery}
                onChange={e => {
                      setDestinationQuery(e.target.value);
                      fetchAutocomplete(e.target.value);
                    }}
                    onFocus={() => {
                  if (destinationQuery.length >= 3) setShowAutocomplete(true);
                      setShowCurrencyDropdown(false);
                      setShowNationalityDropdown(false);
                    }}
                onBlur={() => setTimeout(() => setShowAutocomplete(false), 300)}
                style={{
                  width: '100%',
                  height: 80,
                  border: 'none',
                  outline: 'none',
                  background: 'none',
                  fontWeight: 700,
                  fontSize: '1.32rem',
                  color: '#232931',
                  padding: '0 1.6rem 0 3.2rem',
                  borderRadius: 0,
                  display: 'flex',
                  alignItems: 'center',
                }}
              />
              {loadingAutocomplete && <div className="autocomplete-loading">⏳</div>}
                  {showAutocomplete && (
                    <div className="autocomplete-dropdown">
                      {autocompleteResults.length > 0 ? (
                        autocompleteResults.map((item, index) => (
                      <div key={index} className="autocomplete-item" onClick={() => {
                            let displayText = '';
                            let destinationId = '';
                            let destinationType = 2;
                            let destinationName = '';
                            if (item.hotel) {
                              displayText = `${item.hotel.name}, ${item.city?.name || ''}, ${item.country?.name || ''}`;
                              destinationId = item.hotel.id;
                              destinationType = 1; // Otel için 1
                              destinationName = item.hotel.name;
                            } else if (item.city) {
                              displayText = `${item.city.name}, ${item.state?.name || ''}, ${item.country?.name || ''}`;
                              destinationId = item.city.id;
                              destinationType = 2; // Şehir için 2
                              destinationName = item.city.name;
                            } else if (item.state) {
                              displayText = `${item.state.name}, ${item.country?.name || ''}`;
                              destinationId = item.state.id;
                              destinationType = 2;
                              destinationName = item.state.name;
                            } else if (item.country) {
                              displayText = item.country.name;
                              destinationId = item.country.id;
                              destinationType = 2;
                              destinationName = item.country.name;
                            }
                            setDestinationQuery(displayText);
                        setSelectedDestination({ id: destinationId, type: destinationType, name: destinationName });
                            setShowAutocomplete(false);
                        if (destinationId && destinationType) fetchCheckInDates(destinationId, destinationType);
                      }}>
                        <div className="autocomplete-icon">{item.hotel ? '🏨' : '📍'}</div>
                            <div className="autocomplete-content">
                          <div className="autocomplete-title">{item.hotel ? item.hotel.name : (item.city ? item.city.name : (item.state ? item.state.name : item.country?.name))}</div>
                          <div className="autocomplete-subtitle">{item.city && item.city.name !== (item.hotel ? item.hotel.name : item.state?.name) && `${item.city.name}, `}{item.state && item.state.name !== item.country?.name && `${item.state.name}, `}{item.country?.name}</div>
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
            {/* Check-in */}
            <div style={{ flex: 1, minWidth: 220, maxWidth: 400, display: 'flex', alignItems: 'center', borderRight: '1.5px solid #e0e7ef', height: 80, overflow: 'visible', position: 'relative' }}>
                      <input 
                ref={checkInRef}
                className="searchbar-input"
                        type="text"
                placeholder="Check-in"
                value={selectedCheckInDate ? new Date(selectedCheckInDate).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : ''}
                        readOnly
                        disabled={!selectedDestination || loadingCheckIn}
                        onClick={() => setShowCheckInCalendar(!showCheckInCalendar)}
                style={{
                  width: '100%',
                  height: 80,
                  border: 'none',
                  outline: 'none',
                  background: 'none',
                  fontWeight: 700,
                  fontSize: '1.32rem',
                  color: '#232931',
                  padding: '0 1.6rem',
                  borderRadius: 0,
                  display: 'flex',
                  alignItems: 'center',
                }}
              />
              {showCheckInCalendar && createPortal(
                <div className="calendar-widget" style={{ zIndex: 99999, overflow: 'visible', position: 'fixed', top: checkInCalendarPos.top, left: checkInCalendarPos.left, width: checkInCalendarPos.width, background: '#fff' }}>
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
                  </div>,
                  document.body
                )}
                  </div>
            {/* Check-out */}
            <div style={{ flex: 1, minWidth: 220, maxWidth: 400, display: 'flex', alignItems: 'center', borderRight: '1.5px solid #e0e7ef', height: 80, overflow: 'visible', position: 'relative' }}>
                      <input
                ref={checkOutRef}
                className="searchbar-input"
                        type="text"
                placeholder="Check-out"
                value={selectedCheckOutDate ? new Date(selectedCheckOutDate).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : ''}
                        readOnly
                        disabled={!selectedCheckInDate}
                        onClick={() => setShowCheckOutCalendar(!showCheckOutCalendar)}
                style={{
                  width: '100%',
                  height: 80,
                  border: 'none',
                  outline: 'none',
                  background: 'none',
                  fontWeight: 700,
                  fontSize: '1.32rem',
                  color: '#232931',
                  padding: '0 1.6rem',
                  borderRadius: 0,
                  display: 'flex',
                  alignItems: 'center',
                }}
              />
              {showCheckOutCalendar && createPortal(
                <div className="calendar-widget" style={{ zIndex: 99999, overflow: 'visible', position: 'fixed', top: checkOutCalendarPos.top, left: checkOutCalendarPos.left, width: checkOutCalendarPos.width, background: '#fff' }}>
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
                  </div>,
                  document.body
                    )}
                  </div>
            {/* Guests (summary, açılır modal) */}
            <div style={{ flex: 1.2, minWidth: 220, maxWidth: 340, display: 'flex', alignItems: 'center', borderRight: '1.5px solid #e0e7ef', height: 80, position: 'relative' }}>
              <button type="button" className="searchbar-input" style={{
                width: '100%',
                height: 80,
                border: 'none',
                outline: 'none',
                background: 'none',
                fontWeight: 700,
                fontSize: '1.32rem',
                color: '#232931',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderRadius: 0,
                padding: '0 1.6rem',
              }} onClick={() => setShowGuestsDropdown(true)}>
                <span>{getTotalGuests()} Guest{getTotalGuests() > 1 ? 's' : ''}, {rooms.length} Room{rooms.length > 1 ? 's' : ''}</span>
                <span style={{ fontSize: 26, color: '#2563eb', marginLeft: 10 }}>▼</span>
                              </button>
              {showGuestsDropdown && (
                <div style={{ position: 'absolute', top: 76, left: 0, zIndex: 100, background: '#fff', border: '1.5px solid #e0e7ef', borderRadius: 12, boxShadow: '0 8px 32px #2563eb22', padding: 18, minWidth: 260 }}>
                  {rooms.map((room, index) => (
                    <div key={room.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, position: 'relative' }}>
                      <span style={{ fontWeight: 700 }}>Room {index + 1}:</span>
                      <span>Adults</span>
                      <button type="button" onClick={() => updateRoomGuests(room.id, 'adults', room.adults - 1)} disabled={room.adults <= 1} style={{ fontSize: 18, width: 28, height: 28, borderRadius: 8, border: '1.5px solid #e0e7ef', background: '#fff', color: '#2563eb', fontWeight: 700, marginLeft: 2 }}>-</button>
                      <span style={{ fontWeight: 700 }}>{room.adults}</span>
                      <button type="button" onClick={() => updateRoomGuests(room.id, 'adults', room.adults + 1)} disabled={room.adults >= MAX_ADULTS} style={{ fontSize: 18, width: 28, height: 28, borderRadius: 8, border: '1.5px solid #e0e7ef', background: '#fff', color: '#2563eb', fontWeight: 700 }}>+</button>
                      <span>Children</span>
                      <button type="button" onClick={() => updateRoomGuests(room.id, 'children', room.children - 1)} disabled={room.children <= 0} style={{ fontSize: 18, width: 28, height: 28, borderRadius: 8, border: '1.5px solid #e0e7ef', background: '#fff', color: '#f59e42', fontWeight: 700, marginLeft: 2 }}>-</button>
                      <span style={{ fontWeight: 700 }}>{room.children}</span>
                      <button type="button" onClick={() => openChildAgeModal(room.id, room.children + 1, room.childAges)} disabled={room.children >= MAX_CHILDREN} style={{ fontSize: 18, width: 28, height: 28, borderRadius: 8, border: '1.5px solid #e0e7ef', background: '#fff', color: '#f59e42', fontWeight: 700 }}>+</button>
                      {/* Remove Room butonu, ilk oda hariç */}
                      {rooms.length > 1 && index > 0 && (
                        <button type="button" onClick={() => removeRoom(room.id)} style={{ marginLeft: 8, background: '#ff5252', color: '#fff', border: 'none', borderRadius: 8, width: 28, height: 28, fontWeight: 900, fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                            )}
                          </div>
                  ))}
                  <button type="button" onClick={addRoom} disabled={rooms.length >= MAX_ROOMS} style={{ marginTop: 8, fontWeight: 700, color: '#2563eb', background: '#e0e7ef', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 15, cursor: rooms.length >= MAX_ROOMS ? 'not-allowed' : 'pointer', opacity: rooms.length >= MAX_ROOMS ? 0.5 : 1 }}>+ Add Room</button>
                  <div style={{ marginTop: 12, fontWeight: 900, color: '#334155', background: '#f1f5f9', borderRadius: 10, padding: '10px 18px', fontSize: 16, boxShadow: '0 1px 4px #2563eb0a' }}>
                    Total: {getTotalGuests()} Guests, {rooms.length} Room{rooms.length > 1 ? 's' : ''}
                        </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
                    <button type="button" onClick={() => setShowGuestsDropdown(false)} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 32px', fontWeight: 800, fontSize: 18, cursor: 'pointer' }}>Done</button>
                          </div>
                        </div>
              )}
                          </div>
            {/* Search Button */}
            <div style={{
              flex: 0.9,
              minWidth: 220,
              maxWidth: 260,
              display: 'flex',
              alignItems: 'stretch', // stretch ile tam hizalama
              justifyContent: 'center',
              height: 80,
              minHeight: 80,
              maxHeight: 80,
              background: '#fff',
              borderRadius: 0,
              borderTopRightRadius: 32,
              borderBottomRightRadius: 32,
              boxShadow: 'none',
              margin: 0,
              padding: 0
            }}>
                                    <button 
                type="submit"
                className="search-btn-v2"
                style={{
                  width: '100%',
                  height: '100%',
                  minHeight: 80,
                  maxHeight: 80,
                  fontSize: '1.32rem',
                  borderRadius: 0,
                  borderTopRightRadius: 32,
                  borderBottomRightRadius: 32,
                  background: 'linear-gradient(90deg, #2563eb 0%, #7c3aed 100%)',
                  color: '#fff',
                  fontWeight: 900,
                  boxShadow: 'none',
                  border: 'none',
                  margin: 0,
                  padding: 0,
                  letterSpacing: 1,
                  display: 'block',
                  lineHeight: '80px', // tam ortalama
                  verticalAlign: 'middle',
                  textAlign: 'center',
                }}
              >
                Search Hotels
                                    </button>
                                  </div>
          </form>
                                </div>
                            </div>
      {/* Çocuk yaş modalı */}
      {showChildAgeModal && (
        <div className="child-age-modal-overlay" style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="child-age-modal" style={{ background: '#fff', borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.18)', padding: 32, minWidth: 320, maxWidth: 400 }}>
            <h3 style={{ color: '#ff9800', fontWeight: 600, fontSize: 20, marginBottom: 18, fontFamily: `'Inter', 'Roboto', 'Segoe UI', 'Arial', sans-serif` }}>Enter Child Ages</h3>
            {pendingChildAges.map((age, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, background: '#fff8e1', borderRadius: 8, padding: 12 }}>
                <span style={{ color: '#e65100', fontWeight: 500, fontSize: 16 }}>Child {idx + 1}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button type="button" style={{ background: '#ff5252', color: '#fff', border: 'none', borderRadius: '50%', width: 32, height: 32, fontSize: 18, fontWeight: 700, cursor: 'pointer' }} onClick={() => updatePendingChildAge(idx, age - 1)} disabled={age <= 0}>-</button>
                  <span style={{ fontWeight: 600, fontSize: 18, color: '#e65100', minWidth: 24, textAlign: 'center' }}>{age}</span>
                  <button type="button" style={{ background: '#4caf50', color: '#fff', border: 'none', borderRadius: '50%', width: 32, height: 32, fontSize: 18, fontWeight: 700, cursor: 'pointer' }} onClick={() => updatePendingChildAge(idx, age + 1)} disabled={age >= 17}>+</button>
                          </div>
                      </div>
                    ))}
            {/* Add Child butonu */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16 }}>
                  <button 
                    type="button" 
                          style={{
                  background: '#4caf50',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  fontSize: 18,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onClick={() => pendingChildAges.length < MAX_CHILDREN && setPendingChildAges([...pendingChildAges, 5])}
                disabled={pendingChildAges.length >= MAX_CHILDREN}
              >
                {FaPlus({})}
              </button>
              <span style={{ fontWeight: 500, color: '#4caf50', fontSize: 16 }}>Add Child</span>
                          </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 18 }}>
              <button type="button" style={{ background: '#ececec', color: '#232931', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 500, fontFamily: `'Inter', 'Roboto', 'Segoe UI', 'Arial', sans-serif`, cursor: 'pointer' }} onClick={() => setShowChildAgeModal(false)}>Cancel</button>
              <button type="button" style={{ background: '#ff9800', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 600, fontFamily: `'Inter', 'Roboto', 'Segoe UI', 'Arial', sans-serif`, cursor: 'pointer' }} onClick={saveChildAges}>Save</button>
                                  </div>
                                </div>
                              </div>
                            )}
      <footer className="footer" style={{ marginTop: '24px', backgroundColor: '#1a1a2e', color: '#e0e0e0', padding: '24px 0 8px 0', fontFamily: `'Inter', 'Roboto', 'Arial', sans-serif`, fontWeight: 400, fontSize: '1rem', border: 'none', boxShadow: 'none' }}>
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
          <span>© 2025 HotelRes. All rights reserved.</span>
          <div className="footer-bottom-links" style={{ display: 'flex', gap: '1rem' }}>
            <a href="#" style={{ color: '#b0b0b0', fontSize: '0.95rem', padding: '0.2rem 0.7rem', textDecoration: 'none' }}>Privacy Policy</a>
            <a href="#" style={{ color: '#b0b0b0', fontSize: '0.95rem', padding: '0.2rem 0.7rem', textDecoration: 'none' }}>Terms of Use</a>
            <a href="#" style={{ color: '#b0b0b0', fontSize: '0.95rem', padding: '0.2rem 0.7rem', textDecoration: 'none' }}>Cookie Policy</a>
          </div>
        </div>
      </footer>
    </>
  );
};

export default SearchPage;
