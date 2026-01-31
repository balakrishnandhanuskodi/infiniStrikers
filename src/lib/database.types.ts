export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Stats types matching the app's structure
export interface BattingStats {
  player: string
  runs: number
  balls: number
  fours: number
  extras: number
}

export interface BowlingStats {
  player: string
  overs: number
  maidens: number
  runs: number
  wickets: number
}

export interface TeamStats {
  batting: BattingStats[]
  bowling: BowlingStats[]
  totalRuns: number
  totalWickets: number
  overs: number
}

export interface Database {
  public: {
    Tables: {
      teams: {
        Row: {
          id: string
          name: string
          players: string[]
          player_photos: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          players?: string[]
          player_photos?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          players?: string[]
          player_photos?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      matches: {
        Row: {
          id: string
          match_number: number
          date: string
          team_a: string
          team_b: string
          status: 'scheduled' | 'live' | 'completed'
          match_type: 'group' | 'semi-final' | 'final'
          team_a_stats: TeamStats | null
          team_b_stats: TeamStats | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          match_number: number
          date: string
          team_a: string
          team_b: string
          status?: 'scheduled' | 'live' | 'completed'
          match_type?: 'group' | 'semi-final' | 'final'
          team_a_stats?: TeamStats | null
          team_b_stats?: TeamStats | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          match_number?: number
          date?: string
          team_a?: string
          team_b?: string
          status?: 'scheduled' | 'live' | 'completed'
          match_type?: 'group' | 'semi-final' | 'final'
          team_a_stats?: TeamStats | null
          team_b_stats?: TeamStats | null
          created_at?: string
          updated_at?: string
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

// Convenience types
export type Team = Database['public']['Tables']['teams']['Row']
export type Match = Database['public']['Tables']['matches']['Row']

export type TeamInsert = Database['public']['Tables']['teams']['Insert']
export type MatchInsert = Database['public']['Tables']['matches']['Insert']

export type TeamUpdate = Database['public']['Tables']['teams']['Update']
export type MatchUpdate = Database['public']['Tables']['matches']['Update']
