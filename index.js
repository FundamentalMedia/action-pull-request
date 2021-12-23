const core = require('@actions/core');
const github = require('@actions/github');
let areSetsEqual = (a, b) => a.size === b.size && [...a].every(value => b.has(value));

async function run() {
    const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN');
    const octokit = github.getOctokit(GITHUB_TOKEN); 
    
    const { context = {} } = github;
    const { pull_request } = context.payload;

    core.info(context);
    console.log("context", context)
    
    const listOfPRs = await octokit.rest.pulls.list({
        owner: 'FundamentalMedia',
        repo: context.payload.repository.name,
        state: 'all'
      });

    const matchingPR = listOfPRs.data.find(pr=> pr.title === pull_request.title && pr.merged_at && pr.status === 'closed')

    if(matchingPR && matchingPR.length){

        await octokit.rest.pulls.createReview({
          owner: "FundamentalMedia",
          repo: context.payload.repository.name,
          pull_number: pull_request.number,
          event: 'APPROVE'
        })
        // TODO promise all it and replace hardcoded owner
        const listCommitPullRequest = await octokit.rest.pulls.listCommits({
            owner: 'FundamentalMedia',
            repo: context.payload.repository.name,
            pull_number: pull_request.number,
          });
        const listCommitMatchingPR = await octokit.rest.pulls.listCommits({
            owner: 'FundamentalMedia',
            repo: context.payload.repository.name,
            pull_number: matchingPR.number,
          });

        const SetCommitPullRequest = new Set(listCommitPullRequest.data.map(comm => comm.sha))
        const SetCommitMatchingPR = new Set(listCommitMatchingPR.data.map(comm => comm.sha))



        if(areSetsEqual(SetCommitPullRequest, SetCommitMatchingPR)){

            await octokit.rest.pulls.merge({
                owner: "FundamentalMedia",
                repo: context.payload.repository.name,
                pull_number: pull_request.number,
                commit_title: "merged by bot",
                commit_message: "merged by bot",
                merge_method: "squash"
              });
        }
    }

}

run().catch(err => core.setFailed(err.message));