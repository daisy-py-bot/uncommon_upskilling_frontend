import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nfitseqmikpcpomxehrv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5maXRzZXFtaWtwY3hlaHJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MDQ2MTAsImV4cCI6MjA2OTQ4MDYxMH0.5YVw9Q5f-90YtRjzlODi7vKbXhew9k8bidN2ZTj7Gx8'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export { supabase }
