'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import AuthGuard from '../components/AuthGuard';

interface PracticeSession {
  id: number;
  question: string;
  rating: number;
  notes: string;
  video_url: string;
  created_at: string;
  user_id: string;
}

export default function HistoryPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [expandedSession, setExpandedSession] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  
  useEffect(() => {
    async function fetchSessions() {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('practice_sessions')
          .select('*')
          .eq('user_id', user.id.toString())
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        setSessions(data || []);
      } catch (err) {
        console.error('Error fetching practice sessions:', err);
        setError('Failed to load your practice history. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchSessions();
  }, [user]);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Toggle session expansion
  const toggleSession = (id: number) => {
    if (expandedSession === id) {
      setExpandedSession(null);
    } else {
      setExpandedSession(id);
    }
  };
  
  // Delete a session
  const deleteSession = async (id: number) => {
    if (!confirm('Are you sure you want to delete this practice session? This action cannot be undone.')) {
      return;
    }
    
    try {
      setIsDeleting(id);
      
      // Find the session to get the video_url
      const sessionToDelete = sessions.find(session => session.id === id);
      
      if (sessionToDelete && sessionToDelete.video_url) {
        try {
          // Extract file path from URL. Example: https://<project>.supabase.co/storage/v1/object/public/interview-recordings/recordings/user_id/filename.webm
          // We need to extract "recordings/user_id/filename.webm"
          const urlParts = sessionToDelete.video_url.split('/interview-recordings/');
          if (urlParts.length > 1) {
            const filePath = urlParts[1];
            const { error: storageError } = await supabase.storage
              .from('interview-recordings')
              .remove([filePath]);
            
            if (storageError) {
              // Log the error, but proceed with deleting the database record
              console.error('Error deleting video from storage:', storageError);
              // Optionally, you could set a different error message for the user here
            }
          } else {
            console.warn('Could not parse file path from video_url:', sessionToDelete.video_url);
          }
        } catch (storageErr) {
          console.error('Exception during storage deletion:', storageErr);
        }
      }
      
      // Delete the metadata from the database
      const { error: dbError } = await supabase
        .from('practice_sessions')
        .delete()
        .eq('id', id.toString())
        .eq('user_id', user?.id || '');
      
      if (dbError) {
        throw dbError;
      }
      
      // Update the sessions list after successful deletion
      setSessions((prevSessions) => prevSessions.filter(session => session.id !== id));
    } catch (err) {
      console.error('Error deleting practice session:', err);
      setError('Failed to delete the practice session. Please try again later.');
    } finally {
      setIsDeleting(null);
    }
  };
  
  return (
    <AuthGuard>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Practice History</h1>
          <Link
            href="/practice"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            New Practice Session
          </Link>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
          </div>
        )}
        
        {isLoading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading your practice history...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">No Practice Sessions Yet</h2>
            <p className="text-gray-600 mb-6">
              You haven't recorded any practice sessions. Start practicing to build your history!
            </p>
            <Link
              href="/practice"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Start Practicing
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {sessions.map((session) => (
              <div key={session.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div 
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleSession(session.id)}
                >
                  <div className="flex justify-between">
                    <div>
                      <h2 className="text-xl font-semibold mb-2 pr-10">{session.question}</h2>
                      <p className="text-gray-500">{formatDate(session.created_at)}</p>
                    </div>
                    <div className="flex items-center">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            xmlns="http://www.w3.org/2000/svg"
                            className={`h-5 w-5 ${
                              star <= session.rating ? 'text-yellow-500' : 'text-gray-300'
                            }`}
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                            />
                          </svg>
                        ))}
                      </div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-6 w-6 ml-4 transform transition-transform ${
                          expandedSession === session.id ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                
                {expandedSession === session.id && (
                  <div className="p-6 pt-0 border-t border-gray-100">
                    {session.video_url && (
                      <div className="mb-6">
                        <h3 className="text-lg font-medium mb-3">Your Recording</h3>
                        <video 
                          src={session.video_url} 
                          controls 
                          className="w-full h-auto rounded-lg"
                        ></video>
                      </div>
                    )}
                    
                    {session.notes && (
                      <div className="mb-6">
                        <h3 className="text-lg font-medium mb-2">Your Notes</h3>
                        <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                          {session.notes}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end mt-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSession(session.id);
                        }}
                        disabled={isDeleting === session.id}
                        className={`px-4 py-2 rounded-md text-sm font-medium 
                          ${isDeleting === session.id 
                            ? 'bg-red-300 cursor-not-allowed' 
                            : 'bg-red-600 text-white hover:bg-red-700'
                          }`}
                      >
                        {isDeleting === session.id ? 'Deleting...' : 'Delete Session'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AuthGuard>
  );
} 