import React from 'react';
import SearchForm from './SearchForm';
import PopularDestinations from './PopularDestinations';
import AnimatedIntro from './AnimatedIntro';

const SearchPage: React.FC = () => {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center relative"
      style={{
        backgroundImage:
          "url('https://images.pexels.com/photos/50594/sea-bay-waterfront-beach-50594.jpeg')"
      }}
    >
      {/* Hero overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-transparent z-0"></div>
      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-4xl mt-40 mb-16">
        <AnimatedIntro />
        <div className="w-full mt-8 shadow-2xl rounded-2xl backdrop-blur-md bg-white/70">
          <SearchForm />
        </div>
      </div>
      {/* Popüler Destinasyonlar ve diğer içerikler */}
      <div className="w-full bg-white/80 py-16 relative z-10">
        <div className="container-custom">
          <PopularDestinations />
        </div>
      </div>
    </div>
  );
};

export default SearchPage; 