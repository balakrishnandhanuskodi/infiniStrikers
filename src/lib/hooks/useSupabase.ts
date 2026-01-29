import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'
import type { Team, Match, TeamStats, MatchUpdate, TeamUpdate } from '../database.types'

// Hook to fetch all teams
export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTeams = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('teams')
      .select('*')
      .order('name')

    if (fetchError) {
      setError(fetchError.message)
      setTeams([])
    } else {
      setTeams(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchTeams()
  }, [fetchTeams])

  const updateTeam = async (id: string, updates: TeamUpdate) => {
    const { error } = await supabase
      .from('teams')
      .update(updates)
      .eq('id', id)

    if (error) throw error
    await fetchTeams()
  }

  return { teams, loading, error, refetch: fetchTeams, updateTeam }
}

// Hook to fetch all matches
export function useMatches() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMatches = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('matches')
      .select('*')
      .order('date')
      .order('match_number')

    if (fetchError) {
      setError(fetchError.message)
      setMatches([])
    } else {
      setMatches(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchMatches()
  }, [fetchMatches])

  const updateMatch = async (
    id: string,
    teamAStats: TeamStats,
    teamBStats: TeamStats,
    status: Match['status']
  ) => {
    const updates: MatchUpdate = {
      team_a_stats: teamAStats,
      team_b_stats: teamBStats,
      status,
    }

    const { error } = await supabase
      .from('matches')
      .update(updates)
      .eq('id', id)

    if (error) throw error
    await fetchMatches()
  }

  return { matches, loading, error, refetch: fetchMatches, updateMatch }
}

// Hook for real-time match updates
export function useRealtimeMatches() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Initial fetch
    const fetchMatches = async () => {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('matches')
        .select('*')
        .order('date')
        .order('match_number')

      if (fetchError) {
        setError(fetchError.message)
        setMatches([])
      } else {
        setMatches(data || [])
      }
      setLoading(false)
    }

    fetchMatches()

    // Subscribe to realtime updates
    const subscription = supabase
      .channel('matches-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMatches((prev) => [...prev, payload.new as Match])
          } else if (payload.eventType === 'UPDATE') {
            setMatches((prev) =>
              prev.map((m) => (m.id === payload.new.id ? (payload.new as Match) : m))
            )
          } else if (payload.eventType === 'DELETE') {
            setMatches((prev) => prev.filter((m) => m.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { matches, loading, error }
}
