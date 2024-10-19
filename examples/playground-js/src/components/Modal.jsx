import React, { useState } from 'react';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onStart }) => {
  const [time, setTime] = useState('10 minutes');
  const [difficulty, setDifficulty] = useState('easy');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Welcome to your coding interview.</h2>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Time Limit</label>
          <select
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="10 minutes">10 minutes</option>
            <option value="30 minutes">30 minutes</option>
            <option value="45 minutes">45 minutes</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Problem Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <button
          onClick={() => onStart(time, difficulty)}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Start
        </button>
      </div>
    </div>
  );
};