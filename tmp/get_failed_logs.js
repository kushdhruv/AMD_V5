const { Octokit } = require("@octokit/rest");
require("dotenv").config({ path: "frontend/.env.local" });

async function getFailedLogs() {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  const owner = "kushdhruv";
  const repo = "AMD_V5";
  
  try {
    const { data: runs } = await octokit.actions.listWorkflowRunsForRepo({
      owner,
      repo,
      per_page: 1
    });
    
    if (runs.workflow_runs.length === 0) {
      console.log("No runs found.");
      return;
    }
    
    const latestRun = runs.workflow_runs[0];
    console.log(`Latest Run [${latestRun.status}]: ${latestRun.html_url}`);
    
    if (latestRun.conclusion === 'failure') {
      const { data: jobs } = await octokit.actions.listJobsForWorkflowRun({
        owner,
        repo,
        run_id: latestRun.id
      });
      
      console.log("\nFailed Steps / Jobs:");
      jobs.jobs.forEach(job => {
        console.log(`Job: ${job.name} (${job.conclusion})`);
        job.steps.forEach(step => {
          if (step.conclusion === 'failure') {
            console.log(`  Step: [${step.number}] ${step.name} - ${step.conclusion}`);
          }
        });
      });
    }
    
  } catch (error) {
    console.error("Error fetching logs:", error.message);
  }
}

getFailedLogs();
