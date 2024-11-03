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

export const ScoreSlider = ({ score, label, feedback = null }) => {
  // Calculate gradient color based on score
  const getColor = (score) => {
    if (score >= 90) return '#22c55e'; // green-500
    if (score >= 70) return '#3b82f6'; // blue-500
    if (score >= 50) return '#f59e0b'; // amber-500
    return '#ef4444'; // red-500
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-lg font-bold" style={{ color: getColor(score) }}>
          {score}/100
        </span>
      </div>
      <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden relative">
        <div 
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${score}%`,
            background: `linear-gradient(to right, #ef4444 0%, #f59e0b 50%, #22c55e 100%)`,
            clipPath: `polygon(0 0, ${score}% 0, ${score}% 100%, 0 100%)`
          }}
        />
      </div>
      {feedback && (
        <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          {feedback}
        </div>
      )}
    </div>
  );
};

export const ScorecardModal = ({ 
  isOpen, 
  scores = {
    speed: { score: 95, feedback: "Excellent pace throughout the interview. Completed all tasks within time constraints." },
    accuracy: { score: 100, feedback: "Good attention to detail, handles all cases." },
    problemSolving: { score: 92, feedback: "Outstanding analytical skills and systematic approach to breaking down problems. Required 2 hints to acheive the optimal solution." },
    communication: { score: 90, feedback: "Clear articulation of thought process and good engagement throughout." },
    aggregateScore: 92,
    hintsUsed: 50
  }, 
  onClose 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-[600px] max-w-[90vw] max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-3xl font-bold text-gray-900">Interview Results</h2>
            <p className="mt-2 text-gray-600">Detailed performance breakdown and feedback</p>
          </div>

          <div className="mt-8 space-y-8">
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Performance Metrics</h3>
              
              {/* Numerical Scores */}
              <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                <ScoreSlider label="Aggregate Score" score={scores.aggregateScore} />
                <ScoreSlider label="Hints Used" score={100 - scores.hintsUsed} />
              </div>

              {/* Detailed Feedback Categories */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900">Detailed Feedback</h3>
                <div className="space-y-6">
                  <ScoreSlider 
                    label="Speed" 
                    score={scores.speed.score} 
                    feedback={scores.speed.feedback} 
                  />
                  <ScoreSlider 
                    label="Accuracy" 
                    score={scores.accuracy.score} 
                    feedback={scores.accuracy.feedback}
                  />
                  <ScoreSlider 
                    label="Problem Solving" 
                    score={scores.problemSolving.score} 
                    feedback={scores.problemSolving.feedback}
                  />
                  <ScoreSlider 
                    label="Communication" 
                    score={scores.communication.score} 
                    feedback={scores.communication.feedback}
                  />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default { SetupModal, ScorecardModal };