'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import QuestionGenerator from '../components/QuestionGenerator';
import VideoRecorder from '../components/VideoRecorder';
import FeedbackForm from '../components/FeedbackForm';
import { supabase, isSupabaseMock } from '../../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import AuthGuard from '../components/AuthGuard';

enum PracticeStep {
  QUESTION_SELECTION,
  RECORDING,
  FEEDBACK,
  SAVING,
  COMPLETE
}

// For development/testing without Supabase
const useMockStorage = false;

export default function PracticePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<PracticeStep>(PracticeStep.QUESTION_SELECTION);
  const [selectedQuestion, setSelectedQuestion] = useState<string>('');
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<string>('');
  
  // Handle question selection
  const handleQuestionSelect = (question: string) => {
    setSelectedQuestion(question);
    setCurrentStep(PracticeStep.RECORDING);
  };
  
  // Handle recording completion
  const handleRecordingComplete = (blob: Blob) => {
    console.log('Recording complete, blob size:', blob.size);
    setVideoBlob(blob);
    setCurrentStep(PracticeStep.FEEDBACK);
  };
  
  // Handle feedback submission
  const handleFeedbackSubmit = async (submittedRating: number, submittedNotes: string) => {
    setRating(submittedRating);
    setNotes(submittedNotes);
    setCurrentStep(PracticeStep.SAVING);
    
    try {
      setIsUploading(true);
      
      // For development, bypass Supabase if mock mode is enabled
      if (useMockStorage) {
        console.log('Using mock storage mode - bypassing Supabase');
        setDebugInfo('Using mock storage mode');
        
        // Wait a bit to simulate network delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Mock successful saving
        setCurrentStep(PracticeStep.COMPLETE);
        return;
      }
      
      // Check if we're using a mock client
      if (isSupabaseMock) {
        setDebugInfo('Using mock Supabase client. Please set up your Supabase credentials in .env.local');
        throw new Error('Supabase credentials not configured properly');
      }
      
      // Check if user is authenticated
      if (!user || !user.id) {
        throw new Error('You must be logged in to save recordings');
      }
      
      // Generate unique file name
      const timestamp = Date.now();
      const fileName = `recordings/${user.id}/${timestamp}.webm`;
      
      // Upload video to Supabase Storage
      if (!videoBlob) {
        throw new Error('No video recording found');
      }
      
      console.log('Uploading to Supabase storage, blob size:', videoBlob.size);
      console.log('Bucket name: interview-recordings');
      console.log('File path:', fileName);
      
      try {
        // First, check if the bucket exists
        const { data: buckets, error: bucketError } = await supabase
          .storage
          .listBuckets();
        
        if (bucketError) {
          console.error('Error listing buckets:', bucketError);
          setDebugInfo(`Error listing buckets: ${bucketError.message}`);
          throw bucketError;
        }
        
        console.log('Available buckets:', buckets?.map(b => b.name));
        const bucketExists = buckets?.some(b => b.name === 'interview-recordings');
        
        if (!bucketExists) {
          const errorMsg = 'Storage bucket "interview-recordings" not found. Please create it in your Supabase project.';
          console.error(errorMsg);
          setDebugInfo(errorMsg);
          throw new Error(errorMsg);
        }
        
        // Upload the file
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('interview-recordings')
          .upload(fileName, videoBlob, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (uploadError) {
          console.error('Storage upload error:', uploadError);
          setDebugInfo(`Storage error: ${JSON.stringify(uploadError)}`);
          throw uploadError;
        }
        
        console.log('Upload success:', uploadData);
        
        // Get the public URL for the uploaded video
        const { data: urlData } = supabase.storage
          .from('interview-recordings')
          .getPublicUrl(fileName);
        
        if (!urlData) {
          throw new Error('Failed to get public URL');
        }
        
        const videoUrl = urlData.publicUrl;
        console.log('Video URL:', videoUrl);
        
        try {
          // Check if the table exists
          const { error: tableError } = await supabase
            .from('practice_sessions')
            .select('count')
            .limit(1);
            
          if (tableError) {
            console.error('Error checking table:', tableError);
            setDebugInfo(`Table error: ${JSON.stringify(tableError)}`);
            throw new Error(`Database table "practice_sessions" might not exist. Error: ${tableError.message}`);
          }
          
          // Save metadata to Supabase database
          const { error: insertError } = await supabase
            .from('practice_sessions')
            .insert({
              question: selectedQuestion,
              rating: submittedRating,
              notes: submittedNotes,
              video_url: videoUrl,
              user_id: user.id.toString(),
              created_at: new Date().toISOString()
            });
          
          if (insertError) {
            console.error('Database insert error:', insertError);
            setDebugInfo(`Database error: ${JSON.stringify(insertError)}`);
            throw insertError;
          }
          
          console.log('Database insert success');
          
          // All steps completed successfully
          setCurrentStep(PracticeStep.COMPLETE);
        } catch (dbError: any) {
          console.error('Database operation failed:', dbError);
          setDebugInfo(`Database operation failed: ${dbError.message || 'Unknown error'}`);
          throw dbError;
        }
      } catch (storageError: any) {
        console.error('Storage operation failed:', storageError);
        const errorDetails = typeof storageError === 'object' ? 
                            JSON.stringify(storageError) : 
                            storageError?.toString();
        setDebugInfo(`Storage operation failed: ${errorDetails}`);
        throw storageError;
      }
    } catch (err: any) {
      console.error('Error saving session:', err);
      const errorMessage = err?.message || 'Unknown error';
      const errorDetails = typeof err === 'object' ? 
                          JSON.stringify(err) : 
                          err?.toString();
      setError(`There was an error saving your session: ${errorMessage}`);
      setDebugInfo(`Full error details: ${errorDetails}`);
      setCurrentStep(PracticeStep.FEEDBACK);
    } finally {
      setIsUploading(false);
    }
  };
  
  // Handle restart
  const handleRestart = () => {
    setCurrentStep(PracticeStep.QUESTION_SELECTION);
    setSelectedQuestion('');
    setVideoBlob(null);
    setRating(0);
    setNotes('');
    setError('');
    setDebugInfo('');
  };
  
  // Toggle mock storage mode (useful for development)
  const toggleMockMode = () => {
    window.location.reload();
  };
  
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8 text-center">Practice Interview</h1>
          <p className="text-center mb-8 max-w-xl mx-auto">
            Record yourself answering interview questions, then review and rate your performance.
            Your recordings will be saved so you can track your improvement over time.
          </p>
          <VideoRecorder />
        </div>
      </div>
    </AuthGuard>
  );
} 