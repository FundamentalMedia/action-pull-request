# action-pull-request
Public action, by being in a public repo this action can be used by different projects.


```action.yml``` specifies this is a gihub action


```index.js``` contains the working files; 


This action looks at all of the submitted PRs and checks whether there is one matching the one just created by name and contained commits, if true it then proceed to approve it.

The below is an example of usage, note the @v3.3 pointing to the right version/tag.

```bash
name: Autoapprove

on:
  pull_request:
    types: [opened]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Checking if auto-approve possible
        uses: FundamentalMedia/action-pull-request@v3.3
        with:
          GITHUB_TOKEN: ${{secrets.GITHUB_TOKEN}}
```