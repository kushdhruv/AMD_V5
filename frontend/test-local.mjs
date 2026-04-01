
import { buildWebsite } from '../website_maker/index.js';
import fs from 'fs';

async function test() {
  try {
    const result = await buildWebsite({
      prompt: "Build a high-end, modern Linear-style SaaS landing page for a developer tool called 'Flux'. Use bento grids for features, glow blobs, and deep glassmorphism. Dark minimalist aesthetic.",
      links: [],
      template: "saas",
    });
    fs.writeFileSync('preview.html', result.preview);
    console.log("SUCCESS! HTML saved to preview.html");
  } catch (err) {
    console.error("FATAL ERROR:");
    console.error(err);
  }
}
test();
