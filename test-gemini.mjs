
import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

async function listModels() {
  try {
    const result = await genAI.listModels();
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("List models failed:", err.message);
  }
}
// listModels(); // listModels is not a function on genAI directly in some versions? 
// It's usually genAI.getGenerativeModel({ model: "..." })

async function testFlash() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hi");
    console.log("Success with gemini-1.5-flash");
  } catch (err) {
    console.error("Failed with gemini-1.5-flash:", err.message);
  }
}
testFlash();
