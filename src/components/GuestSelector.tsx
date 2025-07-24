import React, { useState, useRef, useEffect } from 'react';

const GuestSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="form-group" ref={dropdownRef} style={{ position: 'relative' }}>
      <button type="button" onClick={() => setIsOpen((prev) => !prev)}>
        Misafir/ODA Seç
      </button>
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            background: '#fff',
            border: '1px solid #ccc',
            zIndex: 1000,
            padding: 12,
            marginTop: 4,
            minWidth: 200,
          }}
        >
          <label>Yetişkin Sayısı</label>
          <input type="number" min={1} max={10} defaultValue={2} />
          <br />
          <label>Çocuk Sayısı</label>
          <input type="number" min={0} max={5} defaultValue={0} />
          {/* Çocuk yaşları için dinamik inputlar endpoint bağlanınca eklenecek */}
        </div>
      )}
    </div>
  );
};

export default GuestSelector;
