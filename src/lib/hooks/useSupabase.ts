import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'
import type { Team, Player, Match, MatchStatistics } from '../database.types'

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

  return { teams, loading, error, refetch: fetchTeams }
}

// Hook to fetch players for a specific team
export function usePlayers(teamId?: string) {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPlayers = useCallback(async () => {
    setLoading(true)
    setError(null)

    let query = supabase.from('players').select('*')

    if (teamId) {
      query = query.eq('team_id', teamId)
    }

    const { data, error: fetchError } = await query.order('name')

    if (fetchError) {
      setError(fetchError.message)
      setPlayers([])
    } else {
      setPlayers(data || [])
    }
    setLoading(false)
  }, [teamId])

  useEffect(() => {
    fetchPlayers()
  }, [fetchPlayers])

  return { players, loading, error, refetch: fetchPlayers }
}

// Hook to fetch all matches with optional status filter
export function useMatches(status?: Match['status']) {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMatches = useCallback(async () => {
    setLoading(true)
    setError(null)

    let query = supabase.from('matches').select('*')

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error: fetchError } = await query.order('date', { ascending: true })

    if (fetchError) {
      setError(fetchError.message)
      setMatches([])
    } else {
      setMatches(data || [])
    }
    setLoading(false)
  }, [status])

  useEffect(() => {
    fetchMatches()
  }, [fetchMatches])

  return { matches, loading, error, refetch: fetchMatches }
}

// Hook to fetch match statistics
export function useMatchStatistics(matchId: string) {
  const [statistics, setStatistics] = useState<MatchStatistics[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStatistics = useCallback(async () => {
    if (!matchId) {
      setStatistics([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('match_statistics')
      .select('*')
      .eq('match_id', matchId)
      .order('innings')

    if (fetchError) {
      setError(fetchError.message)
      setStatistics([])
    } else {
      setStatistics(data || [])
    }
    setLoading(false)
  }, [matchId])

  useEffect(() => {
    fetchStatistics()
  }, [fetchStatistics])

  return { statistics, loading, error, refetch: fetchStatistics }
}

// Hook for real-time match updates
export function useRealtimeMatch(matchId: string) {
  const [match, setMatch] = useState<Match | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!matchId) {
      setMatch(null)
      setLoading(false)
      return
    }

    // Initial fetch
    const fetchMatch = async () => {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .single()

      if (fetchError) {
        setError(fetchError.message)
        setMatch(null)
      } else {
        setMatch(data)
      }
      setLoading(false)
    }

    fetchMatch()

    // Subscribe to realtime updates
    const subscription = supabase
      .channel(`match-${matchId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
          filter: `id=eq.${matchId}`,
        },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setMatch(null)
          } else {
            setMatch(payload.new as Match)
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [matchId])

  return { match, loading, error }
}
