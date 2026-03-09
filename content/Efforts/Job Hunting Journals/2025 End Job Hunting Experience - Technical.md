---
title:
draft: false
tags:
date: 2026-03-09
---
technical preparation: coding + project experience 

behavior / open ended qn: use of AI, collaboration, etc.

interview mindset: collboration / not being questioned,  never give up 

---

这次面试前后我大概面了15多场，回头看，自己做得比较对的准备，主要有下面几件事。

**1. Coding 还是得准备，但不用神化它**  
前几轮基本都会考 LeetCode。我自己比较幸运，遇到的大多是 easy / medium。面试前大概集中刷了半个月，每天做几道，主要用 Python 写，因为确实会比 Java 更适合面试时快速表达思路。

**2. 项目经历一定要提前打磨**  
工作 1 年多后，项目经历的重要性非常高。  
我以前总觉得自己做的事情很零散，impact 也不够“大”，但后来发现关键不是项目本身有多厉害，而是你能不能把它讲清楚：背景是什么、问题是什么、你做了什么、为什么这样做、最后带来了什么结果。  
我平时有记录工作内容的习惯，所以在准备面试时，会把这些素材重新梳理，也会借助 ChatGPT 帮我把零散内容整理成更有逻辑的项目故事。

**3. 不只是准备答案，更要准备 follow-up**  
我觉得很有帮助的一点是，站在面试官的角度反过来问自己。  
比如：为什么这样设计？难点在哪？trade-off 是什么？如果重来一次会怎么改？  
你在准备时被“追问”得越充分，真正面试时就越稳。到后面会慢慢形成一种表达惯性，就算不是每句话都提前准备过，也能比较自然地把思路组织出来。

**4. 心态上，把面试当成 collaboration，会好很多**  
尤其是 project discussion、system design、一些 open-ended question。  
后来我会更倾向于把面试看成一次合作讨论，而不是单向被 challenge。对方很多时候并不是在“卡你”，而是在看你怎么思考、怎么沟通、怎么一起推进问题。这个 mindset 对我帮助还挺大的。

**5. Behavioral 和 AI usage 也值得准备**  
除了 coding 和项目，我这次还被问到不少 behavioral / open-ended 的问题。比较有意思的是，也有几次被问到工作中怎么使用 AI。感觉这已经慢慢变成一个挺常见的话题了，所以可以提前想一想：你平时具体怎么用、用来解决什么问题、边界是什么。


**还有一个小经验是：面挂了也不要太快放弃。**

在我最后拿到的 4 个 offer 里，其实有 2 家公司是一开始面试的岗位已经挂掉了。但当时我还是和 recruiter 保持了沟通，表达自己依然很希望加入这家公司，也想问问是否有其他更匹配的岗位机会。

后来 recruiter 确实帮我把简历 internal transfer 到了其他 team，重新走了一轮流程，最后也顺利拿到了 offer。

所以我这次一个很深的感受是：**面试挂掉不一定代表和这家公司完全结束。** 有时候只是某个岗位不太 match，如果你整体背景合适，其实可以稍微“脸皮厚”一点，多争取一下机会。当然沟通方式还是要真诚、礼貌。


整体来说，我觉得这次能比较顺，一方面当然有运气成分；但另一方面，提前把项目经历和表达方式准备好，确实会很大程度影响面试的手感。

后面如果大家感兴趣，我也可以再单独写一篇：

- 这轮面试里常见的题型 / topic
    
- SWE / backend 和 SRE / DevOps 面试的异同
    
- 以及最后 offer 选择时我在纠结什么

chatgpt: https://chatgpt.com/g/g-p-686dcf82860c8191a7d849f9cadfec3b-hoyo-transition/c/69ad3b5e-1138-839f-953d-d26e2d6db20a

---

接着上一篇，

综合下来发现 PR + 1-2年经验 比较好跳

这一篇分享下技术轮 （technical) 面试的一些经验
- SWE （backend）

