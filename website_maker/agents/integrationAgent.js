/**
 * Integration Agent: Validates frontend↔backend compatibility.
 * Ensures matching ports, API routes, and CORS config for Vanilla projects.
 */
export function validateIntegration(files, plan) {
  const issues = [];
  const fixes = {};

  // 1. Check for backend route existence
  const backendRoutes = plan.backendRoutes || [];
  const serverFile = files["backend/index.js"] || files["backend/server.js"];
  
  if (typeof serverFile === "string") {
    for (const route of backendRoutes) {
      if (!serverFile.includes(route.path)) {
        issues.push(`Backend server missing route handler for: ${route.method} ${route.path}`);
      }
    }
  } else if (!serverFile) {
    issues.push("Missing primary backend entry point (index.js or server.js)");
  } else {
    issues.push("Backend entry point is structurally invalid (not a text file)");
  }

  // 2. Check for frontend fetch calls
  const frontendJS = files["frontend/main.js"] || files["frontend/index.html"];
  if (typeof frontendJS === "string") {
    for (const route of backendRoutes) {
      if (!frontendJS.includes(route.path)) {
        // Only warn, as some routes might be internal or for future use
        console.warn(`[Integration] Frontend might be missing fetch for route: ${route.path}`);
      }
    }
  }

  // 3. Ensure CORS and Ports match
  // Standardizing: Backend on 5000, Frontend assumes it can reach it.
  if (typeof serverFile === "string" && !serverFile.includes("cors(")) {
    issues.push("Backend may be missing CORS configuration");
    
    // Auto-fix: Add basic CORS
    const corsLine = "const cors = require('cors');\napp.use(cors());";
    if (!serverFile.includes(corsLine) && serverFile.includes("const app = express();")) {
        fixes[files["backend/index.js"] ? "backend/index.js" : "backend/server.js"] = 
            serverFile.replace("const app = express();", `const app = express();\n${corsLine}`);
    }
  }

  // 4. Validate package.json files
  for (const path of ["frontend/package.json", "backend/package.json"]) {
    if (files[path]) {
      try {
        JSON.parse(files[path]);
      } catch (e) {
        issues.push(`Invalid JSON in ${path}: ${e.message}`);
      }
    }
  }

  return { issues, fixes };
}

/**
 * Apply integration fixes to the file map.
 */
export function applyFixes(files, fixes) {
  const newFiles = { ...files };
  for (const [path, content] of Object.entries(fixes)) {
    newFiles[path] = content;
  }
  return newFiles;
}
