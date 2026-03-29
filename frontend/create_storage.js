const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setup() {
  console.log('Creating app_assets bucket...');
  const { data, error } = await supabase.storage.createBucket('app_assets', {
    public: true,
    fileSizeLimit: 10485760, // 10MB
  });

  if (error) {
    if (error.message.includes('already exists')) {
      console.log('Bucket already exists.');
    } else {
      console.error('Error creating bucket:', error);
    }
  } else {
    console.log('Bucket created successfully!');
  }
}

setup();
