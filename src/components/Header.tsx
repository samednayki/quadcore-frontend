import React, { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface HeaderProps {
  currency: string;
  onCurrencyChange?: (val: string) => void;
  currencyList: { code: string; name: string }[];
  nationality: string;
  onNationalityChange?: (val: string) => void;
  nationalityList: { id: string; name: string }[];
  showSelectors?: boolean;
  currencyError?: string;
  nationalityError?: string;
}

const Header: React.FC<HeaderProps> = ({
  currency,
  onCurrencyChange,
  currencyList,
  nationality,
  onNationalityChange,
  nationalityList,
  showSelectors = true,
  currencyError,
  nationalityError
}) => {
  const currencyRef = useRef<HTMLInputElement>(null);
  const nationalityRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Find display names
  const currencyObj = currencyList.find(c => c.code === currency);
  const nationalityObj = nationalityList.find(n => n.id === nationality);

  // Filtered lists (for autocomplete)
  const filteredCurrencies = currencyList.filter(c =>
    c.code.toLowerCase().includes(currency.toLowerCase()) ||
    c.name.toLowerCase().includes(currency.toLowerCase())
  );
  const filteredNationalities = nationalityList.filter(n =>
    n.id.toLowerCase().includes(nationality.toLowerCase()) ||
    n.name.toLowerCase().includes(nationality.toLowerCase())
  );

  // Blur helpers
  const handleCurrencyBlur = () => setTimeout(() => setCurrencyDropdown(false), 120);
  const handleNationalityBlur = () => setTimeout(() => setNationalityDropdown(false), 120);

  // Dropdown state (local, only for showing/hiding)
  const [currencyDropdown, setCurrencyDropdown] = React.useState(false);
  const [nationalityDropdown, setNationalityDropdown] = React.useState(false);

  return (
    <header style={{
      width: '100%',
      background: '#0a2342',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      padding: '90px 0 70px 0',
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
            style={{ height: 70, borderRadius: 16, marginRight: 28 }}
          />
          <span style={{ fontWeight: 900, fontSize: 44, color: 'white', letterSpacing: -2 }}>HotelRes</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {showSelectors ? (
            <>
              {/* Currency Autocomplete */}
              <div style={{ position: 'relative', minWidth: 90 }}>
                <input
                  ref={currencyRef}
                  type="text"
                  value={currency}
                  onChange={e => onCurrencyChange && onCurrencyChange(e.target.value.toUpperCase())}
                  onFocus={() => setCurrencyDropdown(true)}
                  onBlur={handleCurrencyBlur}
                  placeholder="Currency"
                  style={{
                    background: '#fff',
                    color: '#1e3a8a',
                    fontWeight: 700,
                    fontSize: 18,
                    border: '2px solid #e0e7ef',
                    borderRadius: 10,
                    padding: '8px 18px',
                    minWidth: 90,
                    outline: 'none',
                    boxSizing: 'border-box',
                    textAlign: 'center',
                    letterSpacing: 1
                  }}
                />
                {currencyError && (
                  <div style={{
                    position: 'absolute',
                    top: '110%',
                    left: 0,
                    right: 0,
                    background: '#fff0f0',
                    color: '#f43f5e',
                    fontWeight: 700,
                    fontSize: 14,
                    borderRadius: 8,
                    padding: '6px 10px',
                    marginTop: 2,
                    boxShadow: '0 2px 8px #f43f5e22',
                    zIndex: 100
                  }}>
                    {currencyError}
                  </div>
                )}
                {currencyDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: 48,
                    left: 0,
                    right: 0,
                    background: '#fff',
                    border: '2px solid #e0e7ef',
                    borderRadius: 10,
                    boxShadow: '0 4px 24px #2563eb22',
                    zIndex: 9999,
                    maxHeight: 220,
                    overflowY: 'auto',
                    minWidth: 90
                  }}>
                    {filteredCurrencies.length === 0 && (
                      <div style={{ padding: 10, color: '#64748b', textAlign: 'center' }}>No results</div>
                    )}
                    {filteredCurrencies.map(c => (
                      <div
                        key={c.code}
                        onClick={() => {
                          onCurrencyChange && onCurrencyChange(c.code);
                          setCurrencyDropdown(false);
                        }}
                        style={{
                          padding: '10px 18px',
                          cursor: 'pointer',
                          background: c.code === currency ? '#e0e7ef' : 'transparent',
                          color: '#1e3a8a',
                          fontWeight: 700,
                          fontSize: 18,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10
                        }}
                      >
                        <span>{c.code}</span>
                        <span style={{ color: '#64748b', fontWeight: 500, fontSize: 16 }}>{c.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Nationality Autocomplete */}
              <div style={{ position: 'relative', minWidth: 90 }}>
                <input
                  ref={nationalityRef}
                  type="text"
                  value={nationality}
                  onChange={e => onNationalityChange && onNationalityChange(e.target.value.toUpperCase())}
                  onFocus={() => setNationalityDropdown(true)}
                  onBlur={handleNationalityBlur}
                  placeholder="Nationality"
                  style={{
                    background: '#fff',
                    color: '#1e3a8a',
                    fontWeight: 700,
                    fontSize: 18,
                    border: '2px solid #e0e7ef',
                    borderRadius: 10,
                    padding: '8px 18px',
                    minWidth: 90,
                    outline: 'none',
                    boxSizing: 'border-box',
                    textAlign: 'center',
                    letterSpacing: 1
                  }}
                />
                {nationalityError && (
                  <div style={{
                    position: 'absolute',
                    top: '110%',
                    left: 0,
                    right: 0,
                    background: '#fff0f0',
                    color: '#f43f5e',
                    fontWeight: 700,
                    fontSize: 14,
                    borderRadius: 8,
                    padding: '6px 10px',
                    marginTop: 2,
                    boxShadow: '0 2px 8px #f43f5e22',
                    zIndex: 100
                  }}>
                    {nationalityError}
                  </div>
                )}
                {nationalityDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: 48,
                    left: 0,
                    right: 0,
                    background: '#fff',
                    border: '2px solid #e0e7ef',
                    borderRadius: 10,
                    boxShadow: '0 4px 24px #2563eb22',
                    zIndex: 9999,
                    maxHeight: 220,
                    overflowY: 'auto',
                    minWidth: 90
                  }}>
                    {filteredNationalities.length === 0 && (
                      <div style={{ padding: 10, color: '#64748b', textAlign: 'center' }}>No results</div>
                    )}
                    {filteredNationalities.map(n => (
                      <div
                        key={n.id}
                        onClick={() => {
                          onNationalityChange && onNationalityChange(n.id);
                          setNationalityDropdown(false);
                        }}
                        style={{
                          padding: '10px 18px',
                          cursor: 'pointer',
                          background: n.id === nationality ? '#e0e7ef' : 'transparent',
                          color: '#1e3a8a',
                          fontWeight: 700,
                          fontSize: 18,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10
                        }}
                      >
                        <span>{n.id}</span>
                        <span style={{ color: '#64748b', fontWeight: 500, fontSize: 16 }}>{n.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Show selected currency/nationality as text only */}
              <div style={{
                background: '#fff',
                color: '#1e3a8a',
                fontWeight: 700,
                fontSize: 18,
                border: '2px solid #e0e7ef',
                borderRadius: 10,
                padding: '8px 18px',
                minWidth: 90,
                textAlign: 'center',
                letterSpacing: 1
              }}>
                {currencyObj ? `${currencyObj.code} ${currencyObj.name}` : currency}
              </div>
              <div style={{
                background: '#fff',
                color: '#1e3a8a',
                fontWeight: 700,
                fontSize: 18,
                border: '2px solid #e0e7ef',
                borderRadius: 10,
                padding: '8px 18px',
                minWidth: 90,
                textAlign: 'center',
                letterSpacing: 1
              }}>
                {nationalityObj ? `${nationalityObj.id} ${nationalityObj.name}` : nationality}
              </div>
            </>
          )}
          {/* Nav */}
          <nav style={{ display: 'flex', gap: 32 }}>
            <Link to="/" className="nav-btn" style={{ color: 'white', fontWeight: 700, fontSize: 17, textDecoration: 'none', opacity: 0.92 }}>Home</Link>
            <button
              className="nav-btn"
              style={{ 
                color: 'white', 
                fontWeight: 700, 
                fontSize: 17, 
                textDecoration: 'none', 
                opacity: 0.92, 
                background: 'none', 
                border: '2px solid #fff', 
                borderRadius: 8, 
                cursor: 'pointer', 
                padding: '4px 16px', 
                margin: 0,
                transition: 'background 0.2s',
                outline: 'none',
                minWidth: 90
              }}
              onClick={() => {
                try {
                  const lastParams = localStorage.getItem('lastHotelSearchParams');
                  if (lastParams) {
                    const parsed = JSON.parse(lastParams);
                    navigate('/hotels', { state: { searchParams: parsed } });
                  } else {
                    navigate('/hotels');
                  }
                } catch {
                  navigate('/hotels');
                }
              }}
              onMouseOver={e => (e.currentTarget.style.background = '#112244')}
              onMouseOut={e => (e.currentTarget.style.background = 'none')}
            >
              Search Hotels
            </button>
            <Link to="/find-reservation" className="nav-btn" style={{ color: 'white', fontWeight: 700, fontSize: 17, textDecoration: 'none', opacity: 0.92 }}>My Reservations</Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header; 