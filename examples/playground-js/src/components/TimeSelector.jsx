import React from 'react';

const TimeSelector = ({ selectedTime, onTimeChange, disabled }) => {
  const timeOptions = [
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 45, label: '45 minutes' },
    { value: 60, label: '1 hour' },
  ];

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Time Limit
      </label>
      <select
        value={selectedTime}
        onChange={(e) => onTimeChange(parseInt(e.target.value, 10))}
        className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        disabled={disabled}
      >
        {timeOptions.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TimeSelector;