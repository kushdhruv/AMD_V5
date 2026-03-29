const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load .env.local
const envPath = path.resolve(__dirname, '../.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const SUPABASE_URL = envConfig.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = envConfig.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("❌ Errors: Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function syncConfig(appId) {
  if (!appId) {
    console.error("❌ Error: Please provide an appId. Usage: npm run sync-config <appId>");
    process.exit(1);
  }

  console.log(`📡 Fetching configuration for app: ${appId}...`);

  const { data: project, error } = await supabase
    .from('projects')
    .select('blueprint_json, name')
    .eq('id', appId)
    .single();

  if (error || !project) {
    console.error("❌ Error fetching project:", error?.message || "Project not found");
    process.exit(1);
  }

  // Combine metadata with blueprint
  const fullConfig = {
    project_id: appId,
    ...(project.blueprint_json || {})
  };

  const configPath = path.resolve(__dirname, '../src/config/config.json');
  fs.writeFileSync(configPath, JSON.stringify(fullConfig, null, 2));

  console.log(`✅ Success! Local config.json updated for: ${project.name}`);
  console.log(`🚀 You are now linked to Project ID: ${appId}`);
}

const appId = process.argv[2];
syncConfig(appId);
