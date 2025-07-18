import React from 'react';

interface DatePickerProps {
  label: string;
}

const DatePicker: React.FC<DatePickerProps> = ({ label }) => {
  return (
    <div className="form-group">
      <label>{label}</label>
      <input type="date" />
    </div>
  );
};

export default DatePicker;
