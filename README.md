# action-pull-request
Public action, by being in a public repo this action can be used by different projects.


```action.yml``` specifies this is a gihub action
```index.js``` contains the working files; it looks all submitted PRs and checks wether there is one matching by name and commits the one submitted, it then proceed to approve it.

The below is an example of usage, note the @v3.1 pointing to the right version/tag.
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
        uses: ./
        with:
          GITHUB_TOKEN: ${{secrets.GITHUB_TOKEN}}
```

By default the test fails with no matching PRs are found, this doesn't prevent merging.