1. 算法题

- 除了 DevOps， 其他 SWE 的岗位 前几轮都逃不过 LeetCode
- 我比较幸运，遇到的大多是 easy / medium
- 面试前大概集中刷了半个月
- tips: 
	- 强烈建议用 python写，因为语法更简洁，也有很多实用的 built-in methods, 能省下很多 boilerplates code. 同样的实现，python的代码 可能要 比 java / c++ 的短一半
	- 我自己之前一直习惯写 java，但这次就花了一两周集中练习了用python  刷题，上手很快
	- 效果很好，能让我在更短时间内把思路表达清楚，省下时间可以聊更多项目经历啥的

2. 项目经历

- 因为我是已经工作1.5年，所以会被问到比较多项目经历

- 一开始准备面试时，我最大的一个苦恼就是，觉得自己做的东西都很零散，更谈不上什么 impact
- 但后来发现，关键不是项目本身有多厉害，而是你能不能把它讲清楚：
	1. 背景 / 问题
	2. 你是什么角色 / 定位，做了什么
	3. 为什么这样做，背后是什么 rationale，考虑了什么 trade-off
	4. 最终带来了怎样的 impact
- STAR method 

- 对于1， 2 -- 更偏技术方向，实现，可以根据你工作中的笔记、文档梳理清楚
- 对于3 -- 可以把 1，2 作为背景，丢给 AI 让他 提问，challenge 你。它可以引导你思考一些更深次的问题 （meta-question)，比如【为什么这样设计】、【为什么用 A 而不用B】、【假如系统某一块 break了，是否有 fallback / retry 机制】等等 —— 这些是你自己【正向思维】无法想到的，因为我们自己准备的时候只会顺着自己的思路来说，都很make sense，但它就能提供一些 why not 的问题，更像是真实面试中的状态。这个时候你越是觉得被challenged到，就能越早发现问题

- 对于4 -- 丢给 AI 写，这是 AI最擅长的，能把一个微不足道的小破 project 吹上天。最好再让它加上一些具体的例子作为支撑


1. 系统设计 （system design）

- 主要有两类问题，一类是比较传统的 -- 比如设计一个 URL shortener service，主要考。。；还有一类非常算法、逻辑的，比如设计一个 message q, 你要懂那个 worker pool, loop啥的实现。。就很难

- 可以看system design interview
- 不用担心，对于junior来说，更多的是看中你的思维过程，trade-off, 啥的（展开简单说说）

followup questions 
- 先准备一两个， show genienous curiosity.

---

先说说关于跳槽时机，结合自己 & 身边不少朋友的样本，一个感受：
> **有 PR + 1–2 年经验，在新加坡 tech 行业是一个比较好跳的阶段**

不过这也看每个人的节奏和感受，个人感觉对于两年内 junior:
- 能力圈 —— 是否不断有成长，与时俱进
- 变现圈 —— 薪资是否满意

---

# 求职复盘 Part 2｜技术面试（SWE / Backend）

接着上篇，这篇主要聊一下 **技术轮（technical interview）** 的一些经验

背景依旧是：
- base 新加坡🇸🇬，有PR
- SWE Backend 方向
- 1-2年工作经验

## Part 1. 算法 (Coding)

SWE 前几轮面试都逃不过
我算比较幸运，遇到的题都是 **easy / medium**
### Tips: 建议用 Python 写

- Python 语法更简洁，而且有很多 built-in methods，可以省下很多 boilerplate code
- 同样实现一段逻辑，Python 代码长度可能只有Java / C++ 的一半
- 不习惯也没事，可以临时学 —— 我自己之前就是一直习惯写 Java，但为了面试，花了一两周集中练习用 Python 刷题，**上手非常快**，效果也不错
- 面试时间宝贵，你写得越快，就有更多时间去聊更有意义的 topics

---
## Part 2. 项目经历（Project Experience）

我已经有 *1.5年* 经验，所以这块被问得很深入

