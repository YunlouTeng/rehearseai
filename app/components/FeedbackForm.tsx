'use client';

import React, { useState } from 'react';

interface FeedbackFormProps {
  onSubmit: (rating: number, notes: string) => void;
}

export default function FeedbackForm({ onSubmit }: FeedbackFormProps) {
  const [rating, setRating] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(rating, notes);
  };

  return (
    <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-4">Evaluate Your Performance</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rate your delivery (1-5)
          </label>
          <div className="flex gap-4">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-colors
                  ${rating === value
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
        
        <div className="mb-6">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            Reflection Notes
          </label>
          <textarea
            id="notes"
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="What went well? What could you improve? Any specific things to work on next time?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          ></textarea>
        </div>
        
        <button
          type="submit"
          disabled={rating === 0}
          className={`w-full py-3 rounded-lg font-medium 
            ${rating === 0 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700 transition-colors'
            }`}
        >
          Save Feedback
        </button>
      </form>
    </div>
  );
} 