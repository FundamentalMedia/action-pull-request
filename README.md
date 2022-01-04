# action-pull-request
Public action, by being in a public repo this action can be used by different projects.


```action.yml``` specifies this is a gihub action
```index.js``` contains the working files; it looks all submitted PRs and checks wether there is one matching by name and commits the one submitted, it then proceed to approve it.
