'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

interface ResumeUploaderProps {
  onResumeTextExtracted: (text: string, fileUrl: string, filename: string) => void;
  userId: string;
}

export default function ResumeUploader({ onResumeTextExtracted, userId }: ResumeUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    
    const selectedFile = e.target.files?.[0];
    
    if (!selectedFile) {
      return;
    }
    
    // Check if the file is a PDF
    if (selectedFile.type !== 'application/pdf') {
      setError('Please upload a PDF file only.');
      return;
    }
    
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file || !userId) {
      setError('Please select a file and ensure you are logged in.');
      return;
    }
    
    setIsUploading(true);
    setError(null);
    
    try {
      // Step 1: Extract text from the PDF using FileReader for simplicity
      // In a production app, you might want to use a PDF parsing library
      const fileText = await extractTextFromPDF(file);
      
      // Step 2: Upload the file to Supabase Storage
      const filePath = `resumes/${userId}/${uuidv4()}_${file.name}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resume-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'application/pdf'
        });
      
      if (uploadError) {
        throw new Error(`Failed to upload file: ${uploadError.message}`);
      }
      
      // Step 3: Get the public URL for the uploaded file
      const { data: publicUrlData } = supabase.storage
        .from('resume-files')
        .getPublicUrl(filePath);
      
      const publicUrl = publicUrlData.publicUrl;
      
      // Step 4: Save the file metadata to the database
      const { error: dbError } = await supabase
        .from('resume_files')
        .insert({
          user_id: userId,
          file_url: publicUrl,
          filename: file.name
        });
      
      if (dbError) {
        throw new Error(`Failed to save file metadata: ${dbError.message}`);
      }
      
      // Step 5: Notify the parent component that we have successfully extracted the text
      onResumeTextExtracted(fileText, publicUrl, file.name);
      
    } catch (err) {
      console.error('Error processing resume:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while processing the file.');
    } finally {
      setIsUploading(false);
    }
  };

  // This is a simple implementation that reads the file as text
  // In a real app, you'd want to use a proper PDF parsing library like pdf-parse
  const extractTextFromPDF = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          // This is a simplified approach and won't work well for actual PDFs
          // In a real app, use a proper PDF parsing library
          const text = event.target?.result as string || '';
          resolve(text);
        } catch (error) {
          reject(new Error('Failed to extract text from PDF.'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file.'));
      };
      
      // Read as text for demo purposes
      // In reality, you'd read as ArrayBuffer and use a PDF parsing library
      reader.readAsText(file);
    });
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Upload Your Resume (PDF)</h3>
      
      <div className="flex items-center space-x-3">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="block w-full text-sm text-slate-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
        
        {file && (
          <button
            onClick={handleRemoveFile}
            className="text-red-600 hover:text-red-800"
          >
            Remove
          </button>
        )}
      </div>
      
      {file && (
        <div className="flex items-center">
          <span className="text-sm text-gray-500 mr-3">
            Selected file: {file.name}
          </span>
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
              isUploading
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isUploading ? 'Uploading...' : 'Upload and Extract Text'}
          </button>
        </div>
      )}
      
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
} 