'use client';

import React, { useState } from 'react';

// Array of interview questions
const BEHAVIORAL_QUESTIONS = [
  "Tell me about a time you faced a challenge and how you overcame it.",
  "Describe a situation where you had to work with a difficult team member.",
  "Give an example of when you showed leadership skills.",
  "Tell me about a time you failed and what you learned from it.",
  "How do you handle stress and pressure?",
  "Describe a time when you had to make a difficult decision.",
  "Tell me about a time you received negative feedback and how you responded.",
  "Give an example of a goal you achieved and how you did it.",
  "How do you prioritize your work when you have multiple deadlines?",
  "Tell me about a time you went above and beyond for a project."
];

const TECHNICAL_QUESTIONS = [
  "What is your approach to debugging a complex issue?",
  "Explain the difference between synchronous and asynchronous programming.",
  "How do you ensure code quality in your projects?",
  "Describe your experience with version control systems.",
  "How do you stay updated with the latest technologies?",
  "What's your approach to testing your code?",
  "Explain a complex technical concept in simple terms.",
  "How would you optimize a slow-performing application?",
  "Describe a time when you had to learn a new technology quickly.",
  "What considerations do you take into account for secure coding practices?"
];

interface QuestionGeneratorProps {
  onSelectQuestion: (question: string) => void;
}

export default function QuestionGenerator({ onSelectQuestion }: QuestionGeneratorProps) {
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [questionType, setQuestionType] = useState<'behavioral' | 'technical' | 'both'>('both');
  
  const generateRandomQuestion = () => {
    let questions: string[] = [];
    
    if (questionType === 'behavioral' || questionType === 'both') {
      questions = [...questions, ...BEHAVIORAL_QUESTIONS];
    }
    
    if (questionType === 'technical' || questionType === 'both') {
      questions = [...questions, ...TECHNICAL_QUESTIONS];
    }
    
    const randomIndex = Math.floor(Math.random() * questions.length);
    const newQuestion = questions[randomIndex];
    setCurrentQuestion(newQuestion);
    onSelectQuestion(newQuestion);
  };
  
  return (
    <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-4">Interview Question Generator</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Question Type
        </label>
        <div className="flex space-x-4">
          <button
            onClick={() => setQuestionType('behavioral')}
            className={`px-4 py-2 rounded-md ${
              questionType === 'behavioral'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            Behavioral
          </button>
          <button
            onClick={() => setQuestionType('technical')}
            className={`px-4 py-2 rounded-md ${
              questionType === 'technical'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            Technical
          </button>
          <button
            onClick={() => setQuestionType('both')}
            className={`px-4 py-2 rounded-md ${
              questionType === 'both'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            Both
          </button>
        </div>
      </div>
      
      <button
        onClick={generateRandomQuestion}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors mb-6"
      >
        Generate Random Question
      </button>
      
      {currentQuestion && (
        <div className="bg-gray-100 p-5 rounded-lg">
          <h3 className="text-lg font-medium mb-2">Your Question:</h3>
          <p className="text-xl">{currentQuestion}</p>
        </div>
      )}
    </div>
  );
} 