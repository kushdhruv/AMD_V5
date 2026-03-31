
import fs from 'node:fs';

async function test() {
  try {
    const res = await fetch("http://localhost:3000/api/website-maker/build", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "Build a simple single page app", template: "saas" })
    });
    
    if (!res.ok) {
        console.error("FAILED HTTP", res.status, await res.text());
        return;
    }
    
    const data = await res.json();
    console.log("PROJECT DATA:", Object.keys(data));
    if (data.project) {
        console.log("FRONTEND FILES:", data.project?.frontend?.files ? Object.keys(data.project.frontend.files).length : "MISSING");
        console.log("BACKEND FILES:", data.project?.backend?.files ? Object.keys(data.project.backend.files).length : "MISSING");
    } else {
        console.log("NO PROJECT FILES RETURNED FROM API!");
    }
    
    // Test download
    if (data.sessionId) {
        const zipRes = await fetch("http://localhost:3000/api/website-maker/download", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId: data.sessionId })
        });
        if (zipRes.ok) {
            console.log("ZIP DOWNLOAD WORKED");
        } else {
            console.log("ZIP DOWNLOAD FAILED", zipRes.status, await zipRes.text());
        }
    }
  } catch (err) {
    console.error("FETCH ERROR:", err);
  }
}
test();
