import React from 'react';
import SearchForm from './SearchForm';
import PopularDestinations from './PopularDestinations';

const SearchPage: React.FC = () => {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center relative"
      style={{
        backgroundImage:
          "url('https://images.pexels.com/photos/50594/sea-bay-waterfront-beach-50594.jpeg')"
      }}
    >
      {/* Glassmorphism Arama Kutusu */}
      <div className="w-full max-w-4xl mt-32 mb-12">
        <div className="backdrop-blur-md bg-white/60 rounded-2xl shadow-2xl p-8">
          <SearchForm />
        </div>
      </div>

      {/* Popüler Destinasyonlar ve diğer içerikler */}
      <div className="w-full bg-white/80 py-16">
        <div className="container-custom">
          <PopularDestinations />
        </div>
      </div>
    </div>
  );
};

export default SearchPage; 