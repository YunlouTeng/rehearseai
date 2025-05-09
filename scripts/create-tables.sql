-- Create table for resume files
CREATE TABLE IF NOT EXISTS public.resume_files (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  filename TEXT NOT NULL,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add Row Level Security to resume_files table
ALTER TABLE public.resume_files ENABLE ROW LEVEL SECURITY;

-- Policies for resume_files
CREATE POLICY "Users can view their own resume files" 
  ON public.resume_files 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own resume files" 
  ON public.resume_files 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resume files" 
  ON public.resume_files 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resume files" 
  ON public.resume_files 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create table for custom questions
CREATE TABLE IF NOT EXISTS public.custom_questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  source TEXT DEFAULT 'AI-generated',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add Row Level Security to custom_questions table
ALTER TABLE public.custom_questions ENABLE ROW LEVEL SECURITY;

-- Policies for custom_questions
CREATE POLICY "Users can view their own custom questions" 
  ON public.custom_questions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own custom questions" 
  ON public.custom_questions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom questions" 
  ON public.custom_questions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom questions" 
  ON public.custom_questions 
  FOR DELETE 
  USING (auth.uid() = user_id); 