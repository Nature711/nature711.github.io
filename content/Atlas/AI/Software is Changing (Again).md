---
title:
draft: true
tags:
date:
---
## LLM Labs

the hottest new programming language is english

software 1.0 -> 3.0 paradigms
1. 1.0: programs
2. 2.0: coding LLM parameters, tuning NN
3. 3.0: talking to LLMs in natural language
need to master all; fluidly transition between all
trend: 3.0 expanding and eating out the others; need to rewrite tones of code

analogies
LLM -- as properties of utilties
 - CAPEX to train LLM
 - OPEX to serve intelligence through (increasingly homogenous) APIs
 - metered access
 - demand for low latency, high uptime...
 - open router -- transfer switch
 - intelligence brownout when LLM goes down -- just like power goes off; reflect increasing reliance on LLM

LLM -- as fabs
- time-sharing

best analogy: LLM -- as OS
// to-do: [elaborate more on this part]

---
## LLM psychology

- stocastic simulation of people
- very good at: encyclopedia knowledge
- problem: hallucination, jagged intelligence, anterograde amnesia
	- context window: working memory; need to program it carefully (17.30 2 related movies)
- gullibility: prompt injection risk

> lossy simulation of a savant with cognitive issues

---
## LLM ecosystem

- not just the OS, but the apps, ecosystem that build on top of it 
- less "direct" interaction with OS; more wrapper / common utilities on top of it --> greater productivity

feature of partial automany LLM apps
- package context
- orchestrate LLM calls
- custom GUI 
- autonomy slider

- e.g., cursor, perplexity
	- traditional interface + LLM integration 
	- autonamy slider -- based on complexity of task

> claim: in the future, most apps will become autonomous

full workflow of a partial autonomy UIUX
- human -- verification; AI -- generation
- goal: to iterate as fast as possible; get more work done

how
- verification part -- made faster by GUI 
	- cognitive highway to human
	- easy to visualize, audit
- generation part -- "keep AI on a tight leash"
	- to increase the chance of a successful verification

vibe coding
- term created by andrej
- so if that's really how vibe coding works (29:48), I mean, why not just automate the workflow even further? like just automatically fix all the errors if there's any?? lol

e.g., menugen!! this is such a wonderful idea
- but im curious, since pic is so much more intuitive, why it seems that some resterants, especially the most luxurious ones (e.g., fine dining), don't have any pic on their menu??

anyway
interesting observations
- coding is the easiest part
- deployment (devops stuff) takes wayyyy longer
- basically just following instructions 
- but why?

that leads to the last part: BUILD FOR AGENTS

- categories of consumer / manipulator of digital info
	- humans (via GUIs)
	- computers (via APIs)
	- NOW: agent <-- computer, but human-like? (human spirit)

analogy: robots.txt -- to instruct how web crawlers should behave
- same way: llms.md -- to let LLM know what is domain is about
- goal: to make docs more legible for LLMs --> unleash huge amount of potential! 

how: 
- not just turning the doc into markdown
- also need to replace the human actions (e.g., click) with what LLM can do (e.g., cURL)
- others -- context builders
	- gitingest -- previously you can't just throw a repo to LLM, it's on github GUI. but with gitingest it turns the repo into text and builds directory structure etc. --> can be directly feed into LLM
	- deepwiki -- automatically builds docs for your repo (how?? by LLM? or some program)
	- just by changing URL, those things will be made accessible to LLM

---
## Summary

- future trend (iron man suit analogy) -- augmentation to agent