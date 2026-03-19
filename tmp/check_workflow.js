const { Octokit } = require("@octokit/rest");
require("dotenv").config({ path: "frontend/.env.local" });

async function checkWorkflow() {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  const owner = "kushdhruv";
  const repo = "AMD_V5";
  
  try {
    console.log(`Checking workflow for ${owner}/${repo}...`);
    const { data: workflows } = await octokit.actions.listRepoWorkflows({
      owner,
      repo,
    });
    
    console.log("Found Workflows:");
    workflows.workflows.forEach(w => console.log(`- ${w.path} (${w.name})`));
    
    const exists = workflows.workflows.some(w => w.path.includes("eas-build.yml"));
    console.log(`\neas-build.yml exists: ${exists}`);
    
  } catch (error) {
    console.error("Error checking workflows:", error.message);
  }
}

checkWorkflow();
