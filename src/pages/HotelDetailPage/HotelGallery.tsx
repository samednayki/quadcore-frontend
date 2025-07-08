import React, { useState } from 'react';

interface HotelGalleryProps {
  images: string[];
}

const HotelGallery: React.FC<HotelGalleryProps> = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div className="space-y-4">
      {/* Ana resim */}
      <div className="relative">
        <img
          src={images[selectedImage]}
          alt="Otel"
          className="w-full h-96 object-cover rounded-lg"
        />
        {images.length > 1 && (
          <div className="absolute inset-0 flex items-center justify-between p-4">
            <button
              onClick={() => setSelectedImage(prev => prev > 0 ? prev - 1 : images.length - 1)}
              className="w-10 h-10 bg-white bg-opacity-80 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all"
            >
              ←
            </button>
            <button
              onClick={() => setSelectedImage(prev => prev < images.length - 1 ? prev + 1 : 0)}
              className="w-10 h-10 bg-white bg-opacity-80 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all"
            >
              →
            </button>
          </div>
        )}
      </div>

      {/* Küçük resimler */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`relative overflow-hidden rounded-lg ${
                selectedImage === index ? 'ring-2 ring-primary-500' : ''
              }`}
            >
              <img
                src={image}
                alt={`Otel ${index + 1}`}
                className="w-full h-20 object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default HotelGallery; 