一开始准备面试的时候，我最大的一个困扰是：

> 总觉得自己做的事情都很**零散**，更谈不上什么 **impact**

但后来慢慢发现，其实关键不是项目本身有多厉害，而是你能不能把它*讲清楚* 
### 思维框架：STAR

网上常说的是 STAR method (Situation + Task + Action + Result) ，我根据这个自己改编了一个模版：

> 1. 背景 / 问题是什么 **(Background / Context)**
> 2. 你是什么角色，具体做了什么 **(Role / Task)**
> 3. 为什么这样设计，背后的 **rationale /  trade-off?** 
> 4. 最终带来了什么 **impact**

### 怎么准备？用 AI 来 challenge 自己

对于 **1 & 2（背景 + 实现）** —— 通常可以根据你平时的工作笔记、文档梳理清楚

很多时候，真正难的是 **第 3 点：为什么这样设计 (rationale)**

我会把项目背景和实现思路丢给 AI，让它反过来 **challenge 我**，比如：

- 为什么用 A 而不用 B，**trade-off** 是什么？
- 有没有其他实现方案 (**alternative**)?
- 如果系统某一块*挂了*，有没有 **fallback / retry**？

这些其实是我们自己准备的时候 *很难想到的问题*，因为我们自己的思路往往是 **正向的**：
> “这个方案是合理的，所以我这么做。”

但 AI 很容易帮你提出 *why not* 的问题，也更接近真实面试的状态

当你在准备的时候一直感觉【被问倒】，真正面试时就会轻松很多

### 让 AI 来写 impact 

至于 **第 4 点：impact**，那就是 AI 的长处了

AI 很擅长把一个看起来很普通的小项目 【结构化】、【上价值】
相信我，你以为再不起眼的东西，都能被它包装成金子✨

最后可以让它加一些具体例子，保证真实性

---
## Part 3. 系统设计（System Design）

我大致遇过两类问题：
### 第一类：传统系统设计

e.g., 
- Design a URL shortener
- Design a notification system
    
这类题主要考：
- architecture design
- data model / flow
- scalability
- trade-off
### 第二类：偏逻辑 / 偏实现的问题

有些公司会问更偏 **工程实现** 的问题，e.g., design a message queue

这其中就涉及到，
- worker pool 机制
- event loop 怎么设计...

这种问题其实更接近 **系统内部机制**，  
个人感觉比传统 system design 难一点，更靠【逻辑】而非【套路】

### 建议：不用太焦虑，专注思维过程

对于 1–2 年的 junior, 面试官其实更关注的是：
- 你的 **思维过程**
- 如何 **拆解问题**
- 是否能讨论 **trade-off**

而不是一定要给出一个完美答案

很多时候更像是：
> 你和面试官一起讨论一个问题，尝试去得到一个 conclusion，这个过程中会涉及到一些 trade-off, design decision

---
## 一些小的观察

1. **所谓的【八股文】其实并没有被问很多，更重要深挖项目经历**
- 很多问题都会围绕系统设计、trade-off、系统出问题如何处理
- 比起死记硬背，面试官更想知道的是你*是否真正理解自己做过的系统*

1. **即使已经进入 AI 时代，面试形式其实并没有发生太大的改变**
- coding round 依然是标配，Leetcode该刷还是要刷
- AI 改变了很多开发方式，但至少目前来看，*面试本身还没有发生本质性、结构性的变化*

## 小结

SWE 技术面试，大致可以拆成三块：
- **coding**
- **project discussion**
- **system design**

其中我自己感觉最重要的一点是：

> 项目经历一定要提前打磨好。

很多时候，技术面试不只是看你会不会写代码，  
更是看你 **是否真正理解自己做过的系统。**

---

如果大家感兴趣，下一篇我会写：

**Behavioral / open-ended questions**

包括：

- collaboration / conflict
    
- AI 在工作中的使用
    
- 一些比较常见但不太好准备的问题。

---
