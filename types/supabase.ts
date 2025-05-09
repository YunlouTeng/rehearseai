export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      practice_sessions: {
        Row: {
          id: number
          created_at: string
          question: string
          rating: number
          notes: string
          video_url: string
          user_id: string
        }
        Insert: {
          id?: number
          created_at?: string
          question: string
          rating: number
          notes?: string
          video_url: string
          user_id: string
        }
        Update: {
          id?: number
          created_at?: string
          question?: string
          rating?: number
          notes?: string
          video_url?: string
          user_id?: string
        }
      }
      resume_files: {
        Row: {
          id: string
          user_id: string
          file_url: string
          filename: string
          upload_date: string
        }
        Insert: {
          id?: string
          user_id: string
          file_url: string
          filename: string
          upload_date?: string
        }
        Update: {
          id?: string
          user_id?: string
          file_url?: string
          filename?: string
          upload_date?: string
        }
      }
      custom_questions: {
        Row: {
          id: string
          user_id: string
          question_text: string
          source: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          question_text: string
          source?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          question_text?: string
          source?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 