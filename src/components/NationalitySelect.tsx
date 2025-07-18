import React from 'react';

const NationalitySelect: React.FC = () => {
  return (
    <div className="form-group">
      <label>Uyruk</label>
      <select>
        <option value="TR">Türkiye</option>
        <option value="DE">Almanya</option>
        <option value="GB">İngiltere</option>
        <option value="US">ABD</option>
      </select>
    </div>
  );
};

export default NationalitySelect;
