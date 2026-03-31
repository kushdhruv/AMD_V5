
import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

async function testModels() {
  const models = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-2.0-flash-exp", "gemini-1.5-pro"];
  
  for (const m of models) {
    try {
      console.log(`Testing ${m}...`);
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent("Hi");
      console.log(`SUCCESS with ${m}: ${result.response.text()}`);
      return; // Stop at first success
    } catch (err) {
      console.error(`FAILED with ${m}: ${err.message}`);
    }
  }
}
testModels();
