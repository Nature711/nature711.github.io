---
title:
draft: true
tags:
date:
---
full notes: https://kiankyars.github.io/openclawcourse/

What is it 

Self-hosted **messaging gateway** that connects various messaging platforms (e.g., WhatsApp, Telegram) with coding agents (e.g., Claude)

- the gateway is a single **long-running process** on your machine that maintains persistent connections to messaging platforms
- when a message arrives on any channel, the gateway routes it to an agent that can execute tools locally

what you give it: full access to local files (admin access)

---
How I set up 

- run model locally (free qwen3.5-cloud) 
	- [tutorial](https://www.bilibili.com/video/BV19CZeBPEfa/?spm_id_from=333.337.search-card.all.click)
- use ollama to manage -- already has [perfect integration](https://docs.ollama.com/integrations/openclaw) with openclaw
	- single command `ollama launch openclaw` to start everything
- usage limit: per 4h & per week 
	- around ~100 req per 4h (on avg)

```
OpenClaw TUI
   ↓
OpenClaw agent (main)
   ↓
Ollama Cloud backend
   ↓
Qwen 3.5 model
```

examine more details at  `cat ~/.openclaw/openclaw.json`

can set up git repo for persisting agent config

---
setting up telegram channel

```
Telegram user
   ↓
Telegram Bot API
   ↓
OpenClaw Gateway (port 18789)
   ↓
Agent (main)
   ↓
Ollama (local, 127.0.0.1:11434)
   ↓
Qwen 3.5 model
```

tutorial: [configuring tele for openclaw](https://docs.openclaw.ai/channels/telegram)

---
project idea

to set up obsidian integration, so that whenever i have a quick idea, i just send it to telegram, and openclaw with add it to my obsidian and find any linkage to existing notes for me, possibly updating notes & indexes (after my approval)