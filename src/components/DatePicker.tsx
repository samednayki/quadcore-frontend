import React, { useState, useRef, useEffect } from 'react';

interface DatePickerProps {
  label: string;
}

const DatePicker: React.FC<DatePickerProps> = ({ label }) => {
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
      <label>{label}</label>
      <button type="button" onClick={() => setIsOpen((prev) => !prev)} style={{ marginLeft: 8 }}>
        Tarih Seç
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
          }}
        >
          <input type="date" />
        </div>
      )}
    </div>
  );
};

export default DatePicker;
