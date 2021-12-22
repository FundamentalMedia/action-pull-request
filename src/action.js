const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
    const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN');
    // temporary and hardcorded
    const octokit = github.getOctokit('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');
    
    const { context = {} } = github;
    const { pull_request } = context.payload;
    console.log(github, pull_request)

    console.log(context)
    // const listOfPRs = await octokit.rest.pulls.list({
    //     owner: 'fundamental-michele',
    //     repo: "FundamentalMedia/action-pull-request",
    //   });

    // console.log("listOfPRs",listOfPRs)


    // if(pull_request.name in listOfPRs){
        // MERGE the PR if check pass
        // octokit.rest.pulls.merge({
        //     owner,
        //     repo,
        //     pull_number :pull_request.number,
        //   });
    // }



}

run();