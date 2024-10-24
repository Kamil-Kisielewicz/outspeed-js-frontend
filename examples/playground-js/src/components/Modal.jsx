import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

// Base Modal Component for shared styling and structure
const BaseModal = ({ isOpen, children }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-xl shadow-xl w-[480px] max-w-[90vw]">
        {children}
      </div>
    </div>
  );
};

// Setup Modal Component
export const SetupModal = ({ isOpen, onStart, hasStarted, time, setTime, difficulty, setDifficulty, isSetupModalLoading, setIsSetupModalLoading }) => {

  const handleStart = async () => {
    setIsSetupModalLoading(true);
    try {
      await onStart(time, difficulty);
      if (hasStarted) {
        setIsSetupModalLoading(false);
      }
    } catch (error) {
      console.error('Error starting interview:', error);
      setIsLoading(false);
    }
  };

  return (
    <BaseModal isOpen={isOpen}>
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Welcome to your coding interview</h2>
          <p className="mt-2 text-gray-600">Select your preferences to begin the interview.</p>
        </div>
      
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Limit
            </label>
            <select
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              disabled={isSetupModalLoading}
            >
              <option value="10 minutes">10 minutes</option>
              <option value="30 minutes">30 minutes</option>
              <option value="45 minutes">45 minutes</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Problem Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              disabled={isSetupModalLoading}
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
              <option value="Random">Random</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleStart}
          disabled={isSetupModalLoading}
          className={`
            w-full p-4 rounded-lg font-medium text-white
            flex items-center justify-center gap-2
            transition-colors
            ${isSetupModalLoading 
              ? 'bg-blue-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'}
          `}
        >
          {isSetupModalLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Initializing Interview...
            </>
          ) : (
            'Start Interview'
          )}
        </button>
            
        {isSetupModalLoading && (
          <p className="text-sm text-gray-600 text-center">
            Please wait while we set up your interview session...
          </p>
        )}
      </div>
    </BaseModal>
  );
};

// Scorecard Modal Component
export const ScorecardModal = ({ isOpen, score, feedback, onClose }) => {
  const scoreColors = {
    'Strong Hire': 'text-green-600',
    'Hire': 'text-blue-600',
    'No Hire': 'text-orange-600',
    'Strong No Hire': 'text-red-600'
  };

  const convertScore = (score) => {
    if (score >= 90.0) {
      return 'Strong Hire';
    }
    else if (70.0 <= score < 90.0) {
      return 'Hire';
    }
    else if (30.0 <= score < 70.0) {
      return 'No Hire';
    }
    else {
      return 'Strong No Hire';
    }
  };

  return (
    <BaseModal isOpen={isOpen}>
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Interview Feedback</h2>
          <div className={`mt-6 text-4xl font-bold ${scoreColors[convertScore(score)]} text-center`}>
            {convertScore(score)}
          </div>
        </div>

        <div className="mt-4 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Interviewer Notes</h3>
          <div className="prose max-w-none">
            <p className="text-gray-600 whitespace-pre-wrap">
              {feedback}
            </p>
          </div>
        </div>

        {/* <button
          onClick={onClose}
          className="w-full p-4 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          Close
        </button> */}
      </div>
    </BaseModal>
  );
};

export default { SetupModal, ScorecardModal };