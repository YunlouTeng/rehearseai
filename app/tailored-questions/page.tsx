'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import ResumeUploader from '../components/ResumeUploader';
import QuestionList from '../components/QuestionList';
import AuthGuard from '../components/AuthGuard';
import { generateMockQuestions, generateTailoredQuestions } from '@/lib/openai';

export default function TailoredQuestionsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [resumeText, setResumeText] = useState<string | null>(null);
  const [resumeFile, setResumeFile] = useState<{ url: string; name: string } | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [questions, setQuestions] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResumeTextExtracted = (text: string, fileUrl: string, filename: string) => {
    setResumeText(text);
    setResumeFile({ url: fileUrl, name: filename });
  };

  const handleGenerateQuestions = async () => {
    if (!resumeText) {
      setError('Please upload your resume first.');
      return;
    }

    if (!jobDescription.trim()) {
      setError('Please enter a job description.');
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      let generatedQuestions;
      
      // Use the real API if OPENAI_API_KEY is available, otherwise use mock data
      if (process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
        generatedQuestions = await generateTailoredQuestions(resumeText, jobDescription);
      } else {
        // Use mock data for development or when API key is not available
        generatedQuestions = generateMockQuestions(resumeText, jobDescription);
      }
      
      setQuestions(generatedQuestions);
    } catch (err) {
      console.error('Error generating questions:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while generating questions.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePracticeStart = (question: string) => {
    // Store the selected question in localStorage to use in practice page
    localStorage.setItem('practiceQuestion', question);
    router.push('/practice');
  };

  return (
    <AuthGuard>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Tailored Interview Questions</h1>
        <p className="text-gray-600 mb-8">
          Upload your resume and paste a job description to generate personalized interview questions
          tailored to your experience and the specific role.
        </p>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="mb-6">
            <ResumeUploader 
              onResumeTextExtracted={handleResumeTextExtracted} 
              userId={user?.id || ''}
            />
          </div>

          {resumeFile && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md mb-6">
              <p className="text-sm text-green-700">
                Resume uploaded: <strong>{resumeFile.name}</strong>
              </p>
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Job Description</h3>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={8}
            />
          </div>

          <button
            onClick={handleGenerateQuestions}
            disabled={isGenerating || !resumeText || !jobDescription.trim()}
            className={`px-4 py-2 font-medium text-white rounded-md ${
              isGenerating || !resumeText || !jobDescription.trim()
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isGenerating ? 'Generating Questions...' : 'Generate Tailored Questions'}
          </button>
        </div>

        {error && (
          <div className="p-4 mb-6 bg-red-50 border border-red-100 rounded-lg">
            <p className="text-red-800">Error: {error}</p>
          </div>
        )}

        {questions.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <QuestionList 
              questions={questions} 
              userId={user?.id || ''} 
              onPracticeStart={handlePracticeStart}
            />
          </div>
        )}
      </div>
    </AuthGuard>
  );
} 