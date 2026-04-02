// Raw HTTP test to Bytez API
const key = "5d91c4c8d0ff33e2c8947e00c9568d75";
const modelId = "fal-ai/wan-25-preview/text-to-video";

// Try the raw API endpoint
const url = `https://api.bytez.com/models/v2/${modelId}`;
console.log("Testing URL:", url);

const res = await fetch(url, {
  method: "POST",
  headers: {
    "Authorization": key,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ input: "A cat walking" })
});

console.log("Status:", res.status, res.statusText);
const text = await res.text();
console.log("Response:", text.slice(0, 500));

// Also try with Bearer prefix
console.log("\n--- With Bearer prefix ---");
const res2 = await fetch(url, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${key}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ input: "A cat walking" })
});
console.log("Status:", res2.status, res2.statusText);
const text2 = await res2.text();
console.log("Response:", text2.slice(0, 500));

// Try different body format
console.log("\n--- With prompt field ---");
const res3 = await fetch(url, {
  method: "POST",
  headers: {
    "Authorization": key,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ prompt: "A cat walking" })
});
console.log("Status:", res3.status, res3.statusText);
const text3 = await res3.text();
console.log("Response:", text3.slice(0, 500));
