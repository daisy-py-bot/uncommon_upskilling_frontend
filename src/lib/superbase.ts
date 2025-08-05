import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nfitseqmikpcpomxehrv.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5maXRzZXFtaWtwY3hlaHJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MDQ2MTAsImV4cCI6MjA2OTQ4MDYxMH0.5YVw9Q5f-90YtRjzlODi7vKbXhew9k8bidN2ZTj7Gx8'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Use service role key for admin operations, anon key for client operations
const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export { supabase }
