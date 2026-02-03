---
title:
draft: false
tags:
date: 2026-02-03
---
## Command

> [!info] `npx quartz sync`

> Essentially: just encapsulating some git operations

- run from the root of the quartz repo (i.e., where `package.json` is)

## Behavior

### Default Behavior

- `npx quartz sync`:  commit → pull → push

### Custom Behavior

| Flag                    | Commit | Pull | Push | Use Case                                                           |
| ----------------------- | ------ | ---- | ---- | ------------------------------------------------------------------ |
| just `npx quartz sync`  | ✅      | ✅    | ✅    | Default: full sync                                                 |
| `--no-pull`             | ✅      | ❌    | ✅    | Initial setup: first push without pulling empty/conflicting remote |
| `--no-push`             | ✅      | ✅    | ❌    | Local testing: commit and pull, test before pushing                |
| `--no-commit`           | ❌      | ✅    | ✅    | Sync existing: pull and push already-committed changes             |
| `--no-pull --no-push`   | ✅      | ❌    | ❌    | Local save: commit locally without syncing                         |
| `--no-commit --no-push` | ❌      | ✅    | ❌    | Fetch only: pull remote changes without committing/pushing         |
| `--no-commit --no-pull` | ❌      | ❌    | ✅    | Push only: push existing commits without pulling/committing        |


