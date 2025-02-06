import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://wcudjrwfxpqnytjdmojb.supabase.co'
const supabaseKey = process.env.SUPABASE_DEV_KEY as string
const supabaseClient = createClient(supabaseUrl, supabaseKey)

export default supabaseClient