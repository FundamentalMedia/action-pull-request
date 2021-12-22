const core = require('@actions/core');
const github = require('@actions/github');
let areSetsEqual = (a, b) => a.size === b.size && [...a].every(value => b.has(value));

async function run() {
    const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN');
    const octokit = github.getOctokit(GITHUB_TOKEN); 
    
    const { context = {} } = github;
    const { pull_request } = context.payload;

    const listOfPRs = await octokit.rest.pulls.list({
        owner: 'FundamentalMedia',
        repo: "action-pull-request",
        state: 'all'
      });

    const matchingPR = listOfPRs.data.find(pr=> pr.title === pull_request.title && pr.merged_at && pr.status === 'closed')

    if(matchingPR && matchingPR.length){
        // TODO promise all it and replace hardcoded owner/repo
        const listCommitPullRequest = await octokit.rest.pulls.listCommits({
            owner: 'FundamentalMedia',
            repo: "action-pull-request",
            pull_number: pull_request.number,
          });
        const listCommitMatchingPR = await octokit.rest.pulls.listCommits({
            owner: 'FundamentalMedia',
            repo: "action-pull-request",
            pull_number: matchingPR.number,
          });

        const SetCommitPullRequest = new Set(listCommitPullRequest.data.map(comm => comm.sha))
        const SetCommitMatchingPR = new Set(listCommitMatchingPR.data.map(comm => comm.sha))

        if(areSetsEqual(SetCommitPullRequest, SetCommitMatchingPR)){
            await octokit.rest.pulls.merge({
                owner: "FundamentalMedia",
                repo: "action-pull-request",
                pull_number: pull_request.number,
              });
        }
    }



}

run();