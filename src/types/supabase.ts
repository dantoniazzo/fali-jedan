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
      matches: {
        Row: {
          id: string
          created_at: string
          sport: string
          location: string
          venue: string
          latitude: number
          longitude: number
          match_time: string
          team_a: string
          team_b: string
          description: string | null
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          sport: string
          location: string
          venue: string
          latitude: number
          longitude: number
          match_time: string
          team_a: string
          team_b: string
          description?: string | null
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          sport?: string
          location?: string
          venue?: string
          latitude?: number
          longitude?: number
          match_time?: string
          team_a?: string
          team_b?: string
          description?: string | null
          user_id?: string
        }
      }
      profiles: {
        Row: {
          id: string
          updated_at: string | null
          username: string | null
          full_name: string | null
          avatar_url: string | null
        }
        Insert: {
          id: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
        }
        Update: {
          id?: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
        }
      }
      match_participants: {
        Row: {
          id: string
          match_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          match_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          match_id?: string
          user_id?: string
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