

// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { createClient } from '@supabase/supabase-js';

// const supabaseUrl = 'https://kwvgxpqcnjjcxbwmlukz.supabase.co';
// const supabaseAnonKey = 'sb_publishable_z8El9QcU1zWSL_z8dtWWLw_-N2WVz4e';

// export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
//   auth: {
//     storage: AsyncStorage,
//     autoRefreshToken: true,
//     persistSession: true,
//     detectSessionInUrl: false,
//   },
// });

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kwvgxpqcnjjcxbwmlukz.supabase.co';
// Ensure this key is your ACTUAL 'anon' public key from Supabase settings
const supabaseAnonKey = 'sb_publishable_z8El9QcU1zWSL_z8dtWWLw_-N2WVz4e'; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // CHANGE THIS TO TRUE for Web/Localhost testing
    detectSessionInUrl: true, 
  },
});