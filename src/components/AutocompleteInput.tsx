import React from 'react';

interface AutocompleteInputProps {
  label: string;
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({ label }) => {
  return (
    <div className="form-group">
      <label>{label}</label>
      <input type="text" placeholder={label} />
    </div>
  );
};

export default AutocompleteInput;
