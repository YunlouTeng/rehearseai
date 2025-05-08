'use client';

import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import RecordRTC from 'recordrtc';

type RecordingStatus = 'idle' | 'recording' | 'recorded' | 'uploading' | 'success' | 'error';

export default function VideoRecorder() {
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const [question, setQuestion] = useState<string>('');
  const [rating, setRating] = useState<number>(3);
  const [notes, setNotes] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [savedVideoUrl, setSavedVideoUrl] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const recorderRef = useRef<RecordRTC | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Sample interview questions
  const questions = [
    "Tell me about a time you faced a difficult challenge and how you overcame it.",
    "What are your greatest strengths and weaknesses?",
    "Why do you want to work for this company?",
    "Describe a situation where you had to work with a difficult team member.",
    "How do you handle stress and pressure?",
    "Where do you see yourself in 5 years?",
  ];

  // Generate a random question
  const generateQuestion = () => {
    const randomIndex = Math.floor(Math.random() * questions.length);
    setQuestion(questions[randomIndex]);
  };

  // Initialize with a random question
  useEffect(() => {
    generateQuestion();
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (videoURL) {
        URL.revokeObjectURL(videoURL);
      }
      if (recorderRef.current) {
        recorderRef.current.destroy();
      }
    };
  }, [videoURL]);

  // Start recording
  const startRecording = async () => {
    setStatus('recording');
    setError(null);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      const recorder = new RecordRTC(stream, {
        type: 'video',
        mimeType: 'video/webm;codecs=vp8',
        recorderType: RecordRTC.MediaStreamRecorder,
        disableLogs: true,
        videoBitsPerSecond: 128000,
        audioBitsPerSecond: 128000
      });
      
      recorderRef.current = recorder;
      recorder.startRecording();
      
    } catch (err) {
      console.error('Error accessing media devices:', err);
      setError('Could not access camera or microphone');
      setStatus('error');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (recorderRef.current) {
      recorderRef.current.stopRecording(() => {
        const blob = recorderRef.current?.getBlob();
        if (blob) {
          const url = URL.createObjectURL(blob);
          
          setVideoBlob(blob);
          setVideoURL(url);
          setStatus('recorded');
          
          if (videoRef.current) {
            videoRef.current.srcObject = null;
            videoRef.current.src = url;
          }
        }
      });
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };

  // Upload video to Supabase
  const uploadVideo = async () => {
    if (!videoBlob) {
      setError('No video recorded');
      return;
    }
    
    setStatus('uploading');
    setError(null);
    
    try {
      // Get current user ID first
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to save recordings');
      }
      
      const userId = user.id;
      
      // Create the user folder if it doesn't exist (this is just a placeholder - folders are created automatically)
      // We'll use the correct path structure: recordings/userId/
      const userFolderPath = `recordings/${userId}/`;
      
      // Generate a unique filename with proper path structure
      const timestamp = Date.now();
      const filename = `${timestamp}-${uuidv4().substring(0, 8)}.webm`; // Add timestamp for better sorting
      const filePath = `${userFolderPath}${filename}`; // Complete path: recordings/userId/filename.webm
      
      console.log(`Uploading to path: ${filePath}`);
      
      // Upload the video to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('interview-recordings')
        .upload(filePath, videoBlob, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'video/webm'
        });
      
      // Update progress manually since onUploadProgress is not available in this version
      setUploadProgress(100);
      
      if (uploadError) {
        throw new Error(uploadError.message);
      }
      
      // Get the public URL for the uploaded video
      const { data: publicUrlData } = supabase.storage
        .from('interview-recordings')
        .getPublicUrl(filePath);
      
      const publicUrl = publicUrlData.publicUrl;
      setSavedVideoUrl(publicUrl);
      
      // Save metadata to database
      const { data, error: dbError } = await supabase
        .from('practice_sessions')
        .insert([
          {
            question,
            rating,
            notes,
            video_url: publicUrl,
            user_id: userId
          }
        ]);
      
      if (dbError) {
        throw new Error(dbError.message);
      }
      
      setStatus('success');
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setStatus('error');
    }
  };

  // Reset everything and start over
  const reset = () => {
    setStatus('idle');
    setError(null);
    setVideoBlob(null);
    if (videoURL) {
      URL.revokeObjectURL(videoURL);
      setVideoURL(null);
    }
    setSavedVideoUrl(null);
    setUploadProgress(0);
    generateQuestion();
    if (recorderRef.current) {
      recorderRef.current.destroy();
      recorderRef.current = null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Practice Question:</h2>
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
          <p>{question}</p>
        </div>
        <button
          onClick={generateQuestion}
          className="mt-2 text-sm text-blue-600 hover:text-blue-800"
        >
          Generate New Question
        </button>
      </div>

      <div className="mb-6 bg-black aspect-video rounded-lg overflow-hidden flex items-center justify-center">
        {status === 'idle' ? (
          <div className="text-white text-center">
            <p>Camera preview will appear here</p>
            <p className="text-sm mt-2">Click "Start Recording" to begin</p>
          </div>
        ) : (
          <video 
            ref={videoRef} 
            autoPlay={status === 'recording'} 
            controls={status === 'recorded' || status === 'success'} 
            className="w-full h-full"
          />
        )}
      </div>

      <div className="flex justify-center gap-4 mb-6">
        {status === 'idle' && (
          <button
            onClick={startRecording}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Start Recording
          </button>
        )}

        {status === 'recording' && (
          <button
            onClick={stopRecording}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Stop Recording
          </button>
        )}

        {status === 'recorded' && (
          <>
            <button
              onClick={startRecording}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Re-record
            </button>
            <button
              onClick={() => uploadVideo()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save Recording
            </button>
          </>
        )}

        {(status === 'success' || status === 'error') && (
          <button
            onClick={reset}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Record Another Response
          </button>
        )}
      </div>

      {status === 'recorded' && (
        <div className="mb-6 space-y-4">
          <div>
            <label htmlFor="rating" className="block mb-1 font-medium">
              How would you rate your answer? (1-5)
            </label>
            <input
              type="range"
              id="rating"
              min="1"
              max="5"
              value={rating}
              onChange={(e) => setRating(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-sm">
              <span>Poor</span>
              <span>Excellent</span>
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="block mb-1 font-medium">
              Notes (What went well? What could be improved?)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 border rounded-md"
              rows={4}
            />
          </div>
        </div>
      )}

      {status === 'uploading' && (
        <div className="mb-6">
          <p className="mb-2">Uploading: {uploadProgress}%</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {status === 'success' && (
        <div className="p-4 bg-green-50 border border-green-100 rounded-lg mb-6">
          <p className="text-green-800 mb-2">
            ✓ Your practice session has been saved successfully!
          </p>
          {savedVideoUrl && (
            <p className="text-sm">
              Video URL: <a href={savedVideoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{savedVideoUrl}</a>
            </p>
          )}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-lg mb-6">
          <p className="text-red-800">Error: {error}</p>
        </div>
      )}
    </div>
  );
} 