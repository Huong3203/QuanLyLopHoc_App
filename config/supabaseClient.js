// supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tqgeehmeixpebvxmxeyg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxZ2VlaG1laXhwZWJ2eG14ZXlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxNjY2MzMsImV4cCI6MjA2NTc0MjYzM30.O_-QH-O9IXAe3fVaSREf63-_44_0UKXcyLIu0qj8kXw' // bạn lấy ở Supabase Dashboard, phần API > anon key

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
