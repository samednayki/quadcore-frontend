import React from 'react';

const CurrencySelect: React.FC = () => {
  return (
    <div className="form-group">
      <label>Para Birimi</label>
      <select>
        <option value="EUR">EUR</option>
        <option value="GBP">GBP</option>
        <option value="USD">USD</option>
        <option value="TRY">TRY</option>
      </select>
    </div>
  );
};

export default CurrencySelect;
