const core = require('@actions/core');
const github = require('@actions/github');
let areSetsEqual = (a, b) => a.size === b.size && [...a].every(value => b.has(value));

async function run() {
    const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN');
    const octokit = github.getOctokit(GITHUB_TOKEN); 
    
    const { context = {} } = github;
    const { pull_request } = context.payload;
    
    const owner = context.repo.owner
    const repo  = context.repo.repo
    const number = pull_request.number

    console.log("Repo info", context.repo)
    console.log("PR info", pull_request)
    const listOfPRs = await octokit.rest.pulls.list({
        owner: owner,
        repo: repo,
        state: 'all'
      });

    const matchingPR = listOfPRs.data.find(prs=> prs.title === pull_request.title && prs.state === 'closed' && prs.merged_at)
    console.log("There are PRs with the same name", matchingPR && matchingPR.number)

    if(matchingPR && matchingPR.number){
        const [listCommitPullRequest, listCommitMatchingPR] = await Promise.all([
          octokit.rest.pulls.listCommits({owner: owner,repo: repo,pull_number: number}),
          octokit.rest.pulls.listCommits({owner: owner,repo: repo,pull_number: matchingPR.number})
        ]);
        
        const SetCommitPullRequest = new Set(listCommitPullRequest.data.map(comm => comm.sha))
        const SetCommitMatchingPR = new Set(listCommitMatchingPR.data.map(comm => comm.sha))

        console.log("Commits of the PR", SetCommitPullRequest )
        console.log("Commits of the Matched PR", SetCommitMatchingPR )
        console.log("Match status: ", areSetsEqual(SetCommitPullRequest, SetCommitMatchingPR))
        if(areSetsEqual(SetCommitPullRequest, SetCommitMatchingPR)){
          // AUTOAPPROVE
            await octokit.rest.pulls.createReview({
              owner: owner,
              repo: repo,
              pull_number: number,
              event: 'APPROVE'
            })
            // AUTOMERGE
            // await octokit.rest.pulls.merge({
            //     owner: owner,
            //     repo: repo,
            //     pull_number: number,
            //     commit_title: "merged by bot",
            //     commit_message: "merged by bot",
            //     merge_method: "squash"
            //   });
        }else{
          core.setFailed('There is a PR with the same name as this one but they dont`t have the same commits')
        }
    }
}

run().catch(err => core.setFailed(err.message));