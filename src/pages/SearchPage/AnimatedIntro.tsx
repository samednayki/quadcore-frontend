import React, { useEffect, useState } from 'react';

const messages = [
  'HotelRes',
  "The world's best hotel booking site",
  'Find your dream stay',
  'Book with confidence',
];

const gradientClasses = [
  'bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500',
  'bg-gradient-to-r from-green-400 via-blue-500 to-purple-500',
  'bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600',
  'bg-gradient-to-r from-purple-500 via-blue-400 to-green-400',
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
    <div className="flex justify-center items-center min-h-[90px] select-none overflow-x-auto">
      <span
        className={`text-4xl md:text-6xl font-extrabold drop-shadow-2xl transition-opacity duration-400 ease-in-out 
          ${show ? 'opacity-100' : 'opacity-0'} 
          ${gradientClasses[index]} 
          bg-clip-text text-transparent animate-gradient-x whitespace-nowrap`}
        style={{ letterSpacing: '2px' }}
      >
        {messages[index]}
      </span>
    </div>
  );
};

export default AnimatedIntro; 