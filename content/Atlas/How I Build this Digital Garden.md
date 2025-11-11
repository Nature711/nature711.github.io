---
title:
draft: false
tags:
  - "#pkm"
description:
date: 2025-11-11
---
## 🔒Before: Keeping Everything Private

For a long time, all my notes lived **privately in Obsidian** — my second brain.  
I wrote a lot: reflections, PKM ideas, infra learnings, system design notes… but they stayed hidden.

Part of me wanted to share.  
Another part resisted:

> “It’s not polished yet.”  
> “It’s not complete.”  
> “I’m not ready.”

Eventually, I realized — **notes don’t need to be finished to be valuable**.  

Growth happens in the open. So I decided to **build a public space for my evolving thinking** — a [[Digital Garden|digital garden]].

---
## 🧩 First Attempts: Painful Syncing

I started creating my own publishing pipeline — I wrote scripts to:

- export Markdown from Obsidian
- convert `[[wikilinks]]` to web links
- filter private notes
- fix formatting and embeds for the web

It worked… **but it was brittle and exhausting**.  
Every update felt like redeploying a full app, not nurturing a garden.

The **friction** is just too **HIGH**...

---
## 🌟 The Breakthrough: Quartz

Until I discovered **[Quartz](https://quartz.jzhao.xyz/)** — a static site framework *built for Obsidian users*.

It felt **almost native to Obsidian**:

- 💡`[[wikilinks]]`, callouts, embeds, tags — all rendered beautifully
- 🔗 Notes kept their original structure and bidirectional links
-  The entire site looked and felt like my vault — just on the web


But the real magic lies in the seamless workflow —

Once I set it up, publishing became effortless:

```bash
npx quartz sync
```
`
That’s it. No more writing conversion scripts. No broken links. No fighting Markdown quirks.

Just focus on writing in Obsidian — and let Quartz handle the rest.  
**Every update blooms into the garden with zero friction.**

---
## ⚙️ How It Works, Technically

The setup was simple. I followed the [official Quartz guide](https://quartz.jzhao.xyz/), and all it took was:

```bash
npm i
npx quartz create
```

That’s it.

It initialized everything:

- a working site structure
- a `content/` folder for my notes
- Quartz config files (`.quartz/`) for styling, routing, etc.

Then I just:

1. Set `content/` as the **vault folder** in Obsidian
2. Write notes as usual — no special saving, syncing, or plugins needed
3. Run: `npx quartz sync`

And boom — the entire garden goes live.

Every update, every note, every backlink… published instantly.  
**No more yak shaving. Just growth.**

---

> [!info] Related
> This note is part of the [[index#🪷 About this Garden|About the Garden]] section.  
> Curious how it’s grown over time? Check out the [[Garden Changelog]] 🌱

