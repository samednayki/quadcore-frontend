import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { FaHome, FaSearch, FaBookmark } from 'react-icons/fa';
import { FaSnowflake, FaUtensils, FaCar, FaGlassCheers, FaConciergeBell, FaExchangeAlt, FaHotel, FaLock, FaCouch, FaMapMarkerAlt, FaClock, FaCheckCircle, FaWifi, FaSwimmingPool, FaUmbrellaBeach, FaRegDotCircle } from 'react-icons/fa';
import { getOffers, beginTransaction } from '../api';
import Header from '../components/Header';
import { useCurrencyNationality } from '../context/CurrencyNationalityContext';

const starSvg = (fill: string) => (
  <svg width="22" height="22" viewBox="0 0 24 24" style={{ verticalAlign: 'middle', display: 'block' }}>
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill={fill} />
  </svg>
);

const HeartIcon = ({ filled, animate }: { filled: boolean, animate: boolean }) => (
  <svg
    width="32" height="32" viewBox="0 0 24 24"
    style={{
      display: 'block',
      transition: 'transform 0.25s cubic-bezier(.68,-0.55,.27,1.55)',
      transform: animate ? 'scale(1.25)' : 'scale(1)',
      filter: filled ? 'drop-shadow(0 2px 8px #f43f5e88)' : undefined
    }}
    fill={filled ? '#f43f5e' : 'none'} stroke="#f43f5e" strokeWidth="2"
  >
    <path d="M12 21C12 21 4 13.36 4 8.5C4 5.42 6.42 3 9.5 3C11.24 3 12.91 3.81 14 5.08C15.09 3.81 16.76 3 18.5 3C21.58 3 24 5.42 24 8.5C24 13.36 16 21 16 21H12Z" strokeLinejoin="round"/>
  </svg>
);

// Add helper for explanation rendering
const renderExplanation = (explanation: any) => {
  if (!explanation) return null;
  if (typeof explanation === 'string') return <span>{explanation}</span>;
  if (typeof explanation === 'object') {
    const { text, textType } = explanation;
    let icon = '', title = '', color = '';
    switch (textType) {
      case 'location':
        icon = '📍'; title = 'Konum Açıklaması'; color = '#2563eb'; break;
      case 'facility':
        icon = '🛎️'; title = 'Olanak Açıklaması'; color = '#16a34a'; break;
      case 'season':
        icon = '☀️'; title = 'Sezon Açıklaması'; color = '#f59e42'; break;
      case 'warning':
        icon = '⚠️'; title = 'Uyarı'; color = '#f43f5e'; break;
      case 'info':
        icon = 'ℹ️'; title = 'Bilgi'; color = '#38bdf8'; break;
      default:
        icon = '📝'; title = ''; color = '#334155'; break;
    }
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        {title && <span style={{ fontWeight: 700 }}>{title}:</span>}
        <span>{text}</span>
      </div>
    );
  }
  return null;
};

const HotelDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const searchId = params.get('searchId') || '';
  const offerId = params.get('offerId') || '';
  const location = useLocation();
  const { currency, currencyList, nationality, nationalityList } = useCurrencyNationality();
  const productType = Number(params.get('productType')) || 2;
  const productId = params.get('productId') || id || '';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hotel, setHotel] = useState<any>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  // Favorite state
  const [isFavorite, setIsFavorite] = useState(false);
  const [heartAnimate, setHeartAnimate] = useState(false);
  
  // Offer Details Modal State
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerDetail, setOfferDetail] = useState<any>(null);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);

  const galleryRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  // Drag-to-scroll logic for gallery
  useEffect(() => {
    const gallery = galleryRef.current;
    if (!gallery) return;
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    const onMouseDown = (e: MouseEvent) => {
      isDown = true;
      gallery.classList.add('dragging');
      startX = e.pageX - gallery.offsetLeft;
      scrollLeft = gallery.scrollLeft;
    };
    const onMouseLeave = () => {
      isDown = false;
      gallery.classList.remove('dragging');
    };
    const onMouseUp = () => {
      isDown = false;
      gallery.classList.remove('dragging');
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - gallery.offsetLeft;
      const walk = (x - startX) * 1.2; // scroll speed
      gallery.scrollLeft = scrollLeft - walk;
    };
    gallery.addEventListener('mousedown', onMouseDown);
    gallery.addEventListener('mouseleave', onMouseLeave);
    gallery.addEventListener('mouseup', onMouseUp);
    gallery.addEventListener('mousemove', onMouseMove);
    return () => {
      gallery.removeEventListener('mousedown', onMouseDown);
      gallery.removeEventListener('mouseleave', onMouseLeave);
      gallery.removeEventListener('mouseup', onMouseUp);
      gallery.removeEventListener('mousemove', onMouseMove);
    };
  }, []);
  // Helper for Google Maps link
  const getMapLink = (lat: string, lng: string) =>
    `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  // Lightbox helpers
  const images = hotel?.seasons?.[0]?.mediaFiles?.length > 0
    ? hotel.seasons[0].mediaFiles.map((m: any) => m.urlFull)
    : hotel?.thumbnailFull ? [hotel.thumbnailFull] : [];
  // Arrow visibility logic
  useEffect(() => {
    const gallery = galleryRef.current;
    if (!gallery) return;
    const checkScroll = () => {
      setCanScrollLeft(gallery.scrollLeft > 0);
      setCanScrollRight(gallery.scrollLeft + gallery.offsetWidth < gallery.scrollWidth - 2);
    };
    checkScroll();
    gallery.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);
    return () => {
      gallery.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [images.length]);
  const scrollGallery = (dir: 'left' | 'right') => {
    const gallery = galleryRef.current;
    if (!gallery) return;
    const scrollAmount = 320;
    gallery.scrollBy({ left: dir === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchHotelDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setError('Authentication token not found');
          setLoading(false);
          return;
        }
        // Set ownerProvider statically to '2'
        const ownerProvider = '2';
        const response = await fetch('http://localhost:8080/api/productinfo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            productType: 2,
            ownerProvider: ownerProvider,
            product: id,
            culture: 'en-US'
          })
        });
        if (!response.ok) {
          setError('Failed to fetch hotel details');
          setLoading(false);
          return;
        }
        const data = await response.json();
        setHotel(data.body?.hotel || null);
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchHotelDetails();
  }, [id]);

  // Sticky info bar logic
  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;
      const heroBottom = heroRef.current.getBoundingClientRect().bottom;
      setShowStickyBar(heroBottom < 60); // 60px header height
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Helper for stars
  const renderStars = (stars: number) => {
    const fullStars = Math.floor(stars);
    const hasHalfStar = stars % 1 >= 0.5;
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
        {Array.from({ length: 5 }, (_, i) => {
          if (i < fullStars) return <span key={i}>{starSvg('#fbbf24')}</span>;
          if (i === fullStars && hasHalfStar) {
            return (
              <span key={i}>
                <svg width="22" height="22" viewBox="0 0 24 24" style={{ verticalAlign: 'middle', display: 'block' }}>
                  <defs>
                    <linearGradient id={`half-star-${id}-${i}`} x1="0" y1="0" x2="1" y2="0">
                      <stop offset="50%" stopColor="#fbbf24"/>
                      <stop offset="50%" stopColor="#d1d5db"/>
                    </linearGradient>
                  </defs>
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill={`url(#half-star-${id}-${i})`} />
                </svg>
              </span>
            );
          }
          return <span key={i}>{starSvg('#d1d5db')}</span>;
        })}
      </span>
    );
  };

  // Lightbox helpers
  const openLightbox = (idx: number) => {
    setLightboxIndex(idx);
    setLightboxOpen(true);
  };
  const closeLightbox = () => setLightboxOpen(false);
  const nextImage = () => setLightboxIndex((i) => (i + 1) % images.length);
  const prevImage = () => setLightboxIndex((i) => (i - 1 + images.length) % images.length);
  // Heart animation handler
  const handleFavorite = () => {
    setIsFavorite((f) => !f);
    setHeartAnimate(true);
    setTimeout(() => setHeartAnimate(false), 350);
  };

  // Offer Details Modal functions
  const showOfferDetailsModal = async (offer: any) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('Authentication required');
        return;
      }
      const { getOfferDetails } = await import('../api');
      const response = await getOfferDetails({
        token,
        offerIds: [offer.offerId],
        currency: offer.price.currency,
        getProductInfo: false
      });
      if (response.body && response.body.offerDetails && response.body.offerDetails.length > 0) {
        const offerDetail = response.body.offerDetails[0];
        setOfferDetail(offerDetail);
        setSelectedOffer(offer);
        setShowOfferModal(true);
      } else {
        alert('No offer details found');
      }
    } catch (error) {
      alert('Failed to fetch offer details');
    }
  };

  // Book This Offer handler (her offer için ayrı loading)
  
  const handleBookThisOffer = async (offer: any) => {
    const offerId = offer.offerId || offer.id || offer.offer_id;
    if (!offerId) return;
    setTransactionLoading(prev => ({ ...prev, [offerId]: true }));
    setTransactionError(prev => ({ ...prev, [offerId]: null }));
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setTransactionError(prev => ({ ...prev, [offerId]: 'Authentication token not found' }));
        setTransactionLoading(prev => ({ ...prev, [offerId]: false }));
        return;
      }
      const response = await beginTransaction({
        token,
        offerIds: [offerId],
        currency: offer.price?.currency || 'EUR',
        culture: 'en-US'
      });
      if (response.body) {
        setShowOfferModal(false);
        navigate('/booking', {
          state: {
            transactionData: response.body,
            hotelData: hotel,
            offerData: offer
          }
        });
      } else {
        setTransactionError(prev => ({ ...prev, [offerId]: 'Transaction başlatılamadı' }));
      }
    } catch (err) {
      setTransactionError(prev => ({ ...prev, [offerId]: 'Transaction başlatılamadı' }));
    } finally {
      setTransactionLoading(prev => ({ ...prev, [offerId]: false }));
    }
  };

  const closeOfferDetailsModal = () => {
    setShowOfferModal(false);
    setOfferDetail(null);
    setSelectedOffer(null);
  };
  // Lightbox ESC close
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxOpen, images.length]);

  // Offer Modal ESC close and body scroll prevention
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showOfferModal) {
        closeOfferDetailsModal();
      }
    };
    
    if (showOfferModal) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', onKey);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = 'unset';
    };
  }, [showOfferModal]);

  const logoUrl = process.env.PUBLIC_URL + '/WhatsApp Image 2025-07-08 at 09.35.08_7abde45a.jpg';

  // Facility icon matcher
  const facilityIcon = (name: string, style: any = {}) => {
    const n = name.toLowerCase();
    if (n.includes('air')) return FaSnowflake({ style });
    if (n.includes('restaurant')) return FaUtensils({ style });
    if (n.includes('car park') || n.includes('parking')) return FaCar({ style });
    if (n.includes('bar')) return FaGlassCheers({ style });
    if (n.includes('lobby')) return FaCouch({ style });
    if (n.includes('reception')) return FaConciergeBell({ style });
    if (n.includes('currency')) return FaExchangeAlt({ style });
    if (n.includes('hotel safe') || n.includes('safe')) return FaLock({ style });
    if (n.includes('lift') || n.includes('elevator')) return FaRegDotCircle({ style });
    if (n.includes('pool')) return FaSwimmingPool({ style });
    if (n.includes('beach')) return FaUmbrellaBeach({ style });
    if (n.includes('wifi') || n.includes('internet')) return FaWifi({ style });
    if (n.includes('check-in')) return FaCheckCircle({ style });
    if (n.includes('map') || n.includes('location')) return FaMapMarkerAlt({ style });
    if (n.includes('24-hour')) return FaClock({ style });
    return FaRegDotCircle({ style });
  };

  const [offersLoading, setOffersLoading] = useState(false);
  const [offersError, setOffersError] = useState<string | null>(null);
  const [offersData, setOffersData] = useState<any>(null);
  
  // BeginTransaction state

  // Offers API call
  const fetchOffers = async (): Promise<any> => {
    if (!searchId || !offerId) {
      setOffersError('searchId or offerId missing in URL.');
      return null;
    }
    setOffersLoading(true);
    setOffersError(null);
    setOffersData(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setOffersError('Authentication token not found');
        setOffersLoading(false);
        return null;
      }
      if (!id) {
        setOffersError('Hotel ID (productId) is missing.');
        setOffersLoading(false);
        return null;
      }
      const data = await getOffers({
        token,
        searchId,
        offerId,
        productType,
        productId,
        currency,
        culture: 'tr-TR',
        getRoomInfo: true
      });
      setOffersData(data.body);
      return data.body;
    } catch (err) {
      setOffersError('Teklif detayları alınamadı.');
      return null;
    } finally {
      setOffersLoading(false);
    }
  };

  // Her offer için ayrı loading ve error state, ayrıca offers olmayan oteller için de kullanılacak
  const [transactionLoading, setTransactionLoading] = useState<{ [offerId: string]: boolean }>({});
  const [transactionError, setTransactionError] = useState<{ [offerId: string]: string | null }>({});
  const [noOfferLoading, setNoOfferLoading] = useState(false);
  const [noOfferError, setNoOfferError] = useState<string | null>(null);

  // Book Now handler for hotels with no offers
  const navigate = useNavigate();
  const handleBookNowNoOffers = async () => {
    setNoOfferLoading(true);
    setNoOfferError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setNoOfferError('Authentication token not found');
        setNoOfferLoading(false);
        return;
      }
      // PriceSearch sonucundaki offerId'yi bul
      let offerId = null;
      if (offersData && Array.isArray(offersData.roomInfos) && offersData.roomInfos.length > 0) {
        // roomInfos içindeki ilk offerId'yi kullan
        offerId = offersData.roomInfos[0]?.offerId || offersData.roomInfos[0]?.id;
      }
      // Eğer offersData yoksa veya offerId bulunamazsa fallback
      if (!offerId) {
        setNoOfferError('No offerId found for this hotel.');
        setNoOfferLoading(false);
        return;
      }
      const response = await beginTransaction({
        token,
        offerIds: [offerId],
        currency: 'EUR',
        culture: 'en-US'
      });
      if (response.body) {
        navigate('/booking', {
          state: {
            transactionData: response.body,
            hotelData: hotel,
            offerData: { offerId }
          }
        });
      } else {
        setNoOfferError('Transaction başlatılamadı');
      }
    } catch (err) {
      setNoOfferError('Transaction başlatılamadı');
    } finally {
      setNoOfferLoading(false);
    }
  };

  const [mainOfferId, setMainOfferId] = useState<string | null>(null);
  // Sayfa açılırken ana offerId'yi çek
  useEffect(() => {
    const fetchMainOfferId = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        if (!searchId || !offerId || !id) return;
        const data = await getOffers({
          token,
          searchId,
          offerId,
          productType,
          productId,
          currency,
          culture: 'tr-TR',
          getRoomInfo: true
        });
        const offersBody = data.body;
        let offerIdResult = offersBody && Array.isArray(offersBody.roomInfos) && offersBody.roomInfos.length > 0
          ? offersBody.roomInfos[0]?.offerId || offersBody.roomInfos[0]?.id
          : (offersBody && Array.isArray(offersBody.offers) && offersBody.offers.length > 0
            ? offersBody.offers[0]?.offerId || offersBody.offers[0]?.id
            : null);
        setMainOfferId(offerIdResult);
      } catch (err) {
        setMainOfferId(null);
      }
    };
    fetchMainOfferId();
  }, [searchId, offerId, id, productType, productId, currency]);

  // useEffect ile offersData'yı sayfa açılır açılmaz otomatik çek
  React.useEffect(() => {
    if (!offersData && id && searchId && offerId && productId) {
      fetchOffers();
    }
    // eslint-disable-next-line
  }, [id, searchId, offerId, productId]);

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
            onClick={() => window.location.reload()}
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
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      {/* HEADER (same as HotelList/SearchPage) */}
      <Header
        currency={currency}
        currencyList={currencyList}
        nationality={nationality}
        nationalityList={nationalityList}
        showSelectors={false}
      />
      {/* Galeri grid - Düsseldorf tarzı */}
      <div style={{
        width: '100vw',
        background: '#fff',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'stretch',
        gap: 12,
        padding: 0,
        position: 'relative',
        overflow: 'hidden',
        margin: 0,
        minHeight: 540,
        height: 540,
        borderBottomLeftRadius: 22,
        borderBottomRightRadius: 22,
        boxShadow: '0 4px 24px #1e3a8a11',
        marginTop: 32, // üstten boşluk eklendi
      }}>
        {/* Sol büyük görsel */}
        <div style={{ flex: '0 0 50%', height: '100%', position: 'relative' }}>
          {images.length > 0 ? (
            <img
              src={images[0]}
              alt={hotel?.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', background: '#e0e7ef', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontWeight: 700, fontSize: 18 }}>No Image</div>
          )}
        </div>
        {/* Sağda 4 küçük fotoğraf (2x2 grid) */}
        <div style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr 1fr',
          gap: 12,
          height: '100%',
        }}>
          {images.slice(1, 5).map((img: any, idx: number) => {
            const isLast = idx === 3;
            const showSeeMore = isLast && images.length > 5;
            return (
              <div key={img} style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', cursor: showSeeMore ? 'pointer' : 'default' }}
                onClick={showSeeMore ? () => openLightbox(4) : undefined}
                tabIndex={showSeeMore ? 0 : undefined}
                aria-label={showSeeMore ? `See all photos` : undefined}
              >
                <img src={img} alt={hotel?.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                {showSeeMore && (
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    bottom: 0,
                    left: 0,
                    top: 0,
                    background: 'rgba(0,0,0,0.38)',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'background 0.18s',
                  }}>
                    See +{images.length - 4} photos
                  </div>
            )}
          </div>
            );
          })}
          {/* Eğer 4'ten az küçük görsel varsa boş kutu ekle */}
          {Array.from({ length: Math.max(0, 4 - (images.length - 1)) }).map((_, i) => (
            <div key={i} style={{ background: '#e0e7ef', width: '100%', height: '100%' }} />
          ))}
        </div>
      </div>
      {/* Otel ismi, yıldız ve adres - galeri gridinin hemen altında, ortalanmış ve az boşluklu */}
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '64px 0 0 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 8,
        paddingLeft: 40,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <h1 style={{ fontSize: 38, fontWeight: 900, margin: 0, color: '#181818', letterSpacing: -1, textAlign: 'left' }}>{hotel?.name || 'Hotel Name'}</h1>
            {hotel?.stars && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 28, marginLeft: 0 }}>
                {Array.from({ length: 5 }, (_, i) => {
                  const fullStars = Math.floor(hotel.stars);
                  const hasHalfStar = hotel.stars % 1 >= 0.5;
                  if (i < fullStars) return <span key={i}>{starSvg('#fbbf24')}</span>;
                  if (i === fullStars && hasHalfStar) {
                    return (
                      <span key={i}>
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
                  return <span key={i}>{starSvg('#d1d5db')}</span>;
                })}
              </span>
            )}
          </div>
          {/* Fiyat ve Book Now butonu sağda, otel ismiyle aynı hizada */}
          {offersData && offersData.offers && offersData.offers.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, minWidth: 260, marginLeft: 64 }}>
              <span style={{ fontSize: 40, fontWeight: 900, color: '#1e293b', padding: 0, background: 'none', borderRadius: 0, letterSpacing: 1, boxShadow: 'none', border: 'none' }}>
                {offersData.offers[0].price?.currency} {offersData.offers[0].price?.amount.toLocaleString()}
              </span>
            <button
                onClick={() => handleBookThisOffer(offersData.offers[0])}
              style={{
                  background: '#181818',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '18px 48px',
                  fontSize: 24,
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: 'none',
                  marginLeft: 0,
                  marginTop: 4,
                  transition: 'background 0.18s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#232323'}
                onMouseLeave={e => e.currentTarget.style.background = '#181818'}
              >
                Book Now
            </button>
              <span
            style={{
                  color: '#181818',
                  fontSize: 17,
                  fontWeight: 600,
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  marginTop: 12,
                  alignSelf: 'center',
                  display: 'inline-block',
                  transition: 'color 0.18s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#2563eb')}
                onMouseLeave={e => (e.currentTarget.style.color = '#181818')}
                onClick={() => showOfferDetailsModal(offersData.offers[0])}
              >
                See Offer Details
              </span>
              </div>
          )}
          </div>
        <div style={{ fontSize: 18, color: '#232323', fontWeight: 400, marginTop: 2, textAlign: 'left' }}>
          {hotel?.address?.addressLines?.join(', ') || hotel?.city?.name || ''}{hotel?.country?.name ? `, ${hotel.country?.name}` : ''}
        </div>
        {/* Hotel web sitesi adresinin hemen altında */}
        {hotel?.homePage && (
          <div style={{ color: '#181818', fontWeight: 600, fontSize: 15, marginTop: 4, marginBottom: 2, textDecoration: 'underline' }}>
            <a href={hotel.homePage} target="_blank" rel="noopener noreferrer" style={{ color: '#181818' }}>{hotel.homePage}</a>
                </div>
        )}
        {/* Silik çizgi */}
        <div style={{ width: '100%', height: 1, background: 'linear-gradient(to right, #e5e7eb 10%, #cbd5e1 90%)', opacity: 0.7, margin: '18px 0 0 0' }} />
      </div>
      {/* Description, Facilities & Map - YENİ GRID DÜZEN */}
      <section style={{
        maxWidth: 1200,
        margin: '48px auto 0 auto',
        padding: 0,
        background: 'none',
        boxShadow: 'none',
        borderRadius: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
      }}>
        {/* ÜSTTE: Facilities & Location yan yana */}
        <div style={{ display: 'flex', flexDirection: 'row', gap: 0, alignItems: 'stretch', width: '100%' }}>
          {/* Facilities & Themes (sol) */}
          <div style={{ flex: 2, padding: '0 32px 0 0', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
            <h2 style={{ fontSize: 22, fontWeight: 900, margin: '0 0 18px 0', color: '#181818', letterSpacing: -1, display: 'flex', alignItems: 'center', gap: 12 }}>
              {FaConciergeBell({ style: { color: '#181818', fontSize: 26 } })} Facilities
        </h2>
          {/* Facilities Grid - all categories */}
            {hotel?.seasons?.[0]?.facilityCategories?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {hotel.seasons[0].facilityCategories.map((cat: any) => (
                  <div key={cat.id || cat.name} style={{ marginBottom: 0 }}>
                    {/* Eğer sadece bir kategori varsa ve adı 'general' ise başlık gösterme, ama facility'leri göster */}
                    {!(hotel.seasons[0].facilityCategories.length === 1 && cat.name && cat.name.toLowerCase() === 'general') && cat.name && (
                      <div style={{ fontWeight: 700, fontSize: 16, color: '#181818', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                        {cat.name}
                    </div>
                    )}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18 }}>
                      {cat.facilities?.map((f: any) => (
                        <span key={f.id || f.name} style={{
                          color: '#181818', fontWeight: 500, fontSize: 15, background: 'transparent', padding: 0, border: 'none', borderRadius: 0, boxShadow: 'none', minHeight: 'unset', display: 'flex', alignItems: 'center', gap: 6
                        }}>
                          <span style={{ fontSize: 16, color: '#181818', minWidth: 18 }}>{facilityIcon(f.name, { fontSize: 16, color: '#181818' })}</span>
                          <span>{f.name}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: '#64748b', fontSize: 15, fontWeight: 600, padding: '12px 0' }}>No details found for this section.</div>
            )}
          {/* Themes Badges */}
            <div style={{ marginTop: 18 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 10px 0', color: '#181818', display: 'flex', alignItems: 'center', gap: 8 }}>
                {FaUmbrellaBeach({ style: { color: '#181818', fontSize: 18 } })} Themes
            </h3>
            {hotel?.themes?.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18 }}>
                {hotel.themes.map((theme: any) => (
                    <span key={theme.id} style={{ color: '#181818', fontWeight: 500, fontSize: 15, background: 'transparent', padding: 0, border: 'none', borderRadius: 0, boxShadow: 'none', minHeight: 'unset', display: 'flex', alignItems: 'center', gap: 6 }}>
                      {FaUmbrellaBeach({ style: { fontSize: 14, color: '#181818' } })} {theme.name}
                  </span>
                ))}
              </div>
            ) : (
                <div style={{ color: '#64748b', fontSize: 15, fontWeight: 600, padding: '8px 0' }}>No details found for this section.</div>
            )}
          </div>
        </div>
          {/* Dikey silik çizgi */}
          <div style={{ width: 1, background: 'linear-gradient(to bottom, #e5e7eb 10%, #cbd5e1 90%)', opacity: 0.7, margin: '0 0px', minHeight: 320, alignSelf: 'stretch' }} />
          {/* Map & Contact (sağ) */}
          <div style={{ flex: 2, padding: '0 0 0 32px', display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'center', justifyContent: 'flex-start' }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 12px 0', color: '#181818' }}>Location</h2>
            {/* Harita */}
            {hotel?.geolocation?.latitude && hotel?.geolocation?.longitude ? (
              <div
                style={{ width: '100%', height: 260, borderRadius: 12, border: '1.5px solid #e0e7ef', marginBottom: 10, overflow: 'hidden', cursor: 'pointer' }}
                onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${hotel.geolocation.latitude},${hotel.geolocation.longitude}`, '_blank')}
                title="Open in Google Maps"
                tabIndex={0}
                role="button"
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') window.open(`https://www.google.com/maps/search/?api=1&query=${hotel.geolocation.latitude},${hotel.geolocation.longitude}`, '_blank'); }}
              >
                <iframe
                  title="Hotel Location"
                  width="100%"
                  height="260"
                  frameBorder="0"
                  style={{ border: 'none', pointerEvents: 'none' }}
                  src={`https://maps.google.com/maps?q=${hotel.geolocation.latitude},${hotel.geolocation.longitude}&z=15&output=embed`}
                  allowFullScreen
                ></iframe>
              </div>
            ) : (
              <div style={{ width: '100%', height: 260, background: '#e0e7ef', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontWeight: 700, fontSize: 16 }}>No Map</div>
            )}
            {/* Adres ve iletişim */}
            <div style={{ width: '100%', marginTop: 18 }}>
              <div style={{ fontWeight: 800, fontSize: 18, color: '#181818', marginBottom: 8, letterSpacing: 0.5 }}>Contact</div>
              {hotel?.phoneNumber && (
                <div style={{ color: '#181818', fontWeight: 600, fontSize: 15, marginTop: 2, textDecoration: 'underline' }}>
                  <span style={{ marginRight: 6 }}>📞</span>
                  <a href={`tel:${hotel.phoneNumber}`} style={{ color: '#181818' }}>{hotel.phoneNumber}</a>
              </div>
            )}
              {hotel?.faxNumber && (
                <div style={{ color: '#181818', fontWeight: 600, fontSize: 15, marginTop: 8, textDecoration: 'underline' }}>
                  <span style={{ marginRight: 6 }}>📠</span>
                  <a href={`tel:${hotel.faxNumber}`} style={{ color: '#181818' }}>{hotel.faxNumber}</a>
              </div>
            )}
              {hotel?.email && (
                <div style={{ color: '#181818', fontWeight: 600, fontSize: 15, marginTop: 8, textDecoration: 'underline' }}>
                  <span style={{ marginRight: 6 }}>✉️</span>
                  <a href={`mailto:${hotel.email}`} style={{ color: '#181818' }}>{hotel.email}</a>
              </div>
            )}
              </div>
            <div style={{ color: '#232931', fontSize: 15, fontWeight: 400, marginTop: 6, textAlign: 'center', wordBreak: 'break-word' }}>
              {hotel?.address?.addressLines?.join(', ') || hotel?.city?.name || ''}{hotel?.country?.name ? `, ${hotel.country?.name}` : ''}
              </div>
                </div>
          </div>
        {/* ALTA: Description tam genişlikte */}
        <div style={{ width: '100%', marginTop: 36, padding: '0 8px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
          <CardDescriptions hotel={hotel} />
        </div>
        {/* Descriptions ile Offers arasına ince silik çizgi */}
        <div style={{ width: '100%', height: 1, background: 'linear-gradient(to right, #e5e7eb 10%, #cbd5e1 90%)', opacity: 0.7, margin: '32px 0 32px 0' }} />
      </section>
      {/* Offers Section */}
      <section style={{ maxWidth: 900, margin: '0 auto 0 auto', padding: '0 0 40px 0', borderRadius: 22, background: '#fff', boxShadow: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
        <div style={{ width: '100%', padding: '0 8px' }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#181818', marginBottom: 18, paddingLeft: 8, marginLeft: 0, textAlign: 'left', alignSelf: 'flex-start' }}>Offers</div>
        </div>
        {/* Result states */}
        {offersError && (
          <div style={{ color: '#f43f5e', fontWeight: 700, fontSize: 18, marginTop: 12, textAlign: 'center' }}>❌ {offersError}</div>
        )}
        {/* Offers Cards */}
        {offersData && Array.isArray(offersData.offers) && offersData.offers.length > 0 ? (
          <div style={{
            width: '100%',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '24px',
            marginTop: 16,
            alignItems: 'stretch',
          }}>
            {offersData.offers.map((offer: any, idx: number) => (
              <div key={idx} style={{
                background: '#fff',
                border: '1.5px solid #e5e7eb',
                borderRadius: 16,
                boxShadow: '0 2px 8px #0001',
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                minHeight: 180,
                justifyContent: 'space-between',
                transition: 'box-shadow 0.18s, border 0.18s',
                cursor: 'pointer',
                position: 'relative',
              }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#181818', marginBottom: 8 }}>
                  {offer.rooms?.[0]?.roomName || 'Room'} - {offer.price?.currency} {offer.price?.amount}
                </div>
                <div style={{ color: '#64748b', fontSize: 16 }}>
                  <b>Board:</b> {offer.rooms?.[0]?.boardName || '-'} | <b>Nights:</b> {offer.night} | <b>Check-in:</b> {offer.checkIn?.split('T')[0]}
                </div>
                <div style={{ color: '#64748b', fontSize: 16 }}>
                  <b>Availability:</b> <span style={{ color: '#16a34a', fontWeight: 700 }}>{offer.availability}</span>
                </div>
                <button 
                  onClick={() => showOfferDetailsModal(offer)}
                  style={{
                    marginTop: 8,
                    background: '#181818',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: 16,
                    padding: '12px 0',
                    border: 'none',
                    borderRadius: 12,
                    cursor: 'pointer',
                    boxShadow: 'none',
                    letterSpacing: 0.5,
                    transition: 'all 0.18s, transform 0.12s',
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.background = '#232323';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.background = '#181818';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  See Details
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: '#64748b', fontSize: 18, fontWeight: 600, padding: '18px 0' }}>No other offers</div>
        )}
        {/* Responsive: Mobilde tek sütun */}
        <style>{`
          @media (max-width: 900px) {
            section[style*='max-width: 900px'] > div[style*='display: grid'] {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </section>

      {/* OFFER DETAILS MODAL */}
      {showOfferModal && offerDetail && selectedOffer && (
        <div 
          className="modal-overlay" 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeOfferDetailsModal();
            }
          }}
        >
          <div className="modal-content" style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '24px 24px 0 24px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#1f2937' }}>
                  Offer Details
                </h2>
                <p style={{ margin: '8px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
                  {hotel?.name}
                </p>
              </div>
              <button
                onClick={closeOfferDetailsModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280',
                  padding: '8px',
                  borderRadius: '8px',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px' }}>
              {/* Hotel Info */}
              <div style={{
                display: 'flex',
                gap: '16px',
                marginBottom: '24px',
                padding: '16px',
                backgroundColor: '#f8fafc',
                borderRadius: '12px'
              }}>
                <img
                  src={hotel?.seasons?.[0]?.mediaFiles?.[0]?.urlFull || hotel?.thumbnailFull || process.env.PUBLIC_URL + '/fernando-alvarez-rodriguez-M7GddPqJowg-unsplash.jpg'}
                  alt={hotel?.name}
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '8px',
                    objectFit: 'cover'
                  }}
                />
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 600 }}>
                    {hotel?.name}
                  </h3>
                  <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: '14px' }}>
                    📍 {hotel?.address?.addressLines?.join(', ') || hotel?.city?.name || 'Unknown location'}
                    {hotel?.country?.name && `, ${hotel.country.name}`}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                    {hotel?.stars && renderStars(hotel.stars)}
                    {hotel?.stars && <span style={{ color: '#6b7280', fontSize: '14px' }}>
                      ({hotel.stars} stars)
                    </span>}
                  </div>
                </div>
              </div>

              {/* Offer Details Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                {/* Left Column */}
                <div>
                  <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600, color: '#374151' }}>
                    📅 Stay Information
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280' }}>Check-in:</span>
                      <span style={{ fontWeight: 500 }}>
                        {new Date(offerDetail.checkIn).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280' }}>Check-out:</span>
                      <span style={{ fontWeight: 500 }}>
                        {new Date(offerDetail.checkOut).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280' }}>Nights:</span>
                      <span style={{ fontWeight: 500 }}>
                        {Math.ceil((new Date(offerDetail.checkOut).getTime() - new Date(offerDetail.checkIn).getTime()) / (1000 * 60 * 60 * 24))} nights
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280' }}>Availability:</span>
                      <span style={{ fontWeight: 500, color: offerDetail.availability > 0 ? '#059669' : '#dc2626' }}>
                        {offerDetail.availability} room{offerDetail.availability !== 1 ? 's' : ''} available
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280' }}>Expires on:</span>
                      <span style={{ fontWeight: 500, color: '#dc2626' }}>
                        {new Date(offerDetail.expiresOn).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div>
                  <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600, color: '#374151' }}>
                    💰 Pricing Information
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{
                      padding: '16px',
                      backgroundColor: '#f0f9ff',
                      borderRadius: '8px',
                      border: '2px solid #0ea5e9'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ color: '#0c4a6e', fontWeight: 600 }}>Total Price:</span>
                        <span style={{ fontSize: '20px', fontWeight: 700, color: '#0c4a6e' }}>
                          {offerDetail.price.currency} {offerDetail.price.amount}
                        </span>
                      </div>
                      <div style={{ fontSize: '14px', color: '#0369a1' }}>
                        {offerDetail.price.currency} {(offerDetail.price.amount / Math.ceil((new Date(offerDetail.checkOut).getTime() - new Date(offerDetail.checkIn).getTime()) / (1000 * 60 * 60 * 24))).toFixed(2)} per night
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280' }}>Refundable:</span>
                      <span style={{ fontWeight: 500, color: offerDetail.isRefundable ? '#059669' : '#dc2626' }}>
                        {offerDetail.isRefundable ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280' }}>Special Offer:</span>
                      <span style={{ fontWeight: 500, color: offerDetail.isSpecial ? '#f59e0b' : '#6b7280' }}>
                        {offerDetail.isSpecial ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280' }}>Available:</span>
                      <span style={{ fontWeight: 500, color: offerDetail.isAvailable ? '#059669' : '#dc2626' }}>
                        {offerDetail.isAvailable ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              {offerDetail.priceBreakdowns && offerDetail.priceBreakdowns.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600, color: '#374151' }}>
                    📊 Daily Price Breakdown
                  </h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '12px'
                  }}>
                    {offerDetail.priceBreakdowns.map((breakdown: any, index: number) => (
                      <div key={index} style={{
                        padding: '12px',
                        backgroundColor: '#f9fafb',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb'
                      }}>
                        <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
                          {new Date(breakdown.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: 600, color: '#374151' }}>
                          {breakdown.price.currency} {breakdown.price.amount}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cancellation Policies */}
              {offerDetail.cancellationPolicies && offerDetail.cancellationPolicies.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600, color: '#374151' }}>
                    🚫 Cancellation Policy
                  </h4>
                  <div style={{
                    padding: '16px',
                    backgroundColor: '#fef2f2',
                    borderRadius: '8px',
                    border: '1px solid #fecaca'
                  }}>
                    {offerDetail.cancellationPolicies.map((policy: any, index: number) => (
                      <div key={index} style={{ marginBottom: index < offerDetail.cancellationPolicies.length - 1 ? '12px' : 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ color: '#991b1b', fontWeight: 500 }}>Room {policy.roomNumber}:</span>
                          <span style={{ color: '#991b1b', fontWeight: 500 }}>
                            {policy.price.currency} {policy.price.amount}
                          </span>
                        </div>
                        <div style={{ fontSize: '14px', color: '#7f1d1d' }}>
                          Due: {new Date(policy.dueDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {offerDetail.notes && (
                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600, color: '#374151' }}>
                    📝 Important Notes
                  </h4>
                  <div style={{
                    padding: '16px',
                    backgroundColor: '#fef3c7',
                    borderRadius: '8px',
                    border: '1px solid #fde68a',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    color: '#92400e',
                    maxHeight: '200px',
                    overflow: 'auto'
                  }}>
                    {offerDetail.notes}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end',
                borderTop: '1px solid #e5e7eb',
                paddingTop: '24px'
              }}>
                <button
                  onClick={closeOfferDetailsModal}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                >
                  Close
                </button>
                <button
                  onClick={() => handleBookThisOffer(selectedOffer)}
                  disabled={!!transactionLoading[selectedOffer.offerId]}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: !!transactionLoading[selectedOffer.offerId] ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                >
                  {!!transactionLoading[selectedOffer.offerId] ? 'Processing...' : 'Book This Offer'}
                </button>
                {transactionError[selectedOffer.offerId] && (
                  <div style={{ color: '#f43f5e', fontWeight: 700, fontSize: 16, marginTop: 8 }}>{transactionError[selectedOffer.offerId]}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

        {/* Footer - minimalist, responsive, modern */}
        <footer style={{
          marginTop: '3.5rem',
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
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2.5rem' }}>
            <div style={{ flex: 1, minWidth: 220, marginBottom: 18 }}>
              <div style={{ fontWeight: 700, fontSize: '1.15rem', marginBottom: 8 }}>HotelRes</div>
              <div style={{ color: '#b0b0b0', fontSize: '1rem', marginBottom: 8 }}>Your trusted partner for the best hotel experience.</div>
              </div>
            <div style={{ flex: 1, minWidth: 180, marginBottom: 18 }}>
              <div style={{ fontWeight: 700, fontSize: '1.08rem', marginBottom: 8, color: 'white' }}>Quick Access</div>
              <div style={{ color: '#b0b0b0', fontSize: '1rem', marginBottom: 8, cursor: 'pointer' }} onClick={() => window.location.href = '/'}>Home</div>
              <div style={{ color: '#b0b0b0', fontSize: '1rem', marginBottom: 8, cursor: 'pointer' }} onClick={() => window.location.href = '/hotels'}>Search Hotels</div>
              <div style={{ color: '#b0b0b0', fontSize: '1rem', marginBottom: 8, cursor: 'pointer' }} onClick={() => window.location.href = '/reservations'}>My Reservations</div>
            </div>
            <div style={{ flex: 1, minWidth: 180, marginBottom: 18 }}>
              <div style={{ fontWeight: 700, fontSize: '1.08rem', marginBottom: 8, color: 'white' }}>Contact</div>
              <div style={{ color: '#b0b0b0', fontSize: '1rem', marginBottom: 8 }}>info@hotelres.com</div>
              <div style={{ color: '#b0b0b0', fontSize: '1rem', marginBottom: 8 }}>+90 212 555 0123</div>
            </div>
            </div>
          <div style={{ borderTop: '1px solid #2d3250', margin: '2.5rem 0 0 0', width: '100%' }}></div>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.2rem 2rem 0 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', color: '#b0b0b0', fontSize: '1rem' }}>
            <span>© {new Date().getFullYear()} HotelRes. All rights reserved.</span>
          </div>
        </footer>
        {lightboxOpen && images.length > 0 && (
          <div
            style={{
              position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 2000,
              background: 'rgba(30,41,59,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'fadeIn 0.3s',
            }}
            onClick={closeLightbox}
          >
            <div
              style={{ position: 'relative', maxWidth: '90vw', maxHeight: '80vh', boxShadow: '0 8px 32px #0008', borderRadius: 16, overflow: 'hidden', background: '#fff' }}
              onClick={e => e.stopPropagation()}
            >
              <img src={images[lightboxIndex]} alt="Hotel" style={{ maxWidth: '90vw', maxHeight: '80vh', display: 'block', borderRadius: 16 }} />
              {images.length > 1 && (
                <>
                  <button onClick={prevImage} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.3)', border: 'none', borderRadius: '50%', width: 40, height: 40, color: '#fff', fontSize: 28, cursor: 'pointer' }}>&lt;</button>
                  <button onClick={nextImage} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.3)', border: 'none', borderRadius: '50%', width: 40, height: 40, color: '#fff', fontSize: 28, cursor: 'pointer' }}>&gt;</button>
                </>
              )}
              <button onClick={closeLightbox} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.3)', border: 'none', borderRadius: '50%', width: 36, height: 36, color: '#fff', fontSize: 22, cursor: 'pointer' }}>✕</button>
            </div>
          </div>
        )}
    </div>
  );
}

// Açılır/kapanır Descriptions bileşeni
const CardDescriptions: React.FC<{ hotel: any }> = ({ hotel }) => {
  const [openIndexes, setOpenIndexes] = React.useState<{ [key: number]: boolean }>({});
  const textCategories = hotel?.seasons?.[0]?.textCategories || [];
  if (!textCategories.length && !hotel?.description) {
    return <div style={{ color: '#64748b', fontSize: 16, fontWeight: 600, padding: '10px 0' }}>No details found for this section.</div>;
  }
  return (
    <div style={{ width: '100%' }}>
      {/* Sadece bir başlık */}
      <div style={{ fontSize: 24, fontWeight: 900, color: '#181818', marginBottom: 18 }}>Descriptions</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
        {textCategories.map((cat: any, idx: number) => {
          const isOpen = !!openIndexes[idx];
          const presentations = cat.presentations || [];
          const allText = presentations.map((pres: any) => pres.text).join(' ');
          const collapsedHeight = 140;
          const needsShowMore = allText.length > 320 || presentations.length > 1;
          return (
            <div key={cat.name || idx} style={{
              flex: '1 1 320px',
              minWidth: 280,
              maxWidth: 400,
              background: '#fff',
              borderRadius: 16,
              boxShadow: '0 2px 12px #0001',
              padding: '24px 20px 18px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              border: '1.5px solid #e5e7eb',
              position: 'relative',
              height: isOpen ? 'auto' : collapsedHeight,
              overflow: isOpen ? 'visible' : 'hidden',
              transition: 'height 0.25s',
            }}>
              <div style={{ fontWeight: 800, fontSize: 19, color: '#181818', marginBottom: 8 }}>{cat.name}</div>
              <div
                style={{
                  fontSize: 16.5,
                  color: '#181818',
                  lineHeight: 1.7,
                  display: '-webkit-box',
                  WebkitLineClamp: isOpen ? 'unset' : 4,
                  WebkitBoxOrient: 'vertical',
                  overflow: isOpen ? 'visible' : 'hidden',
                  textOverflow: isOpen ? 'unset' : 'ellipsis',
                  maxHeight: isOpen ? 'none' : collapsedHeight - 40,
                  transition: 'max-height 0.25s',
                }}
              >
                {presentations.map((pres: any, pIdx: number) => (
                  <div key={pIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 2 }}>
                    <div style={{ minWidth: 22, fontSize: 18, marginTop: 1 }}>{renderExplanation({ text: '', textType: pres.textType })}</div>
                    <div>{pres.text}</div>
                  </div>
                ))}
              </div>
              {needsShowMore && !isOpen && (
                <button
                  onClick={() => setOpenIndexes(prev => ({ ...prev, [idx]: true }))}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#6b7280',
                    fontWeight: 400,
                    fontSize: 15,
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    marginTop: 8,
                    alignSelf: 'center',
                    outline: 'none',
                  }}
                >
                  Show More
                </button>
              )}
              {isOpen && needsShowMore && (
                <button
                  onClick={() => setOpenIndexes(prev => ({ ...prev, [idx]: false }))}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#6b7280',
                    fontWeight: 400,
                    fontSize: 15,
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    marginTop: 8,
                    alignSelf: 'center',
                    outline: 'none',
                  }}
                >
                  Show Less
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HotelDetailsPage; 