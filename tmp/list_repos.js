const { Octokit } = require("@octokit/rest");
require("dotenv").config({ path: "frontend/.env.local" });

async function listRepos() {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  
  try {
    const { data: repos } = await octokit.repos.listForAuthenticatedUser({
      per_page: 100,
      sort: 'updated'
    });
    
    console.log("Recently Updated Repos:");
    repos.forEach(r => console.log(`- ${r.full_name} (${r.private ? 'private' : 'public'})`));
    
  } catch (error) {
    console.error("Error listing repos:", error.message);
  }
}

listRepos();
