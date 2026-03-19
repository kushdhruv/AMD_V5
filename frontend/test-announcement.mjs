import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yyczfgxkprkxiafdencw.supabase.co';
// From .env.local line 3
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5Y3pmZ3hrcHJreGlhZmRlbmN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5ODkwMDQsImV4cCI6MjA4NjU2NTAwNH0.BlQWFPjnzsk6dK11ZvCFxT8ZD0eEgxq0-EMWBE-5Wh8';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
    console.log("Inserting Test Post...");
    const { data, error } = await supabase.from('announcements').insert({
        app_name: 'Event Announcer',
        title: 'Script Test: Title + Image',
        message: 'This is a test message from script to verify if text is saved when image is present.',
        data: { image: 'https://picsum.photos/200' },
        created_at: new Date().toISOString()
    }).select();

    if (error) {
        console.error("Insert Error:", error);
    } else {
        console.log("Insert Success. Data:", data);
        
        // Fetch to verify what is stored
        const { data: fetch, error: fetchError } = await supabase.from('announcements').select('*').eq('id', data[0].id);
        if (fetch) console.log("Fetched Back:", fetch[0]);
    }
}

test();
