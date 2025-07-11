import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import Select, { components } from 'react-select';
import { SearchCriteria, Child } from '../../types';
import { CURRENCIES } from '../../constants';
import { addDays } from '../../utils';
import 'react-datepicker/dist/react-datepicker.css';
// ICONS
import { MapPin, Calendar, User, Plus, Banknote, Globe, Baby, Search, Bed } from 'lucide-react';
import { fetchBackendNationalities, fetchBackendCurrencies, searchAPI, fetchCheckInDays } from '../../services/api';

const SearchForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Partial<SearchCriteria>>({
    location: '',
    checkIn: new Date(),
    checkOut: addDays(new Date(), 1),
    currency: 'TRY',
    nationality: 'TR',
    adults: 2,
    children: [],
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [defaultNationality, setDefaultNationality] = useState('');

  // Para birimi seçenekleri
  const [currencyOptions, setCurrencyOptions] = useState<{ value: string; label: string; symbol?: string }[]>([]);
  useEffect(() => {
    const getCurrencies = async () => {
      try {
        const data = await fetchBackendCurrencies();
        const items = data?.body?.currencies || [];
        setCurrencyOptions(
          items.map((item: any) => ({
            value: item.code || '',
            label: item.name || item.code || '',
            symbol: item.iconText || '',
          }))
        );
      } catch (e) {
        setCurrencyOptions([
          { value: 'EUR', label: 'Euro (€)', symbol: '€' },
          { value: 'USD', label: 'US Dollar ($)', symbol: '$' },
          { value: 'TRY', label: 'Turkish Lira (₺)', symbol: '₺' },
        ]);
      }
    };
    getCurrencies();
  }, []);

  // Ülke seçenekleri
  const [countryOptions, setCountryOptions] = useState<{ value: string; label: string }[]>([]);
  useEffect(() => {
    const getNationalities = async () => {
      try {
        const data = await fetchBackendNationalities();
        const items = data?.body?.nationalities || [];
        setCountryOptions(
          items.map((item: any) => ({
            value: item.id || '',
            label: item.name || '',
          }))
        );
        setDefaultNationality(data?.body?.default || '');
      } catch (e) {
        setDefaultNationality('');
      }
    };
    getNationalities();
  }, []);

  useEffect(() => {
    if (countryOptions.length === 0 || !defaultNationality) return;
    if (formData.nationality === defaultNationality) return;
    const defaultCountry = countryOptions.find(opt => opt.value === defaultNationality);
    setFormData(prev => ({
      ...prev,
      nationality: defaultCountry ? defaultCountry.value : countryOptions[0].value
    }));
  }, [countryOptions, defaultNationality]);

  // 1. Yeni state: rooms
  const [rooms, setRooms] = useState([
    { adults: 1, children: 0, childrenAges: [] as (number|null)[] }
  ]);

  // 2. Oda ekleme/çıkarma fonksiyonları
  const addRoom = () => {
    setRooms([...rooms, { adults: 1, children: 0, childrenAges: [] }]);
  };
  const removeRoom = (index: number) => {
    setRooms(rooms.filter((_, i) => i !== index));
  };
  const updateRoom = (index: number, field: 'adults' | 'children', value: number) => {
    setRooms(rooms.map((room, i) => {
      if (i !== index) return room;
      if (field === 'children') {
        let newAges = [...room.childrenAges];
        if (value > room.children) {
          // Çocuk eklendi
          newAges = [...newAges, ...Array(value - room.children).fill(null)];
        } else if (value < room.children) {
          // Çocuk çıkarıldı
          newAges = newAges.slice(0, value);
        }
        return { ...room, children: value, childrenAges: newAges };
      }
      return { ...room, [field]: value };
    }));
  };
  const updateChildAge = (roomIdx: number, childIdx: number, age: number|null) => {
    setRooms(rooms.map((room, i) => {
      if (i !== roomIdx) return room;
      const newAges = [...room.childrenAges];
      newAges[childIdx] = age;
      return { ...room, childrenAges: newAges };
    }));
  };

  // 3. Guests summary
  const totalGuests = rooms.reduce((sum, r) => sum + r.adults + r.children, 0);

  // Form güncelleme
  const handleInputChange = (field: keyof SearchCriteria, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Çocuk ekleme/çıkarma
  const handleChildChange = (index: number, age: number) => {
    const newChildren = [...(formData.children || [])];
    newChildren[index] = { age };
    setFormData(prev => ({ ...prev, children: newChildren }));
  };

  const addChild = () => {
    const newChildren = [...(formData.children || []), { age: 5 }];
    setFormData(prev => ({ ...prev, children: newChildren }));
  };

  const removeChild = (index: number) => {
    const newChildren = (formData.children || []).filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, children: newChildren }));
  };

  // Bayrak fonksiyonu
  const getFlagEmoji = (countryCode: string) =>
    countryCode
      .toUpperCase()
      .replace(/./g, char =>
        String.fromCodePoint(127397 + char.charCodeAt(0))
      );

  // Custom Option for react-select
  const CountryOption = (props: any) => (
    <components.Option {...props}>
      <span style={{ marginRight: 8 }}>
        {getFlagEmoji(props.data.value)}
      </span>
      {props.data.label}
    </components.Option>
  );

  const [checkInDates, setCheckInDates] = useState<Date[] | null>(null);

  // Uygun check-in günlerini otomatik çek (ör: location veya productType değişince)
  useEffect(() => {
    const fetchDates = async () => {
      if (!formData.location) return;
      // ArrivalLocations örneği: (gelişmişte burası dinamik yapılabilir)
      const arrivalLocations = [
        { Id: '5', Type: 1 }
      ];
      try {
        const checkInResponse = await fetchCheckInDays({
          productType: 2,
          IncludeSubLocations: true,
          Product: null,
          ArrivalLocations: arrivalLocations
        });
        const dates = checkInResponse?.body?.dates || [];
        setCheckInDates(dates.map((d: string) => new Date(d)));
      } catch {
        setCheckInDates(null);
      }
    };
    fetchDates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.location]);

  // Form gönderme
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasyon
    const validationErrors: string[] = [];
    
    if (!formData.location?.trim()) {
      validationErrors.push('Location selection is mandatory');
    }
    
    if (!formData.checkIn || !formData.checkOut) {
      validationErrors.push('Date selection is mandatory');
    } else if (formData.checkIn >= formData.checkOut) {
      validationErrors.push('Check-out date must be after check-in date');
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    
    // URL parametrelerini oluştur ve yönlendir
    const params = new URLSearchParams({
      location: formData.location!,
      checkIn: formData.checkIn!.toISOString(),
      checkOut: formData.checkOut!.toISOString(),
      currency: formData.currency!,
      nationality: formData.nationality!,
      adults: formData.adults!.toString(),
      children: JSON.stringify(formData.children),
    });
    navigate(`/search?${params.toString()}`);
  };

  // Autocomplete fonksiyonu
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const handleSuggestionClick = (item: any) => {
    // If hotel suggestion, set input to hotel name; if location, set to city/airport name
    let value = '';
    if (item.type === 2 && item.hotel?.name) {
      value = item.hotel.name;
    } else if (item.type === 1 && (item.city?.name || item.airport?.name)) {
      value = item.city?.name || item.airport?.name;
    } else {
      value = item.name;
    }
    handleInputChange('location', value);
    setSuggestions([]);
  };

  // Benzersiz ve anlamlı öneri listesi oluştur
  // Yeni: type:1 (location) ve type:2 (hotel) ayrı ayrı gruplansın
  const locationSuggestions = suggestions.filter(item => item.type === 1 && (item.city?.name || item.airport?.name));
  const hotelSuggestions = suggestions.filter(item => item.type === 2 && item.hotel?.name);

  const uniqueSuggestions = Array.from(
    new Map(
      suggestions
        .filter(item => item.city?.name || item.hotel?.name || item.airport?.name)
        .map(item => [
          (item.city?.name || item.hotel?.name || item.airport?.name)?.toLowerCase(),
          item
        ])
    ).values()
  );

  const handleLocationChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    handleInputChange('location', value);
    if (value.length >= 3) {
      setIsLoadingSuggestions(true);
      const productType = 2;
      try {
        const response = await searchAPI.getArrivalAutocomplete({ query: value, productType });
        setSuggestions(response.body?.items || []);
      } catch (err) {
        setSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    } else {
      setSuggestions([]);
    }
  };

  return (
    <div className="card p-6 shadow-medium">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Hata mesajları */}
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-fade-in">
            <ul className="text-red-600 text-sm space-y-1">
              {errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Lokasyon */}
        <div className="mb-8">
          <label className="block text-2xl font-semibold text-gray-900 mb-4">
            Where do you want to go?
          </label>
          <div className="relative bg-white border border-gray-300 rounded-lg shadow-sm flex items-center">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xl text-gray-400 pointer-events-none z-10"><span role="img" aria-label="location">📍</span></span>
            <input
              type="text"
              value={formData.location}
              onChange={handleLocationChange}
              placeholder="City, hotel or destination"
              className="w-full h-12 pl-10 pr-3 bg-transparent border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 hover:shadow-lg text-base"
            />
            {/* Suggestions dropdown moved below input */}
            <div className="absolute left-0 right-0 top-full mt-2 z-20">
              {isLoadingSuggestions && (
                <div className="bg-white border rounded shadow p-2 text-sm text-gray-500">Loading...</div>
              )}
              {(locationSuggestions.length > 0 || hotelSuggestions.length > 0) && (
                <ul className="bg-white border rounded shadow max-h-60 overflow-y-auto">
                  {locationSuggestions.length > 0 && (
                    <>
                      <li className="px-4 py-2 text-xs text-gray-400 font-semibold bg-gray-50">Locations</li>
                      {locationSuggestions.map((item, idx) => {
                        const displayName = item.city?.name || item.airport?.name || item.name;
                        return (
                          <li
                            key={(item.city?.id || item.airport?.id || item.id || displayName || "") + "-loc-" + idx}
                            className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSuggestionClick(item)}
                          >
                            {displayName}
                          </li>
                        );
                      })}
                    </>
                  )}
                  {hotelSuggestions.length > 0 && (
                    <>
                      <li className="px-4 py-2 text-xs text-gray-400 font-semibold bg-gray-50">Hotels</li>
                      {hotelSuggestions.map((item, idx) => {
                        const displayName = item.hotel?.name;
                        return (
                          <li
                            key={(item.hotel?.id || item.id || displayName || "") + "-hotel-" + idx}
                            className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSuggestionClick(item)}
                          >
                            {displayName}
                          </li>
                        );
                      })}
                    </>
                  )}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Tarih seçimi */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <label className="block text-2xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <span role="img" aria-label="calendar">📅</span> Check-in Date
            </label>
            <DatePicker
              selected={formData.checkIn}
              onChange={date => handleInputChange('checkIn', date)}
              includeDates={checkInDates || undefined}
              minDate={new Date()}
              dateFormat="dd/MM/yyyy"
              className="input-field pl-3 pr-3 transition-all duration-200 focus:ring-2 focus:ring-primary-400 focus:border-primary-400 hover:shadow-lg"
              placeholderText="Select check-in date"
            />
          </div>
          <div className="relative">
            <label className="block text-2xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <span role="img" aria-label="calendar">📅</span> Check-out Date
            </label>
            <DatePicker
              selected={formData.checkOut}
              onChange={(date) => handleInputChange('checkOut', date)}
              minDate={formData.checkIn ? addDays(formData.checkIn, 1) : new Date()}
              className="input-field pl-3 pr-3 transition-all duration-200 focus:ring-2 focus:ring-primary-400 focus:border-primary-400 hover:shadow-lg"
              dateFormat="dd/MM/yyyy"
              placeholderText="Select check-out date"
            />
          </div>
        </div>

        {/* Misafir bilgileri */}
        <div className="space-y-4">
          <label className="block text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
            <span role="img" aria-label="guests" className="text-3xl">🧑‍🤝‍🧑</span> Guests
          </label>
          <div className="border rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg text-red-600 font-semibold">Guests and Rooms</span>
              <span className="text-lg font-bold text-gray-900">{totalGuests} Guest{totalGuests > 1 ? 's' : ''} {rooms.length} Room{rooms.length > 1 ? 's' : ''}</span>
            </div>
            {rooms.map((room, idx) => (
              <div key={idx} className="border-t pt-4 mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold flex items-center gap-1 text-2xl"><span role="img" aria-label="room">🛏️</span> Room {idx + 1}</span>
                  {rooms.length > 1 && (
                    <button type="button" onClick={() => removeRoom(idx)} className="text-red-500 text-xs ml-2">Remove</button>
                  )}
                </div>
                {/* Adult & Children modern kutu */}
                <div className="bg-white rounded-xl shadow-md p-4 flex flex-col gap-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-1 text-2xl font-semibold"><span role="img" aria-label="adult">👨</span> Adult</span>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => updateRoom(idx, 'adults', Math.max(1, room.adults - 1))}
                        className="w-8 h-8 rounded-lg border border-red-400 text-red-600 text-xl font-bold flex items-center justify-center transition-all duration-200 hover:bg-red-100 active:scale-90 shadow-sm"
                      >
                        –
                      </button>
                      <span className="w-8 text-center text-lg font-semibold select-none">{room.adults}</span>
                      <button
                        type="button"
                        onClick={() => updateRoom(idx, 'adults', room.adults + 1)}
                        className={`w-8 h-8 rounded-lg border border-green-400 text-green-600 text-xl font-bold flex items-center justify-center transition-all duration-200 hover:bg-green-100 active:scale-110 shadow-sm ${room.adults >= 9 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={room.adults >= 9}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-2 text-2xl font-semibold">
                      <span role="img" aria-label="children">👶</span>
                      <span className="flex items-end gap-2">
                        <span>Children</span>
                        <span className="text-base text-gray-500 font-normal align-bottom mb-0.5">[0-17]</span>
                      </span>
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => updateRoom(idx, 'children', Math.max(0, room.children - 1))}
                        className="w-8 h-8 rounded-lg border border-red-400 text-red-600 text-xl font-bold flex items-center justify-center transition-all duration-200 hover:bg-red-100 active:scale-90 shadow-sm"
                      >
                        –
                      </button>
                      <span className="w-8 text-center text-lg font-semibold select-none">{room.children}</span>
                      <button
                        type="button"
                        onClick={() => updateRoom(idx, 'children', room.children + 1)}
                        className={`w-8 h-8 rounded-lg border border-green-400 text-green-600 text-xl font-bold flex items-center justify-center transition-all duration-200 hover:bg-green-100 active:scale-110 shadow-sm ${room.children >= 4 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={room.children >= 4}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
                {/* Çocuk yaşları seçimi */}
                {room.children > 0 && (
                  <div className="space-y-2 mt-2">
                    {Array.from({ length: room.children }).map((_, childIdx) => (
                      <div key={childIdx} className="flex items-center justify-between border rounded px-3 py-2">
                        <span className="text-sm">{childIdx + 1}. Child</span>
                        <select
                          className="border-none outline-none text-sm"
                          value={room.childrenAges[childIdx] ?? ''}
                          onChange={e => updateChildAge(idx, childIdx, e.target.value === '' ? null : Number(e.target.value))}
                        >
                          <option value="">Select Age</option>
                          <option value={0}>Under 1</option>
                          {Array.from({ length: 17 }, (_, i) => (
                            <option key={i+1} value={i+1}>{i+1} Years Old</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <button type="button" onClick={addRoom} className="text-green-600 mt-4 flex items-center gap-1 transition-all duration-200 hover:scale-105 hover:bg-green-50 active:scale-95 px-3 py-2 rounded-lg text-2xl font-semibold">
              <span role="img" aria-label="add">➕</span> Add Room
            </button>
          </div>
        </div>

        {/* Para birimi ve ülke */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-2xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <span role="img" aria-label="currency">💵</span> Currency
            </label>
            <Select
              value={currencyOptions.find(option => option.value === formData.currency)}
              onChange={(option) => handleInputChange('currency', option?.value)}
              options={currencyOptions}
              className="react-select-container"
              classNamePrefix="react-select"
              menuPortalTarget={typeof window !== 'undefined' ? window.document.body : undefined}
              styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
            />
          </div>
          <div>
            <label className="block text-2xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <span role="img" aria-label="nationality">🌍</span> Nationality
            </label>
            <Select
              value={countryOptions.find(option => option.value === formData.nationality) || null}
              onChange={(option) => handleInputChange('nationality', option ? option.value : '')}
              options={countryOptions}
              className="react-select-container"
              classNamePrefix="react-select"
              components={{ Option: CountryOption }}
              menuPortalTarget={typeof window !== 'undefined' ? window.document.body : undefined}
              styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
            />
          </div>
        </div>

        {/* Arama butonu */}
        <button
          type="submit"
          className="w-full btn-primary py-4 text-2xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95"
        >
          <Search size={28} className="inline-block" />
          Search Hotels
        </button>
      </form>
    </div>
  );
};

export default SearchForm; 