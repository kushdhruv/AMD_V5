import fetch from 'node-fetch';
const key = process.env.BYTEZ_API_KEY || "9c8f0ccf8b8803a000c1ab059a80a346";
const MODEL_ID = "ali-vilab/modelscope-damo-text-to-video-synthesis";
async function run() {
  const resp = await fetch("https://api.bytez.com/models/v2/" + MODEL_ID, {
    method: "POST", headers: { Authorization: key }, body: JSON.stringify({text: "A futuristic city"})
  });
  console.log(resp.status);
  const data = await resp.text();
  console.log(data.slice(0, 500));
}
run();
