import React from 'react';

const GuestSelector: React.FC = () => {
  return (
    <div className="form-group">
      <label>Yetişkin Sayısı</label>
      <input type="number" min={1} max={10} defaultValue={2} />
      <label>Çocuk Sayısı</label>
      <input type="number" min={0} max={5} defaultValue={0} />
      {/* Çocuk yaşları için dinamik inputlar endpoint bağlanınca eklenecek */}
    </div>
  );
};

export default GuestSelector;
