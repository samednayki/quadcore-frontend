import React, { useEffect, useState } from 'react';

const messages = [
  'HotelRes',
  "The world's best hotel booking site",
  'Find your dream stay',
  'Book with confidence',
];

const colorClasses = [
  'text-blue-400',
  'text-purple-500',
  'text-green-500',
  'text-orange-400',
];

const AnimatedIntro: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    const showTimeout = setTimeout(() => setShow(false), 1800); // 1.8s göster
    const hideTimeout = setTimeout(() => {
      setIndex((prev) => (prev + 1) % messages.length);
      setShow(true);
    }, 2200); // 0.4s fade out, sonra değiştir
    return () => {
      clearTimeout(showTimeout);
      clearTimeout(hideTimeout);
    };
  }, [index]);

  return (
    <div className="flex justify-center items-center min-h-[60px] select-none">
      <span
        className={`text-3xl md:text-4xl font-bold drop-shadow-lg transition-opacity duration-400 ease-in-out ${
          show ? 'opacity-100' : 'opacity-0'
        } ${colorClasses[index]}`}
        style={{ letterSpacing: '1px' }}
      >
        {messages[index]}
      </span>
    </div>
  );
};

export default AnimatedIntro; 