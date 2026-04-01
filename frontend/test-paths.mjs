
import fs from 'node:fs';

async function test() {
  try {
    const res = await fetch("http://localhost:3000/api/website-maker/build", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "A modern SaaS landing page", template: "saas" })
    });
    
    const data = await res.json();
    console.log("FRONTEND FILES:");
    const fileKeys = Object.keys(data.project.frontend.files);
    console.log(fileKeys.join('\n'));
    
    // Look for App.jsx
    const appFile = fileKeys.find(f => f.toLowerCase().endsWith('app.jsx'));
    console.log("FOUND APP FILE?:", appFile);
    
  } catch (err) { }
}
test();
