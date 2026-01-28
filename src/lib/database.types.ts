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
      teams: {
        Row: {
          id: string
          name: string
          logo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      players: {
        Row: {
          id: string
          team_id: string | null
          name: string
          role: string | null
          jersey_number: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          team_id?: string | null
          name: string
          role?: string | null
          jersey_number?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          team_id?: string | null
          name?: string
          role?: string | null
          jersey_number?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      matches: {
        Row: {
          id: string
          match_number: number
          date: string
          team_a_id: string | null
          team_b_id: string | null
          status: 'upcoming' | 'live' | 'completed' | 'cancelled'
          match_type: 'league' | 'playoff' | 'semifinal' | 'final'
          venue: string | null
          toss_winner_id: string | null
          toss_decision: 'bat' | 'bowl' | null
          winner_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          match_number: number
          date: string
          team_a_id?: string | null
          team_b_id?: string | null
          status?: 'upcoming' | 'live' | 'completed' | 'cancelled'
          match_type?: 'league' | 'playoff' | 'semifinal' | 'final'
          venue?: string | null
          toss_winner_id?: string | null
          toss_decision?: 'bat' | 'bowl' | null
          winner_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          match_number?: number
          date?: string
          team_a_id?: string | null
          team_b_id?: string | null
          status?: 'upcoming' | 'live' | 'completed' | 'cancelled'
          match_type?: 'league' | 'playoff' | 'semifinal' | 'final'
          venue?: string | null
          toss_winner_id?: string | null
          toss_decision?: 'bat' | 'bowl' | null
          winner_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      match_statistics: {
        Row: {
          id: string
          match_id: string | null
          team_id: string | null
          innings: number
          runs: number
          balls_faced: number
          fours: number
          sixes: number
          extras: number
          wickets_lost: number
          overs_bowled: number
          maidens: number
          runs_conceded: number
          wickets_taken: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          match_id?: string | null
          team_id?: string | null
          innings: number
          runs?: number
          balls_faced?: number
          fours?: number
          sixes?: number
          extras?: number
          wickets_lost?: number
          overs_bowled?: number
          maidens?: number
          runs_conceded?: number
          wickets_taken?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          match_id?: string | null
          team_id?: string | null
          innings?: number
          runs?: number
          balls_faced?: number
          fours?: number
          sixes?: number
          extras?: number
          wickets_lost?: number
          overs_bowled?: number
          maidens?: number
          runs_conceded?: number
          wickets_taken?: number
          created_at?: string
          updated_at?: string
        }
      }
      player_performances: {
        Row: {
          id: string
          match_id: string | null
          player_id: string | null
          team_id: string | null
          runs_scored: number
          balls_faced: number
          fours: number
          sixes: number
          is_out: boolean
          dismissal_type: string | null
          overs_bowled: number
          maidens: number
          runs_conceded: number
          wickets: number
          catches: number
          stumpings: number
          run_outs: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          match_id?: string | null
          player_id?: string | null
          team_id?: string | null
          runs_scored?: number
          balls_faced?: number
          fours?: number
          sixes?: number
          is_out?: boolean
          dismissal_type?: string | null
          overs_bowled?: number
          maidens?: number
          runs_conceded?: number
          wickets?: number
          catches?: number
          stumpings?: number
          run_outs?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          match_id?: string | null
          player_id?: string | null
          team_id?: string | null
          runs_scored?: number
          balls_faced?: number
          fours?: number
          sixes?: number
          is_out?: boolean
          dismissal_type?: string | null
          overs_bowled?: number
          maidens?: number
          runs_conceded?: number
          wickets?: number
          catches?: number
          stumpings?: number
          run_outs?: number
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
export type Player = Database['public']['Tables']['players']['Row']
export type Match = Database['public']['Tables']['matches']['Row']
export type MatchStatistics = Database['public']['Tables']['match_statistics']['Row']
export type PlayerPerformance = Database['public']['Tables']['player_performances']['Row']

export type TeamInsert = Database['public']['Tables']['teams']['Insert']
export type PlayerInsert = Database['public']['Tables']['players']['Insert']
export type MatchInsert = Database['public']['Tables']['matches']['Insert']
export type MatchStatisticsInsert = Database['public']['Tables']['match_statistics']['Insert']
export type PlayerPerformanceInsert = Database['public']['Tables']['player_performances']['Insert']
