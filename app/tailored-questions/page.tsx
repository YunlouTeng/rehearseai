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
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

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
    setDebugInfo(null);
    setIsGenerating(true);

    try {
      // Check if we're in Chrome (for debugging)
      const isChrome = typeof window !== 'undefined' && 
        window.navigator.userAgent.indexOf("Chrome") > -1 && 
        window.navigator.userAgent.indexOf("Safari") > -1;
      
      if (isChrome) {
        setDebugInfo('Using Chrome browser');
      }
      
      // Check OpenAI API key availability
      const openAiKeyAvailable = typeof window !== 'undefined' && 
        window.REHEARSEAI_CONFIG?.openai?.apiKey;
      setDebugInfo(prev => `${prev || ''}\nOpenAI API key available: ${!!openAiKeyAvailable}`);
      
      // Generate questions (will automatically use mock data if API key is not available)
      const generatedQuestions = await generateTailoredQuestions(resumeText, jobDescription);
      
      if (generatedQuestions.length === 0) {
        setError('No questions were generated. Please try again with a more detailed job description.');
        return;
      }
      
      setQuestions(generatedQuestions);
      setDebugInfo(prev => `${prev || ''}\nSuccessfully generated ${generatedQuestions.length} questions`);
    } catch (err) {
      console.error('Error generating questions:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while generating questions.');
      
      // Add more helpful debug info
      if (err instanceof Error) {
        setDebugInfo(`Error details: ${err.message}\n${err.stack || ''}`);
      }
      
      // Automatically fall back to mock questions on error
      try {
        const mockQuestions = generateMockQuestions(resumeText, jobDescription);
        setQuestions(mockQuestions);
        setDebugInfo(prev => `${prev || ''}\nFell back to sample questions due to error`);
        setError("Couldn't connect to OpenAI API. Using sample questions instead.");
      } catch (mockErr) {
        console.error('Error generating mock questions:', mockErr);
      }
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
            <p className="text-red-800">{error}</p>
            {debugInfo && (
              <details className="mt-2">
                <summary className="text-sm text-red-600 cursor-pointer">Debug information</summary>
                <pre className="mt-2 p-2 bg-gray-100 text-xs overflow-auto rounded">{debugInfo}</pre>
              </details>
            )}
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