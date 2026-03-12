---
title:
draft: false
tags:
date: 2026-03-11
---
## Background

### Mental Model

Think of Git commits as **snapshots** of the staging area:

```
Edit files  
      ↓  
Select snapshot (git add)  
      ↓  
Save snapshot (git commit)  
      ↓  
Share snapshot (git push)
```

### Lifecycle of a file 

```
create file
     ↓
untracked
     ↓ git add
staged
     ↓ git commit
committed
     ↓ edit
modified
     ↓ git add
staged again
```

#### Untracked 

- File exits in your folder, but Git doesn't know it yet -- not in any previous commits
- after `git add <file>` --> becomes *tracked*

```
Untracked files:
  newfile.txt
```

#### Unstaged

- A file that Git already tracks, but you *edited* it and *haven't staged* then change
- also after `git add <file>` --> becomes staged

```
Changes not staged for commit:
  modified: config.yml
```

---
## Revise Git Commit

### Scenario

You **pushed a commit**, but want to **re-review or change its contents** (e.g., fix typo, remove unwanted files) and **rewrite the remote commit**.

### Workflow

**1. Undo the latest commit but keep changes unstaged**

```bash
git reset HEAD~1
```

Result:
- Last commit removed locally
- All changes returned to **working directory (unstaged)**

**2. Review and stage the correct files**

```bash
git status
git add <file> 
```

**3. Create the corrected commit**

```bash
git commit -m "updated commit message"
```

**4. Rewrite the remote commit**

```bash
git push --force-with-lease
```

Reason: the local commit history changed, so the remote must be **force updated**.

---
### Key Idea

- `reset HEAD~1` → undo commit but keep changes
- `add` → stage the correct changes
- `commit` → recreate the commit
- `push --force-with-lease` → replace the remote commit safely