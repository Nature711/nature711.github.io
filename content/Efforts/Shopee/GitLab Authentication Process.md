---
title:
draft: true
tags:
date: 2026-01-06
---

encountered error when i try to clone a repo. turned out to be an authentication issue. explored this private / public key authentication mechanism & some ssh stuff

big picture
- in order to clone via ssh, my laptop need to have a private key (secret), and i need to provide for gitlab the corresponding public key (non-secret)
- during cloning, ssh (the agent used to establish ssh connection) uses the local private key to talk to gitlab server --> gitlab server matches & confirms

why pri & pub key instead of symmetric?
- symmetric: you type a password & server checks for match
	- e.g., during website login, mysql password, git over https
- problem: 
	- 1. server must *store* your secret -- if server compromised, all secrets at risk
	- 2. passwords travel -- data in transit, risk being compromised
	- 3. password is easy to break & reuse -- brute force attack
- with asym however,
	- server only store public key -- not secret
	- secret (private key) doesn't travel --> less risk
	- ssh key is long, random --> hard to brute force

public & private key: lock & key 
- lock: can give to anyone (public)
- key: only you hold; and it's the only key to that lock
thus the fact that that particular key can unlock that lock --> proves...?

first time: pc don't see the server (e.g. git.company.com) --> trust it and add to known hosts

keys are stored in `~/.ssh`, so check if there's anything there first
- names like `id_ed25519` & `id_ed25519.pub`: an existing pr & pb key pair

create a new key pair if not exist, using `ssh-keygen`

start ssh agent `eval ssh agent`

add **private** key to agent `ssh-add apple-use-keychain`

copy **public** key to clipboard `pbcopy <...pub` and paste it to gitlab 

test ssh login `ssh -T gitlab@git.company.com`


