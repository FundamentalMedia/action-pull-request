const core = require('@actions/core');
const github = require('@actions/github');
let areSetsEqual = (a, b) => a.size === b.size && [...a].every(value => b.has(value));
const asyncMatchProcess = async (matchingPRID, originalPRID) => {
  if(matchingPRID){
    const [listCommitPullRequest, listCommitMatchingPR] = await Promise.all([
      octokit.rest.pulls.listCommits({owner: owner,repo: repo,pull_number: originalPRID}),
      octokit.rest.pulls.listCommits({owner: owner,repo: repo,pull_number: matchingPRID})
    ]);
    
    const SetCommitPullRequest = new Set(listCommitPullRequest.data.map(comm => comm.sha))
    const SetCommitMatchingPR = new Set(listCommitMatchingPR.data.map(comm => comm.sha))

    console.log("Commits of PR", SetCommitPullRequest)
    console.log("Commits of matched PR", matchingPRID, SetCommitMatchingPR)
    console.log("Match status: ", areSetsEqual(SetCommitPullRequest, SetCommitMatchingPR))

    if(areSetsEqual(SetCommitPullRequest, SetCommitMatchingPR)){
      // AUTOAPPROVE
      await octokit.rest.pulls.createReview({
        owner: owner,
        repo: repo,
        pull_number: originalPRID,
        event: 'APPROVE'
      })
      // AUTOMERGE
      // await octokit.rest.pulls.merge({
      //     owner: owner,
      //     repo: repo,
      //     pull_number: prNumber,
      //     commit_title: "merged by bot",
      //     commit_message: "merged by bot",
      //     merge_method: "squash"
      //   });
      return
    }
  }
} 


async function run() {
  const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN');
  const octokit = github.getOctokit(GITHUB_TOKEN); 
  
  const { context = {} } = github;
  const { pull_request } = context.payload;
  
  const owner = context.repo.owner
  const repo  = context.repo.repo
  const prNumber = pull_request.number

  console.log("Repo information", context.repo)
  const listOfPRs = await octokit.rest.pulls.list({
      owner: owner,
      repo: repo,
      state: 'all'
    });

  const matchingPRList = listOfPRs.data.filter(prs=> prs.title === pull_request.title && prs.state === 'closed' && prs.merged_at)

  console.log("There are PRs with the same name", matchingPRList && matchingPRList.length)
  matchingPRList.forEach(matchingPR => asyncMatchProcess(matchingPR && matchingPR.number, prNumber))

  core.setFailed('There are no previous PRs with same name and same commits')
}

run().catch(err => core.setFailed(err.message));