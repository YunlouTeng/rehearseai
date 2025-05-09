'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface QuestionListProps {
  questions: string[];
  userId: string;
  onPracticeStart: (question: string) => void;
}

export default function QuestionList({ questions, userId, onPracticeStart }: QuestionListProps) {
  const [savingStates, setSavingStates] = useState<Record<number, boolean>>({});
  const [savedStates, setSavedStates] = useState<Record<number, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const handleSaveQuestion = async (questionIndex: number, questionText: string) => {
    if (!userId) {
      setError('You must be logged in to save questions.');
      return;
    }

    setError(null);
    // Update the saving state for this specific question
    setSavingStates(prev => ({ ...prev, [questionIndex]: true }));

    try {
      const { error: dbError } = await supabase
        .from('custom_questions')
        .insert({
          user_id: userId,
          question_text: questionText,
          source: 'AI-generated'
        });

      if (dbError) {
        throw new Error(`Failed to save question: ${dbError.message}`);
      }

      // Update the saved state for this question
      setSavedStates(prev => ({ ...prev, [questionIndex]: true }));
    } catch (err) {
      console.error('Error saving question:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while saving the question.');
    } finally {
      // Clear the saving state
      setSavingStates(prev => ({ ...prev, [questionIndex]: false }));
    }
  };

  const handlePracticeClick = (question: string) => {
    onPracticeStart(question);
  };

  if (questions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No questions have been generated yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold mb-4">Tailored Interview Questions</h3>
      
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md mb-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      
      <ul className="space-y-3">
        {questions.map((question, index) => (
          <li 
            key={index}
            className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <p className="text-gray-800 mb-3">{question}</p>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => handleSaveQuestion(index, question)}
                disabled={savingStates[index] || savedStates[index]}
                className={`px-3 py-1 text-sm font-medium rounded-md ${
                  savedStates[index]
                    ? 'bg-green-100 text-green-800 cursor-default'
                    : savingStates[index]
                    ? 'bg-blue-100 text-blue-800 cursor-wait'
                    : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                }`}
              >
                {savedStates[index] 
                  ? 'Saved ✓' 
                  : savingStates[index] 
                  ? 'Saving...' 
                  : 'Save Question'}
              </button>
              
              <button
                onClick={() => handlePracticeClick(question)}
                className="px-3 py-1 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Practice
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
} 