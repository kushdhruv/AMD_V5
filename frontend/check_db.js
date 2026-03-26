const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function checkProject() {
  const { data, error } = await supabase
    .from('projects')
    .select('id, name, status, blueprint_json')
    .ilike('name', '%Vivacity%')
    .limit(1);

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Project Data:', JSON.stringify(data, null, 2));
  }
}

checkProject();
