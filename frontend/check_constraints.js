import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkConstraints() {
  const { data, error } = await supabase.rpc('get_table_constraints', { t_name: 'collaboration_invites' });
  if (error) {
    // If RPC doesn't exist, try a raw query via a temporary function if possible, 
    // but usually I don't have raw SQL access via JS client unless I use an RPC.
    console.log("RPC get_table_constraints not found. Trying another way...");
    
    // I'll try to just fetch the table info
    const { data: tableData, error: tableError } = await supabase
      .from('collaboration_invites')
      .select('*')
      .limit(1);
    
    console.log("Table access check:", tableError ? tableError.message : "Success");
  } else {
    console.log("Constraints:", data);
  }
}

checkConstraints();
