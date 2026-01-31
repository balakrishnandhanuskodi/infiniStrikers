import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  )
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

// Helper function to get the current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) {
    console.error('Error getting current user:', error.message)
    return null
  }
  return user
}

// Helper function to sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Error signing out:', error.message)
    throw error
  }
}

// Helper function to upload player photo
export const uploadPlayerPhoto = async (
  teamName: string,
  playerIndex: number,
  file: File
): Promise<string> => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${teamName.replace(/\s+/g, '-').toLowerCase()}-player-${playerIndex}-${Date.now()}.${fileExt}`
  const filePath = `${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('player-photos')
    .upload(filePath, file, { upsert: true })

  if (uploadError) {
    console.error('Error uploading photo:', uploadError.message)
    throw uploadError
  }

  const { data } = supabase.storage
    .from('player-photos')
    .getPublicUrl(filePath)

  return data.publicUrl
}

// Helper function to delete player photo
export const deletePlayerPhoto = async (photoUrl: string): Promise<void> => {
  // Extract file path from URL
  const urlParts = photoUrl.split('/player-photos/')
  if (urlParts.length < 2) return

  const filePath = urlParts[1]
  const { error } = await supabase.storage
    .from('player-photos')
    .remove([filePath])

  if (error) {
    console.error('Error deleting photo:', error.message)
  }
}
