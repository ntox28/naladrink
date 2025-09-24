import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://efuivqjmbichqgsdqxdy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmdWl2cWptYmljaHFnc2RxeGR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NjQzMzQsImV4cCI6MjA3NDI0MDMzNH0.0886fGsEt3dUMVJZY_v_7OTTp-wa0Fd4LIoTxTXecTY';

// @ts-ignore
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
