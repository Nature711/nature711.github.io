---
title:
draft: true
tags:
date: 2026-02-06
---
## Reflections

For a very long time, I've been struggling with understanding & applying networking related concepts. 
I mean, I've passed the module, had a degree in CS, knew all the terms & concepts. And I've been working as a DevOps / cloud engineer for 1.5 yrs, who heard and encountered these concepts almost every day.. (shame). 
But somehow they just don't "enter my mind". Worsen still, it's hard for me to articulate / pinpoint what's really going wrong, so I couldn't find a way out of it. I guess it's more of the problem of "sense-making" -- I know everything on paper (fixed), but they just haven't yet "make sense" to me (fluid).

I had countless attempts to re-learn everything from the fundamentals, but none of them really worked / lasted. Every time I open the book (a top-down approach to computer networks), I feel ambitious for a very transient moment, yet the energy faded away almost right after I start to read the page. Gradually, I start to hate and doubt myself -- why everyone else can make sense so easily, while I'm just constantly struggling, coupled with the fact that I need to work with it every day? Am i really just that stupid???

Sometimes i try to learn from real cases (which I believe is my preferred way of learning, compared to merely grudging the textbook). At certain moments I feel that im almost about to "click"... 

Today I try to open my personal website on company's laptop but got this "this site can't be reached error". I have no idea what's going wrong. I sighed. Not because I can't open the website itself. But because this triggered a familiar and disgusting feeling of incompetence -- that even after soooo long and so many struggles, my mind still blanks out when i face this kind of very basic qn of "website unreachable". And it's not just I can't figure out why -- I don't even have any big picture / structure / framework in mind that may help me approach the issue clearly.

Somehow this quote came to my mind -- Ever tried ever failed. No matter. Try again. Fail again. Fail better. 
I'm not even sure if it's sarcasm or encouragement. 

Nevertheless, I tried again. Just not carrying much hope. 

---
## Debugging approach

### Think in terms of layers

- at which layer does this error occur?

```
Application (HTTP)
TLS (HTTPS)
Transport (TCP)
Network (IP routing)
DNS
Local machine
Browser
```

### Layer by layer walkthrough

