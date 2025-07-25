import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { setReservationInfo, commitTransaction } from '../api';
// getNationality fonksiyonunu import et
import { getNationality } from '../api';
import Header from '../components/Header';
import { useCurrencyNationality } from '../context/CurrencyNationalityContext';

const BookingPage: React.FC = () => {
  const { currency, setCurrency, currencyList, setCurrencyList, nationality, setNationality, nationalityList, setNationalityList } = useCurrencyNationality();
  const location = useLocation();
  const navigate = useNavigate();
  const { transactionData, hotelData, offerData, selectedNationality } = location.state || {};
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<any[]>([]);
  // Her traveller için touched alanlarını tut
  const [touched, setTouched] = useState<any[]>([]);
  const [isFormValid, setIsFormValid] = useState(false);
  const [travellers, setTravellers] = useState<any[]>([]);
  const [nationalities, setNationalities] = useState<{ id: string; name: string }[]>([]);
  // Expiry Date inputu için otomatik slash ekleme fonksiyonu (hooklar en üstte olmalı)
  const [expiry, setExpiry] = useState("");
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, "");
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length > 2) {
      value = value.slice(0, 2) + "/" + value.slice(2);
    }
    setExpiry(value);
  };

  // Expiry Date validasyonu
  const [expiryError, setExpiryError] = useState("");
  const [expiryTouched, setExpiryTouched] = useState(false);
  const handleExpiryBlur = () => {
    setExpiryTouched(true);
    const [mm, yy] = expiry.split("/");
    let error = "";
    if (!mm || !yy || expiry.length !== 5) {
      error = "Expiry date must be in MM/YY format";
    } else {
      const month = parseInt(mm, 10);
      const year = parseInt(yy, 10);
      if (isNaN(month) || isNaN(year) || month < 1 || month > 12) {
        error = "Month must be between 01 and 12";
      } else if (year < 25) {
        error = "Year must be 25 or greater";
      }
    }
    setExpiryError(error);
  };

  // Card number için otomatik boşluk ve validasyon
  const [cardNumber, setCardNumber] = useState("");
  const [cardNumberError, setCardNumberError] = useState("");
  const [cardNumberTouched, setCardNumberTouched] = useState(false);
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, "");
    if (value.length > 16) value = value.slice(0, 16);
    // Her 4 rakamdan sonra boşluk ekle
    value = value.replace(/(.{4})/g, "$1 ").trim();
    setCardNumber(value);
    setCardNumberError("");
  };
  const handleCardNumberBlur = () => {
    setCardNumberTouched(true);
    const digits = cardNumber.replace(/\s/g, "");
    if (digits.length !== 16) {
      setCardNumberError("Card number must be exactly 16 digits");
    } else {
      setCardNumberError("");
    }
  };

  // CVV için validasyon
  const [cvv, setCvv] = useState("");
  const [cvvError, setCvvError] = useState("");
  const [cvvTouched, setCvvTouched] = useState(false);
  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, "");
    if (value.length > 3) value = value.slice(0, 3);
    setCvv(value);
    setCvvError("");
  };
  const handleCvvBlur = () => {
    setCvvTouched(true);
    if (cvv.length !== 3) {
      setCvvError("CVV must be exactly 3 digits");
    } else {
      setCvvError("");
    }
  };

  const guestCount = location.state?.guestCount || transactionData?.reservationData?.travellers?.length || 1;

  useEffect(() => {
    if (!transactionData || !hotelData || !offerData) {
      setError('Booking data not found. Please try again.');
      return;
    }
    let baseTravellers = transactionData.reservationData?.travellers || [];
    // Eğer traveller sayısı guestCount'tan azsa, eksikleri boş objelerle tamamla
    if (baseTravellers.length < guestCount) {
      const emptyTravellers = Array.from({ length: guestCount - baseTravellers.length }, (_, i) => ({
        name: '',
        surname: '',
        email: '',
        phone: '',
        birthDate: '',
        nationality: '',
        passportNumber: '',
        passportExpiry: '',
        address: '',
        zipCode: '',
        city: '',
        country: '',
        countryId: '',
        isLeader: baseTravellers.length + i === 0,
        availableTitles: baseTravellers[0]?.availableTitles || [],
        title: '',
      }));
      baseTravellers = [...baseTravellers, ...emptyTravellers];
    }
    setTravellers(baseTravellers);
    // Currency list fetch
    fetch('http://localhost:8080/api/currency', {
      method: 'GET',
    })
      .then(res => res.json())
      .then(data => {
        setCurrencyList((data.body?.currencies || []).map((c: any) => ({ code: c.code, name: c.name })));
      });
    // Nationality list fetch
    const token = localStorage.getItem('authToken');
    if (!token) return;
    fetch('http://localhost:8080/api/nationalities', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setNationalities((data.body?.nationalities || []).map((n: any) => ({ id: n.code || n.id, name: n.name })));
        setNationalityList((data.body?.nationalities || []).map((n: any) => ({ id: n.code || n.id, name: n.name })));
        // SearchPage'den gelen nationality varsa, ilk traveller'a ata
        if (selectedNationality && data.body?.nationalities?.length > 0) {
          setTravellers((prev) => prev.map((trav, i) => i === 0 ? { ...trav, nationality: selectedNationality } : trav));
        }
      });
  }, [transactionData, hotelData, offerData, selectedNationality, guestCount, setCurrencyList, setNationalityList]);

  // Context'teki currency veya nationality boşsa localStorage'dan yükle
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

  const validateTravellers = (travellersToCheck = travellers) => {
    const newErrors = travellersToCheck.map((traveller, index) => {
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

  // Nationality input değiştiğinde countryId ve country'yi de güncelle
  const handleTravellerChange = (index: number, field: string, value: string) => {
    const updatedTravellers = [...travellers];
    if (field === 'nationality') {
      // Seçilen nationality'ye göre ülke adı ve id'sini bul
      const nat = nationalities.find(n => n.id === value);
      updatedTravellers[index] = {
        ...updatedTravellers[index],
        nationality: value,
        countryId: value,
        country: nat?.name || ''
      };
    } else {
      updatedTravellers[index] = {
        ...updatedTravellers[index],
        [field]: value
      };
    }
    setTravellers(updatedTravellers);
    validateTravellers(updatedTravellers);
  };

  // Input blur olduğunda touched'ı güncelle
  const handleTravellerBlur = (index: number, field: string) => {
    setTouched(prev => {
      const arr = [...(prev || [])];
      arr[index] = { ...(arr[index] || {}), [field]: true };
      return arr;
    });
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
          address: t.address,
          zipCode: t.zipCode,
          city: { name: t.city },
          country: { id: t.countryId || 'TR', name: t.country || 'Turkey' },
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

  const [saveMessage, setSaveMessage] = useState("");

  // Payment butonuna tıklandığında setReservationInfo ve commitTransaction tetikleyen fonksiyon
  const handlePayAndCompleteBooking = async () => {
    if (!isFormValid) return;
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication token not found');
        setLoading(false);
        return;
      }
      // Traveller objelerini backend modeline uygun hale getir
      const mappedTravellers = travellers.map((t, i) => {
        const nat = nationalities.find(n => n.id === t.nationality) as { id: string; name: string } | undefined;
        let countryCode = '';
        let phoneNumber = '';
        if (t.phone && t.phone.startsWith('+')) {
          const match = t.phone.match(/^\+(\d{1,3})(\d{7,})$/);
          if (match) {
            countryCode = match[1];
            phoneNumber = match[2];
          }
        }
        return {
          travellerId: t.travellerId || (i + 1).toString(),
          type: t.type ?? 1,
          title: Number(t.title) || 1,
          availableTitles: t.availableTitles ?? [
            { id: '1', name: 'Mr' },
            { id: '2', name: 'Ms' },
            { id: '3', name: 'Mrs' },
            { id: '4', name: 'Miss' }
          ],
          availableAcademicTitles: t.availableAcademicTitles ?? [],
          name: t.name?.trim() ?? '',
          surname: t.surname?.trim() ?? '',
          isLeader: t.isLeader ?? (i === 0),
          birthDate: t.birthDate ?? '0001-01-01T00:00:00',
          age: t.age ?? 0,
          nationality: {
            twoLetterCode: t.nationality ?? '',
            threeLetterCode: null,
            numericCode: null,
            isdCode: null,
            name: nat?.name || ''
          },
          identityNumber: t.identityNumber ?? '11111111111',
          passportInfo: {
            serial: '',
            number: t.passportNumber ?? '',
            expireDate: t.passportExpiry ?? '0001-01-01T00:00:00',
            issueDate: t.passportIssueDate ?? '0001-01-01T00:00:00',
            issueCountryCode: '',
            citizenshipCountryCode: t.citizenshipCountryCode ?? ''
          },
          address: {
            phone: t.phone || '+902222222222',
            contactPhone: {
              countryCode: countryCode || '90',
              phoneNumber: phoneNumber || '2222222222'
            },
            email: t.email || 'customer@customer.com',
            address: typeof t.address === 'string' && t.address.trim() ? t.address : 'Test Address',
            zipCode: t.zipCode || '07000',
            city: { id: t.cityId || '34', name: t.city || 'Istanbul' },
            country: { id: t.countryId || t.nationality || '', name: t.country || nat?.name || '' }
          },
          destinationAddress: {},
          services: t.services ?? [],
          orderNumber: t.orderNumber ?? (i + 1),
          birthDateFrom: t.birthDateFrom ?? '',
          birthDateTo: t.birthDateTo ?? '',
          requiredFields: [
            'travellerId',
            'type',
            'title',
            'name',
            'surname',
            'isleader',
            'leaderEmail',
            'nationality'
          ],
          documents: [],
          passengerType: t.passengerType ?? 1,
          additionalFields: t.additionalFields ?? {},
          insertFields: [],
          status: t.status ?? 0,
          gender: t.gender ?? 1 // default erkek
        };
      });
      // CustomerInfo'yu örnek request ile uyumlu hale getir
      const customerInfo = {
        isCompany: false,
        passportInfo: {},
        address: {
          city: { id: travellers[0]?.cityId || '34', name: travellers[0]?.city || 'Istanbul' },
          country: { id: travellers[0]?.countryId || travellers[0]?.nationality || '', name: travellers[0]?.country || (nationalities.find(n => n.id === travellers[0]?.nationality)?.name || '') },
          email: travellers[0]?.email || 'customer@customer.com',
          phone: travellers[0]?.phone || '+902222222222',
          address: typeof travellers[0]?.address === 'string' && travellers[0]?.address.trim() ? travellers[0]?.address : 'Test Address',
          zipCode: travellers[0]?.zipCode || '07000'
        },
        taxInfo: {},
        title: Number(travellers[0]?.title) || 1,
        name: travellers[0]?.name || 'Customer name',
        surname: travellers[0]?.surname || 'Customer surname',
        birthDate: travellers[0]?.birthDate || '1996-01-01',
        identityNumber: travellers[0]?.identityNumber || '11111111111'
      };
      const data = {
        transactionId: transactionData.transactionId,
        travellers: mappedTravellers,
        customerInfo,
        reservationNote: 'Reservation note',
        agencyReservationNumber: 'Agency reservation number text'
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

  // location.state'den currency/nationality al
  // const { currency, currencyList, nationality, nationalityList } = useCurrencyNationality();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f6faff 0%, #eaf1fb 100%)',
      fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
      padding: 0,
    }}>
      {/* HEADER ekle */}
      <Header
        currency={currency}
        currencyList={currencyList}
        nationality={nationality}
        nationalityList={nationalityList}
        showSelectors={true}
        editableSelectors={false}
      />
        <div style={{
          maxWidth: 1400,
          margin: '0 auto',
        padding: '32px 8px',
        display: 'grid',
        gridTemplateColumns: '1fr 370px',
        gap: 32,
        alignItems: 'flex-start',
      }}>
        {/* SOL PANEL */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {/* Back Link */}
          <div style={{ marginBottom: 2 }}>
            <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 600, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: 0 }}>
              ← Back to Hotel Details
            </button>
          </div>
          {/* Complete Your Booking */}
          <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 6px 32px #0002', padding: 44, marginBottom: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 28, marginBottom: 28, color: '#18181b', letterSpacing: -1 }}>Complete Your Booking</div>
            <div style={{ background: '#f6faff', borderRadius: 20, padding: 28, display: 'flex', alignItems: 'center', gap: 32, boxShadow: '0 2px 12px #2563eb11', minHeight: 160 }}>
              <img src={hotelData?.seasons?.[0]?.mediaFiles?.[0]?.urlFull || hotelData?.thumbnailFull || process.env.PUBLIC_URL + '/fernando-alvarez-rodriguez-M7GddPqJowg-unsplash.jpg'} alt={hotelData?.name} style={{ width: 140, height: 140, borderRadius: 16, objectFit: 'cover', boxShadow: '0 2px 8px #0001' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 22, color: '#1e3a8a', marginBottom: 4 }}>{hotelData?.name}</div>
                <div style={{ color: '#64748b', fontSize: 17 }}>{hotelData?.address?.addressLines?.join(', ') || hotelData?.city?.name || 'Unknown location'}</div>
                <div style={{ color: '#64748b', fontSize: 15, marginTop: 2 }}>{hotelData?.country?.name}</div>
                <div style={{ color: '#475569', fontSize: 15, marginTop: 8 }}>
                  {offerData?.checkIn ? new Date(offerData?.checkIn).toLocaleDateString() : ''} - {offerData?.checkOut ? new Date(offerData?.checkOut).toLocaleDateString() : ''} | {offerData?.rooms?.[0]?.roomName || 'Room'}
        </div>
                <div style={{ marginTop: 12, fontSize: 15, color: '#22c55e', fontWeight: 700, background: '#e7fbe9', borderRadius: 8, display: 'inline-block', padding: '4px 16px' }}>Good only</div>
              </div>
              <div style={{ minWidth: 160, textAlign: 'right' }}>
                <div style={{ fontWeight: 900, fontSize: 40, color: '#18181b', letterSpacing: -2 }}>
                {offerData?.price?.currency} {offerData?.price?.amount}
                </div>
                <div style={{ color: '#64748b', fontSize: 16, fontWeight: 600 }}>
                  {offerData?.checkIn && offerData?.checkOut ? `${Math.ceil((new Date(offerData?.checkOut).getTime() - new Date(offerData?.checkIn).getTime()) / (1000 * 60 * 60 * 24))} night${Math.ceil((new Date(offerData?.checkOut).getTime() - new Date(offerData?.checkIn).getTime()) / (1000 * 60 * 60 * 24)) > 1 ? 's' : ''}` : ''}
                </div>
                <div style={{ fontWeight: 500, fontSize: 14, color: '#64748b' }}>night tax incl.</div>
              </div>
            </div>
          </div>
          {/* Traveller Information */}
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px #0001', padding: 28 }}>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 10, color: '#6d28d9', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 22 }}>🧑‍💼</span> Traveller Information
            </div>
            <form style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              {travellers.map((traveller, index) => {
                const selectedNat = nationalities.find(n => n.id === traveller.nationality);
                return (
                  <div key={index} style={{ background: '#f6faff', borderRadius: 12, boxShadow: '0 1px 6px #2563eb11', padding: 22, marginBottom: 0, border: '1.5px solid #e0e7ff' }}>
                    <div style={{ fontWeight: 700, fontSize: 16, color: '#2563eb', marginBottom: 14 }}>
                      Traveller {index + 1}{traveller.isLeader ? ' (Leader)' : ''}
        </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <label style={{ fontWeight: 600, fontSize: 14 }}>Title *</label>
                        <select value={traveller.title || ''} onChange={e => handleTravellerChange(index, 'title', e.target.value)} onBlur={() => handleTravellerBlur(index, 'title')} style={{ padding: 10, borderRadius: 8, border: '1px solid #cbd5e1' }}>
                          <option value="">Select title</option>
                    {traveller.availableTitles?.map((title: any) => (
                      <option key={title.id} value={title.id}>{title.name}</option>
                    ))}
                  </select>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <label style={{ fontWeight: 600, fontSize: 14 }}>First Name *</label>
                        <input type="text" value={traveller.name || ''} onChange={e => handleTravellerChange(index, 'name', e.target.value)} onBlur={() => handleTravellerBlur(index, 'name')} style={{ padding: 10, borderRadius: 8, border: '1px solid #cbd5e1' }} placeholder="Enter your first name" />
                        {errors[index]?.name && touched[index]?.name && (<span style={{ color: '#ef4444', fontSize: 12 }}>{errors[index].name}</span>)}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <label style={{ fontWeight: 600, fontSize: 14 }}>Last Name *</label>
                        <input type="text" value={traveller.surname || ''} onChange={e => handleTravellerChange(index, 'surname', e.target.value)} onBlur={() => handleTravellerBlur(index, 'surname')} style={{ padding: 10, borderRadius: 8, border: '1px solid #cbd5e1' }} placeholder="Enter your last name" />
                        {errors[index]?.surname && touched[index]?.surname && (<span style={{ color: '#ef4444', fontSize: 12 }}>{errors[index].surname}</span>)}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <label style={{ fontWeight: 600, fontSize: 14 }}>Email *</label>
                        <input type="email" value={traveller.email || ''} onChange={e => handleTravellerChange(index, 'email', e.target.value)} onBlur={() => handleTravellerBlur(index, 'email')} style={{ padding: 10, borderRadius: 8, border: '1px solid #cbd5e1' }} placeholder="your@email.com" />
                        {errors[index]?.email && touched[index]?.email && (<span style={{ color: '#ef4444', fontSize: 12 }}>{errors[index].email}</span>)}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <label style={{ fontWeight: 600, fontSize: 14 }}>Phone *</label>
                        <input type="text" value={traveller.phone || ''} onChange={e => handleTravellerChange(index, 'phone', e.target.value)} onBlur={() => handleTravellerBlur(index, 'phone')} style={{ padding: 10, borderRadius: 8, border: '1px solid #cbd5e1' }} placeholder="+90 (555) 123 4567" />
                        {errors[index]?.phone && touched[index]?.phone && (<span style={{ color: '#ef4444', fontSize: 12 }}>{errors[index].phone}</span>)}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <label style={{ fontWeight: 600, fontSize: 14 }}>Birth Date *</label>
                        <input type="date" value={traveller.birthDate || ''} onChange={e => handleTravellerChange(index, 'birthDate', e.target.value)} onBlur={() => handleTravellerBlur(index, 'birthDate')} style={{ padding: 10, borderRadius: 8, border: '1px solid #cbd5e1' }} />
                        {errors[index]?.birthDate && touched[index]?.birthDate && (<span style={{ color: '#ef4444', fontSize: 12 }}>{errors[index].birthDate}</span>)}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <label style={{ fontWeight: 600, fontSize: 14 }}>Nationality *</label>
                        <input
                          list={`nationality-list-${index}`}
                          value={typeof traveller.nationality === 'string' ? traveller.nationality : (traveller.nationality?.twoLetterCode || '')}
                          onChange={e => handleTravellerChange(index, 'nationality', e.target.value.toUpperCase())}
                          onBlur={() => handleTravellerBlur(index, 'nationality')}
                          style={{ padding: 10, borderRadius: 8, border: '1px solid #cbd5e1', textTransform: 'uppercase' }}
                          placeholder="Select nationality code"
                          autoComplete="off"
                        />
                        <datalist id={`nationality-list-${index}`}>
                          {nationalities.map((nat) => (
                            <option key={nat.id} value={nat.id}>{nat.name}</option>
                          ))}
                        </datalist>
                        {errors[index]?.nationality && touched[index]?.nationality && (<span style={{ color: '#ef4444', fontSize: 12 }}>{errors[index].nationality}</span>)}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <label style={{ fontWeight: 600, fontSize: 14 }}>Passport Number</label>
                        <input type="text" value={traveller.passportNumber || ''} onChange={e => handleTravellerChange(index, 'passportNumber', e.target.value)} onBlur={() => handleTravellerBlur(index, 'passportNumber')} style={{ padding: 10, borderRadius: 8, border: '1px solid #cbd5e1' }} placeholder="Passport number" />
                        {errors[index]?.passportNumber && touched[index]?.passportNumber && (<span style={{ color: '#ef4444', fontSize: 12 }}>{errors[index].passportNumber}</span>)}
                  </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <label style={{ fontWeight: 600, fontSize: 14 }}>Passport Expiry Date</label>
                        <input type="date" value={traveller.passportExpiry || ''} onChange={e => handleTravellerChange(index, 'passportExpiry', e.target.value)} onBlur={() => handleTravellerBlur(index, 'passportExpiry')} style={{ padding: 10, borderRadius: 8, border: '1px solid #cbd5e1' }} />
                        {errors[index]?.passportExpiry && touched[index]?.passportExpiry && (<span style={{ color: '#ef4444', fontSize: 12 }}>{errors[index].passportExpiry}</span>)}
                </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <label style={{ fontWeight: 600, fontSize: 14 }}>Zip Code</label>
                  <input
                    type="text"
                          value={traveller.zipCode || ''}
                          onChange={e => handleTravellerChange(index, 'zipCode', e.target.value)}
                          onBlur={() => handleTravellerBlur(index, 'zipCode')}
                          style={{ padding: 10, borderRadius: 8, border: '1px solid #cbd5e1' }}
                          placeholder="Zip code"
                        />
                        {errors[index]?.zipCode && touched[index]?.zipCode && (<span style={{ color: '#ef4444', fontSize: 12 }}>{errors[index].zipCode}</span>)}
                  </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <label style={{ fontWeight: 600, fontSize: 14 }}>Country Name *</label>
                  <input
                    type="text"
                          value={selectedNat?.name || (typeof traveller.nationality === 'string' ? traveller.nationality : traveller.nationality?.twoLetterCode || '')}
                          readOnly
                          style={{ padding: 10, borderRadius: 8, border: '1px solid #cbd5e1', background: '#f3f4f6' }}
                          placeholder="Country name"
                        />
                  </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <label style={{ fontWeight: 600, fontSize: 14 }}>Country ID *</label>
                    <input
                          type="text"
                          value={typeof traveller.nationality === 'string' ? traveller.nationality : (traveller.nationality?.twoLetterCode || '')}
                          readOnly
                          style={{ padding: 10, borderRadius: 8, border: '1px solid #cbd5e1', background: '#f3f4f6' }}
                          placeholder="e.g. TR, US, GB, etc."
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
              <button type="button" disabled={loading || !isFormValid} style={{
                background: 'linear-gradient(90deg, #2563eb 0%, #1e3a8a 100%)',
                color: 'white', fontWeight: 900, fontSize: 18, padding: '14px 0', border: 'none', borderRadius: 10, cursor: loading || !isFormValid ? 'not-allowed' : 'pointer', marginTop: 10
              }}
                onClick={() => {
                  validateTravellers(travellers);
                  setSaveMessage('Bilgileriniz kaydedildi');
                  setTimeout(() => setSaveMessage(''), 2500);
                }}
              >
                {loading ? 'Processing...' : 'Save'}
              </button>
              {saveMessage && (
                <div style={{ color: '#22c55e', fontWeight: 700, fontSize: 16, marginTop: 8 }}>{saveMessage}</div>
              )}
            </form>
                    </div>
                  </div>
        {/* SAĞ PANEL */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {/* Booking Summary */}
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px #0001', padding: 28, marginBottom: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 10, color: '#222' }}>Booking Summary</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
              <span>Hotel Rate</span>
              <span>{offerData?.price?.currency} {offerData?.price?.amount}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, color: '#64748b', marginBottom: 6 }}>
              <span>Night Tax</span>
              <span>Included</span>
            </div>
            <div style={{ color: '#22c55e', fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Promotion Applied<br />CHILDFREE</div>
            <div style={{ fontWeight: 700, fontSize: 18, color: '#2563eb', marginBottom: 8 }}>Total Amount<br /><span style={{ fontSize: 22 }}>{offerData?.price?.currency} {offerData?.price?.amount}</span></div>
            <div style={{ background: '#e0f2fe', color: '#2563eb', borderRadius: 8, padding: 10, fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Great deal! This rate includes all taxes and fees.</div>
          </div>
          {/* Payment Alanı */}
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px #0001', padding: 28, marginTop: 18, maxWidth: 480, width: '100%' }}>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 16, color: '#222' }}>Payment</div>
            <form style={{ display: 'flex', flexDirection: 'column', gap: 16 }} autoComplete="on">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label htmlFor="cardholder" style={{ fontWeight: 600, fontSize: 14 }}>Cardholder Name</label>
                <input id="cardholder" name="cardholder" type="text" autoComplete="cc-name" placeholder="Name on card" style={{ padding: 10, borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 16 }} required />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label htmlFor="cardnumber" style={{ fontWeight: 600, fontSize: 14 }}>Card Number</label>
                <input
                  id="cardnumber"
                  name="cardnumber"
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  maxLength={19}
                  placeholder="1234 5678 9012 3456"
                  style={{ padding: 10, borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 16, letterSpacing: 2 }}
                  required
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  onBlur={handleCardNumberBlur}
                />
                {cardNumberTouched && cardNumberError && (
                  <span style={{ color: '#ef4444', fontSize: 12 }}>{cardNumberError}</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 2, minWidth: 160, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label htmlFor="expiry" style={{ fontWeight: 600, fontSize: 14 }}>Expiry Date</label>
                  <input
                    id="expiry"
                    name="expiry"
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    maxLength={5}
                    placeholder="MM/YY"
                    style={{ padding: 10, borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 16 }}
                    required
                    value={expiry}
                    onChange={handleExpiryChange}
                    onBlur={handleExpiryBlur}
                  />
                  {expiryTouched && expiryError && (
                    <span style={{ color: '#ef4444', fontSize: 12 }}>{expiryError}</span>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 100, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label htmlFor="cvv" style={{ fontWeight: 600, fontSize: 14 }}>CVV</label>
                  <input
                    id="cvv"
                    name="cvv"
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    maxLength={3}
                    placeholder="123"
                    style={{ padding: 10, borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 16 }}
                    required
                    value={cvv}
                    onChange={handleCvvChange}
                    onBlur={handleCvvBlur}
                  />
                  {cvvTouched && cvvError && (
                    <span style={{ color: '#ef4444', fontSize: 12 }}>{cvvError}</span>
                  )}
                </div>
                  </div>
              <button
                type="button"
                style={{ background: '#22c55e', color: 'white', fontWeight: 800, fontSize: 18, padding: '12px 0', border: 'none', borderRadius: 8, marginTop: 12, cursor: (!isFormValid || loading) ? 'not-allowed' : 'pointer', width: '100%' }}
                disabled={!isFormValid || loading}
                onClick={handlePayAndCompleteBooking}
              >
                {loading ? 'Processing...' : 'Pay and Complete Booking'}
              </button>
            </form>
                </div>
          {/* Why book with us? */}
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px #0001', padding: 24, fontSize: 15, color: '#222' }}>
            <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 10 }}>Why book with us?</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#334155', fontSize: 15 }}>
              <li style={{ marginBottom: 8 }}>🟢 Free cancellation</li>
              <li style={{ marginBottom: 8 }}>🔒 Secure payment</li>
              <li>🏆 Best price guarantee</li>
            </ul>
                  </div>
                </div>
              </div>
      {/* FOOTER ekle */}
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
    </div>
  );
};

export default BookingPage; 