import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { FaHome, FaSearch, FaBookmark } from 'react-icons/fa';
import { FaSnowflake, FaUtensils, FaCar, FaGlassCheers, FaConciergeBell, FaExchangeAlt, FaHotel, FaLock, FaCouch, FaMapMarkerAlt, FaClock, FaCheckCircle, FaWifi, FaSwimmingPool, FaUmbrellaBeach, FaRegDotCircle } from 'react-icons/fa';
import { getOffers } from '../api';

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
  const currency = params.get('currency') || 'EUR';
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
        const response = await fetch('http://localhost:8080/api/productinfo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            productType: 2,
            ownerProvider: 2,
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

  // Offers API call
  const fetchOffers = async () => {
    if (!searchId || !offerId) {
      setOffersError('searchId or offerId missing in URL.');
      return;
    }
    setOffersLoading(true);
    setOffersError(null);
    setOffersData(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setOffersError('Authentication token not found');
        setOffersLoading(false);
        return;
      }
      if (!id) {
        setOffersError('Hotel ID (productId) is missing.');
        setOffersLoading(false);
        return;
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
    } catch (err) {
      setOffersError('Teklif detayları alınamadı.');
    } finally {
      setOffersLoading(false);
    }
  };

  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e0e7ff 0%, #f8fafc 100%)' }}>
      {/* HEADER (same as HotelList/SearchPage) */}
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
      {/* HERO SECTION (modern horizontal card) */}
      <div style={{
        width: '100%',
        maxWidth: 1200,
        margin: '24px auto 32px auto',
        borderRadius: 18,
        boxShadow: '0 4px 24px #1e3a8a22',
        background: 'linear-gradient(90deg, #1e3a8a 0%, #2563eb 100%)',
        display: 'flex',
        alignItems: 'stretch',
        gap: 0,
        padding: 0,
        minHeight: 220,
        height: 220,
        position: 'relative',
        flexWrap: 'wrap',
      }}>
        {/* Hotel Image */}
        <div style={{ flex: '0 0 340px', height: 220, display: 'flex', alignItems: 'stretch', justifyContent: 'flex-start' }}>
          {hotel?.seasons?.[0]?.mediaFiles?.length > 0 ? (
            <img
              src={hotel.seasons[0].mediaFiles[0].urlFull}
              alt={hotel.name}
              style={{ width: 340, height: 220, objectFit: 'cover', borderTopLeftRadius: 18, borderBottomLeftRadius: 18, borderTopRightRadius: 0, borderBottomRightRadius: 0, boxShadow: '0 2px 12px #0003', background: '#e0e7ef', cursor: 'pointer', display: 'block' }}
              onClick={() => openLightbox(0)}
            />
          ) : hotel?.thumbnailFull ? (
            <img src={hotel.thumbnailFull} alt={hotel.name} style={{ width: 340, height: 220, objectFit: 'cover', borderTopLeftRadius: 18, borderBottomLeftRadius: 18, borderTopRightRadius: 0, borderBottomRightRadius: 0, boxShadow: '0 2px 12px #0003', background: '#e0e7ef', cursor: 'pointer', display: 'block' }} onClick={() => openLightbox(0)} />
          ) : (
            <div style={{ width: 340, height: 220, borderTopLeftRadius: 18, borderBottomLeftRadius: 18, background: '#e0e7ef', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontWeight: 700, fontSize: 18 }}>No Image</div>
          )}
        </div>
        {/* Hotel Info */}
        <div style={{ flex: 1, minWidth: 220, display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center', padding: '0 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0, letterSpacing: -1, color: 'white', textShadow: '0 2px 8px #1e3a8a44' }}>{hotel?.name || 'Hotel Name'}</h1>
            {hotel?.stars ? renderStars(hotel.stars) : null}
            {hotel?.stars && <span style={{ fontWeight: 700, fontSize: 18, color: '#fbbf24' }}>({hotel.stars})</span>}
            {hotel?.rating && <span style={{ fontWeight: 700, fontSize: 18, color: '#38f9d7' }}>Rating: {hotel.rating?.toFixed(2)}</span>}
            {hotel?.themes?.map((theme: any) => (
              <span key={theme.id} style={{ background: '#38bdf8', color: '#fff', borderRadius: 8, padding: '4px 12px', fontWeight: 700, fontSize: 15, boxShadow: '0 1px 4px #38bdf81a' }}>{theme.name}</span>
            ))}
            <button style={{ background: 'rgba(255,255,255,0.18)', border: 'none', borderRadius: '50%', width: 38, height: 38, marginLeft: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }} onClick={handleFavorite} aria-label={isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}>
              <HeartIcon filled={isFavorite} animate={heartAnimate} />
            </button>
            <button style={{ background: 'rgba(255,255,255,0.18)', border: 'none', borderRadius: '50%', width: 38, height: 38, marginLeft: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#2563eb', transition: 'background 0.2s' }}>🔗</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 16, fontWeight: 500, color: 'white', textShadow: '0 1px 4px #1e3a8a44' }}>
            <span>📍 {hotel?.address?.addressLines?.join(', ') || hotel?.city?.name || 'No address'}, {hotel?.country?.name || ''}</span>
            {hotel?.geolocation?.latitude && hotel?.geolocation?.longitude && (
              <a
                href={getMapLink(hotel.geolocation.latitude, hotel.geolocation.longitude)}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#fbbf24', fontWeight: 700, textDecoration: 'underline', fontSize: 16 }}
              >
                Show on Map
              </a>
            )}
          </div>
        </div>
      </div>
      {/* Gallery Grid - horizontal scrollable */}
      {images.length > 1 ? (
        <div style={{ position: 'relative', maxWidth: 1200, margin: '0 auto' }}>
          {/* Left Arrow */}
          {canScrollLeft && (
            <button
              onClick={() => scrollGallery('left')}
              style={{
                position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 2,
                background: 'rgba(30,41,59,0.85)', color: '#fff', border: 'none', borderRadius: '50%', width: 38, height: 38,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, boxShadow: '0 2px 8px #0003', cursor: 'pointer', transition: 'background 0.18s',
                opacity: 0.85
              }}
              aria-label="Galeriyi sola kaydır"
            >
              &#8592;
            </button>
          )}
          {/* Right Arrow */}
          {canScrollRight && (
            <button
              onClick={() => scrollGallery('right')}
              style={{
                position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 2,
                background: 'rgba(30,41,59,0.85)', color: '#fff', border: 'none', borderRadius: '50%', width: 38, height: 38,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, boxShadow: '0 2px 8px #0003', cursor: 'pointer', transition: 'background 0.18s',
                opacity: 0.85
              }}
              aria-label="Galeriyi sağa kaydır"
            >
              &#8594;
            </button>
          )}
          <div
            ref={galleryRef}
            style={{
              display: 'flex',
              overflowX: 'auto',
              gap: 16,
              padding: '0 48px 32px 48px',
              maxWidth: 1200,
              margin: '0 auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              cursor: 'grab',
              userSelect: 'none',
            }}
            className="hotel-horizontal-gallery"
          >
            {images.map((img: string, idx: number) => (
              <div
                key={img}
                style={{
                  borderRadius: 14,
                  overflow: 'hidden',
                  boxShadow: '0 2px 12px #0001',
                  cursor: 'pointer',
                  transition: 'transform 0.18s cubic-bezier(.68,-0.55,.27,1.55), box-shadow 0.18s',
                  minWidth: 160,
                  width: 160,
                  height: 120,
                  flex: '0 0 160px',
                  background: '#f1f5f9',
                  position: 'relative',
                }}
                onClick={() => openLightbox(idx)}
                tabIndex={0}
                aria-label={`Büyüt: ${hotel?.name}`}
                onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && openLightbox(idx)}
              >
                <img src={img} alt={hotel?.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.18s', }}
                  onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.06)')}
                  onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
                />
              </div>
            ))}
            <style>{`
              .hotel-horizontal-gallery::-webkit-scrollbar { display: none; }
              .hotel-horizontal-gallery.dragging { cursor: grabbing !important; }
            `}</style>
          </div>
        </div>
      ) : null}
      {/* Description Card (by seasons[0].textCategories) or fallback */}
      {hotel?.seasons?.[0]?.textCategories?.length > 0 ? (
        <section style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #0001', padding: '32px 36px', marginBottom: 0, animation: 'fadeInUp 0.5s', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 18px 0', color: '#2563eb' }}>Descriptions</h2>
          {hotel.seasons[0].textCategories.map((cat: any, idx: number) => (
            <div key={cat.name || idx} style={{ marginBottom: 8, padding: '18px 0', borderBottom: idx !== hotel.seasons[0].textCategories.length - 1 ? '1px solid #e0e7ef' : 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontWeight: 700, fontSize: 20, color: '#2563eb', marginBottom: 4 }}>{cat.name}</div>
              {cat.presentations?.map((pres: any, pIdx: number) => (
                <div key={pIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 4 }}>
                  <div style={{ minWidth: 28, fontSize: 20, marginTop: 2 }}>{renderExplanation({ text: '', textType: pres.textType })}</div>
                  <div style={{ fontSize: 17, color: '#334155', lineHeight: 1.7 }}>{pres.text}</div>
                </div>
              ))}
            </div>
          ))}
        </section>
      ) : hotel?.description ? (
        <section style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #0001', padding: '32px 36px', marginBottom: 0, animation: 'fadeInUp 0.5s' }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 18px 0', color: '#2563eb' }}>Description</h2>
          <div style={{ fontSize: 18, color: '#334155', lineHeight: 1.7 }}>
            {renderExplanation(hotel.description)}
          </div>
        </section>
      ) : (
        <section style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #0001', padding: '32px 36px', marginBottom: 0, animation: 'fadeInUp 0.5s', textAlign: 'center', color: '#64748b', fontSize: 20, fontWeight: 600 }}>
          No detailed description available for this hotel.
        </section>
      )}
        {/* Facilities & Themes Section */}
        {(hotel?.seasons?.[0]?.facilityCategories?.length > 0 || hotel?.themes?.length > 0) && (
          <section style={{ background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px #1e3a8a11', padding: '40px 44px', animation: 'fadeInUp 0.5s', marginTop: 8 }}>
            <h2 style={{ fontSize: 28, fontWeight: 900, margin: '0 0 28px 0', color: '#16a34a', letterSpacing: -1, display: 'flex', alignItems: 'center', gap: 12 }}>
              {FaConciergeBell({ style: { color: '#16a34a', fontSize: 32 } })} Facilities & Themes
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 40, alignItems: 'flex-start' }}>
              {/* Facilities Grid - all categories */}
              {hotel.seasons?.[0]?.facilityCategories?.length > 0 && (
                <div style={{ flex: 2, minWidth: 260 }}>
                  <h3 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 18px 0', color: '#2563eb', display: 'flex', alignItems: 'center', gap: 8 }}>
                    {FaHotel({ style: { color: '#2563eb', fontSize: 22 } })} Facilities
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                    {hotel.seasons[0].facilityCategories.map((cat: any) => (
                      <div key={cat.id || cat.name} style={{ marginBottom: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 18, color: '#0ea5e9', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                          {FaRegDotCircle({ style: { color: '#0ea5e9', fontSize: 18 } })} {cat.name}
                          <div style={{ flex: 1, height: 2, background: 'linear-gradient(90deg,#0ea5e9 40%,#e0e7ef 100%)', marginLeft: 10, borderRadius: 2 }} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
                          {cat.facilities?.map((f: any) => (
                            <span key={f.id || f.name} style={{
                              display: 'flex', alignItems: 'center', gap: 10,
                              background: '#e0f2fe', color: '#0369a1', borderRadius: 12, padding: '10px 18px', fontWeight: 600, fontSize: 16,
                              boxShadow: '0 2px 8px #38bdf81a',
                              transition: 'background 0.2s, color 0.2s, box-shadow 0.2s',
                              cursor: 'pointer',
                              border: '1.5px solid #bae6fd',
                              minHeight: 44,
                              userSelect: 'none',
                            }}
                              tabIndex={0}
                              onMouseOver={e => (e.currentTarget.style.background = '#bae6fd')}
                              onMouseOut={e => (e.currentTarget.style.background = '#e0f2fe')}
                            >
                              <span style={{ fontSize: 20, color: '#0ea5e9', minWidth: 22 }}>{facilityIcon(f.name, { fontSize: 20, color: '#0ea5e9' })}</span>
                              <span>{f.name}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Themes Badges */}
              {hotel.themes?.length > 0 && (
                <div style={{ flex: 1, minWidth: 180 }}>
                  <h3 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 18px 0', color: '#f59e42', display: 'flex', alignItems: 'center', gap: 8 }}>
                    {FaUmbrellaBeach({ style: { color: '#f59e42', fontSize: 22 } })} Themes
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
                    {hotel.themes.map((theme: any) => (
                      <span key={theme.id} style={{ background: '#f59e42', color: '#fff', borderRadius: 10, padding: '10px 20px', fontWeight: 700, fontSize: 17, boxShadow: '0 2px 8px #f59e421a', display: 'flex', alignItems: 'center', gap: 10 }}>
                        {FaUmbrellaBeach({ style: { fontSize: 18, color: '#fff' } })} {theme.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
        {/* Contact & Map Section */}
        {(hotel?.address || hotel?.phoneNumber || hotel?.faxNumber || hotel?.email || hotel?.homePage || hotel?.website || hotel?.geolocation || hotel?.address?.geolocation || hotel?.location) && (
          <section style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #0001', padding: '32px 36px', animation: 'fadeInUp 0.5s', marginTop: 24, marginBottom: 32 }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 18px 0', color: '#f43f5e' }}>Contact & Location</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'flex-start' }}>
              <div style={{ flex: 1, minWidth: 260, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Address */}
                {hotel.address?.addressLines?.length > 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 17, color: '#334155' }}>
                    <span role="img" aria-label="Adres">📍</span>
                    {hotel.address.addressLines.join(', ')}
                  </div>
                ) : null}
                {hotel.address?.street && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 17, color: '#334155' }}>
                    <span role="img" aria-label="Sokak">🛣️</span>
                    {hotel.address.street}
                  </div>
                )}
                {hotel.address?.streetNumber && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 17, color: '#334155' }}>
                    <span role="img" aria-label="No">#</span>
                    {hotel.address.streetNumber}
                  </div>
                )}
                {/* City (only show once) */}
                {hotel.address?.city?.name ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 17, color: '#334155' }}>
                    <span role="img" aria-label="Şehir">🏙️</span>
                    {hotel.address.city.name}
                  </div>
                ) : hotel.city?.name ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 17, color: '#334155' }}>
                    <span role="img" aria-label="Şehir">🏙️</span>
                    {hotel.city.name}
                  </div>
                ) : null}
                {/* Country (only show once) */}
                {hotel.country?.name && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 17, color: '#334155' }}>
                    <span role="img" aria-label="Ülke">🌍</span>
                    {hotel.country.name}
                  </div>
                )}
                {/* Contact */}
                {hotel.phoneNumber && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 17, color: '#334155' }}>
                    <span role="img" aria-label="Telefon">📞</span>
                    <a href={`tel:${hotel.phoneNumber}`} style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>{hotel.phoneNumber}</a>
                  </div>
                )}
                {hotel.faxNumber && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 17, color: '#334155' }}>
                    <span role="img" aria-label="Faks">📠</span>
                    {hotel.faxNumber}
                  </div>
                )}
                {hotel.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 17, color: '#334155' }}>
                    <span role="img" aria-label="E-posta">✉️</span>
                    <a href={`mailto:${hotel.email}`} style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>{hotel.email}</a>
                  </div>
                )}
                {/* Website (only show once, always clickable) */}
                {(hotel.website || hotel.homePage) && (() => {
                  let url = hotel.website || hotel.homePage;
                  if (url && !/^https?:\/\//i.test(url)) url = 'https://' + url;
                  return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 17, color: '#334155' }}>
                      <span role="img" aria-label="Web">🌐</span>
                      <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>{url}</a>
                    </div>
                  );
                })()}
              </div>
              {/* Map Embed */}
              {(hotel.geolocation?.latitude && hotel.geolocation?.longitude) || (hotel.address?.geolocation?.latitude && hotel.address?.geolocation?.longitude) ? (
                <div style={{ flex: 1, minWidth: 260, maxWidth: 420, borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 8px #2563eb22' }}>
                  <iframe
                    title="Harita"
                    width="100%"
                    height="220"
                    frameBorder="0"
                    style={{ border: 0, borderRadius: 12 }}
                    src={`https://www.google.com/maps?q=${hotel.geolocation?.latitude || hotel.address?.geolocation?.latitude},${hotel.geolocation?.longitude || hotel.address?.geolocation?.longitude}&z=15&output=embed`}
                    allowFullScreen
                  />
                </div>
              ) : null}
            </div>
            {/* Make a Reservation Button */}
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 36 }}>
              <button style={{
                background: 'linear-gradient(90deg, #1e3a8a 0%, #2563eb 100%)',
                color: 'white',
                fontWeight: 800,
                fontSize: 24,
                padding: '22px 64px',
                border: 'none',
                borderRadius: 16,
                boxShadow: '0 4px 24px #2563eb33',
                cursor: 'pointer',
                letterSpacing: 1,
                transition: 'background 0.2s, box-shadow 0.2s, transform 0.1s',
                marginBottom: 0,
                marginTop: 0,
                outline: 'none',
                textShadow: '0 2px 8px #1e3a8a44',
                position: 'relative',
                overflow: 'hidden',
              }}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                onMouseOver={e => (e.currentTarget.style.background = 'linear-gradient(90deg, #2563eb 0%, #1e3a8a 100%)')}
                onMouseOut={e => (e.currentTarget.style.background = 'linear-gradient(90deg, #1e3a8a 0%, #2563eb 100%)')}
              >
                🛎️ Make a Reservation
              </button>
            </div>
          </section>
        )}
        {/* Offers Section */}
        <section style={{ maxWidth: 900, margin: '48px auto 0 auto', padding: '36px 0', borderRadius: 18, background: '#fff', boxShadow: '0 2px 12px #0001', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: '#2563eb', marginBottom: 0, letterSpacing: -1 }}>Offers</h2>
          <button
            onClick={fetchOffers}
            style={{
              background: 'linear-gradient(90deg, #1e3a8a 0%, #2563eb 100%)',
              color: 'white', fontWeight: 800, fontSize: 20, padding: '16px 48px', border: 'none', borderRadius: 12,
              boxShadow: '0 2px 12px #2563eb33', cursor: 'pointer', letterSpacing: 1, marginBottom: 0, marginTop: 0,
              outline: 'none', textShadow: '0 2px 8px #1e3a8a44', position: 'relative', overflow: 'hidden', transition: 'background 0.2s, box-shadow 0.2s, transform 0.1s'
            }}
            disabled={offersLoading}
            aria-busy={offersLoading}
          >
            {offersLoading ? 'Loading...' : 'Show Offers'}
          </button>
          {/* Result states */}
          {offersError && (
            <div style={{ color: '#f43f5e', fontWeight: 700, fontSize: 18, marginTop: 12, textAlign: 'center' }}>❌ {offersError}</div>
          )}
          {offersData && !offersData.offers && !offersData.roomInfos && (
            <div style={{ color: '#64748b', fontWeight: 600, fontSize: 18, marginTop: 12, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 48 }}>🛏️</span>
              No offers found for this hotel.
            </div>
          )}
          {/* Offers Cards */}
          {offersData && Array.isArray(offersData.offers) && offersData.offers.length > 0 && (
            <div style={{
              width: '100%',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(370px, 1fr))',
              gap: 36,
              marginTop: 32,
              padding: '0 8px'
            }}>
              {offersData.offers.map((offer: any, idx: number) => (
                <div key={idx} style={{
                  background: 'linear-gradient(135deg, #f8fafc 60%, #e0e7ff 100%)',
                  borderRadius: 22,
                  boxShadow: '0 8px 32px #2563eb22',
                  padding: 32,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 18,
                  border: '2.5px solid #2563eb22',
                  position: 'relative',
                  transition: 'transform 0.18s, box-shadow 0.18s',
                  minHeight: 340,
                  overflow: 'hidden',
                  cursor: 'pointer',
                }}
                  onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.03)')}
                  onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  {/* Köşe Rozeti */}
                  {offer.isRefundable && (
                    <span style={{
                      position: 'absolute', top: 18, right: 18,
                      background: 'linear-gradient(90deg, #38bdf8 0%, #16a34a 100%)',
                      color: '#fff', fontWeight: 800, fontSize: 14,
                      borderRadius: 8, padding: '4px 14px', boxShadow: '0 2px 8px #16a34a33', zIndex: 2
                    }}>
                      Refundable
                    </span>
                  )}
                  {/* Fiyat Badge */}
                  <div style={{
                    fontSize: 32, fontWeight: 900, 
                    color: '#fff',
                    background: 'linear-gradient(90deg, #fbbf24 0%, #2563eb 100%)',
                    borderRadius: 14, padding: '10px 28px', alignSelf: 'flex-start',
                    boxShadow: '0 2px 12px #2563eb22', marginBottom: 8, letterSpacing: -1
                  }}>
                    {offer.price?.amount} {offer.price?.currency}
                  </div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{
                      background: '#38bdf8', color: '#fff', borderRadius: 8, padding: '4px 14px', fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', gap: 6
                    }}>
                      🛏️ {offer.rooms?.[0]?.roomName}
                    </span>
                    <span style={{
                      background: '#fbbf24', color: '#fff', borderRadius: 8, padding: '4px 14px', fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', gap: 6
                    }}>
                      🍽️ {offer.rooms?.[0]?.boardName}
                    </span>
                    <span style={{
                      background: '#e0e7ff', color: '#2563eb', borderRadius: 8, padding: '4px 14px', fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', gap: 6
                    }}>
                      {offer.night} nights
                    </span>
                  </div>
                  <div style={{ color: '#64748b', fontSize: 16, marginTop: 8 }}>
                    <b>Availability:</b> <span style={{ color: '#16a34a', fontWeight: 700 }}>{offer.availability}</span>
                  </div>
                  <div style={{ color: '#64748b', fontSize: 16 }}>
                    <b>Check-in:</b> {offer.checkIn?.split('T')[0]}
                  </div>
                  <div style={{ color: '#64748b', fontSize: 16 }}>
                    <b>Cancellation:</b>
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                      {offer.cancellationPolicies?.map((cp: any, i: number) => (
                        <li key={i} style={{ fontSize: 15 }}>
                          Free until <b>{cp.dueDate?.split('T')[0]}</b> – Penalty: <b>{cp.price?.amount} {cp.price?.currency}</b>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div style={{ color: '#64748b', fontSize: 16 }}>
                    <b>Travellers:</b> {offer.rooms?.[0]?.travellers?.length || 0}
                  </div>
                  {/* Room Features */}
                  <div style={{ color: '#64748b', fontSize: 16 }}>
                    <b>Room Features:</b>
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                      {offer.rooms?.[0]?.roomName && <li>{offer.rooms[0].roomName}</li>}
                    </ul>
                  </div>
                  {/* Book Now Button */}
                  <button style={{
                    marginTop: 'auto',
                    background: 'linear-gradient(90deg, #2563eb 0%, #1e3a8a 100%)',
                    color: 'white',
                    fontWeight: 900,
                    fontSize: 20,
                    padding: '16px 0',
                    border: 'none',
                    borderRadius: 14,
                    cursor: 'pointer',
                    boxShadow: '0 2px 12px #2563eb33',
                    letterSpacing: 1,
                    transition: 'background 0.18s, transform 0.12s',
                  }}
                    onMouseOver={e => (e.currentTarget.style.background = 'linear-gradient(90deg, #1e3a8a 0%, #2563eb 100%)')}
                    onMouseOut={e => (e.currentTarget.style.background = 'linear-gradient(90deg, #2563eb 0%, #1e3a8a 100%)')}
                  >
                    Book Now
                  </button>
                </div>
              ))}
            </div>
          )}
          {/* RoomInfos Cards */}
          {offersData && Array.isArray(offersData.roomInfos) && offersData.roomInfos.length > 0 && (
            <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginTop: 18 }}>
              {offersData.roomInfos.map((room: any, idx: number) => (
                <div key={room.id || idx} style={{ background: '#f0fdf4', borderRadius: 14, boxShadow: '0 2px 8px #16a34a22', padding: 24, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start', border: '2px solid #16a34a22' }}>
                  <div style={{ fontWeight: 800, fontSize: 20, color: '#16a34a', marginBottom: 4 }}>Room #{idx + 1}</div>
                  {/* Add more room details here as needed */}
                  <pre style={{ fontSize: 14, color: '#334155', background: '#f1f5f9', borderRadius: 8, padding: 10, width: '100%', overflowX: 'auto' }}>{JSON.stringify(room, null, 2)}</pre>
                </div>
              ))}
            </div>
          )}
        </section>
        {/* Footer */}
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

export default HotelDetailsPage; 