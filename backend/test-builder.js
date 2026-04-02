import fetch from 'node-fetch';

async function testWebsiteBuilder() {
  console.log("Starting website generation API test...");

  // Send request to POST /build-async
  const res = await fetch("https://amd-demo-v1.vercel.app/api/website-maker/build-async", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: "A website for selling coffee beans", template: "modern" })
  });

  const data = await res.json();
  console.log("Received data:", data);

  if (!data.jobId) {
    console.error("Job ID was not returned properly!", data);
    return;
  }

  // Poll it
  let completed = false;
  while (!completed) {
    const statusRes = await fetch(`https://amd-demo-v1.vercel.app/api/website-maker/build-status?jobId=${data.jobId}`);
    const statusData = await statusRes.json();
    console.log("Status:", statusData.status, "Progress entries:", statusData.progressLog.length);
    
    if (statusData.status === "completed") {
      console.log("Completed successfully!");
      completed = true;
    } else if (statusData.status === "failed") {
      console.error("Job Failed!", statusData.error);
      completed = true;
    } else {
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

testWebsiteBuilder().catch(console.error);
