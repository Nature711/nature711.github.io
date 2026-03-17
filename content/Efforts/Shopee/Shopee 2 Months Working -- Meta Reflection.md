---
title:
draft: true
tags:
date: 2026-03-13
---
# 背景

这是我入职 Shopee 第二个多月时，给自己做的一次阶段性记录。  
我想把这段时间的感受、挣扎、反思和成长都记下来，不只是为了发泄情绪，而是为了给未来的自己留下一份参考：我当时是怎么想的，我是怎么一步步适应新的环境、建立新的能力框架的，以及我之后到底该往哪里走。

---

# 一、时间线梳理

## 0. 跳槽前：从 HoYoverse 离开，到选择的分叉口

毕业之后的一年多，我一直在 HoYoverse 做偏 infra / cloud / 运维相关的工作。  
那段经历并不是完全没有收获，但总体上，我始终觉得自己没有真正接触到“有意义的活儿”。

很多时候，我做的是一些比较机械、零散、缺乏闭环的事情：  
比如简单写一些自动化工具、处理云成本管理、对账之类的工作。它们不能说完全没价值，但对我来说，问题在于：

- 它们不构成一个完整的技术成长路径
    
- 我没有真正参与到一个复杂系统的核心建设里
    
- 我想学的很多东西，缺少实际项目承载
    
- 于是我的学习就变成一种非常零散、非常漂浮的状态
    

我会去和不同的人聊天，会想看看新的方向，会尝试东学一点西学一点，但因为没有项目落地，这些输入都没有形成稳定的知识结构。结果就是：我看了很多，听了很多，但什么都不够深入，什么也没有真正掌握。

> At my peak of confusion:  [[Letter to Future Me, 20251114]]

后来进入面试阶段，我一方面靠自己准备，另一方面也大量借助了 ChatGPT 和各种 AI 工具，让它们帮我把过去那些其实并不算特别亮眼的项目经历，拆解、包装、提炼、总结。某种程度上，我是在 AI 的帮助下，第一次把自己过去做过的事情“说清楚”了。结果出乎意料地好，面试过程非常顺利，几乎是百战百胜，也拿到了几个不错的 offer。

> - Interviews: [[Interview Timeline]]
> 	- 15 interviews, each with notes
> - Outcome: [[2025 End Job Hunting Visualization Charts]]
> - Journey
> 	- [[2025 End Job Hunting Experience - General]]
> 	- [[2025 End Job Hunting Experience - Technical]]

但真正难的，不是拿 offer，而是做选择。

---

## 1. Offer 决策阶段：在 infra backend 和 product backend 之间摇摆

当时我主要纠结的是三种方向：

- 纯 SRE
- infra backend
- product backend
    
纯 SRE 方向我其实有点望而却步。不是说它不好，而是我已经切身体验过那种偏 support / infra / reliability 的工作形态，我知道它可能会比较卷、比较累，而且容易再次掉进我之前那种“做了很多但没有真正构建核心能力”的陷阱里。

所以我最纠结的是：

- **Airwallex infra backend**
    
- **Shopee voucher team product backend**
    

Airwallex 对我来说，其实在很多层面都很有吸引力：

- 更高的薪资和整体 package
    
- 我过往经历和它更连续，more like a continuation of my previous experience (infra & cloud)
    
- 团队对我的评价也很好，是 very strong hire
    
- 公司本身是快速发展的 unicorn，很多朋友也陆续加入
    

但我当时也有很多顾虑。  
我听到的一些反馈是，它节奏会比较快，更偏 startup 风格，体系没有那么成熟，要求比较高，需要进去就迅速做事，未必会给你很多系统性的培养。
我最怕的是，我刚从 HoYoverse 那种“成长不成体系”的状态里出来，如果直接进入一个要求很高、节奏很快、需要迅速上手输出的环境，会不会基础还没打稳，就又被推着走。那样的话，也许钱更多，但成长未必更扎实。

相对来说，Shopee 给我的感觉是另一种逻辑：

- onboarding 更 structured，对新人培养更友好
    
- 是很多人眼中的一个“打基础”的地方
    
- 在新加坡本地知名度高，是个不错的 stepping stone
    
- 很多人从 Shopee 再跳去更好的公司，这条路径是被验证过的
    

所以那时候我最后说服自己的逻辑是：

我现在最缺的，不是再去一个更快更猛的地方硬扛，而是先进入一个相对成熟、有明确训练路径的环境，把 backend 的基础、工程化能力、系统思维、业务理解真正打牢。钱的差距先不要看得太重，先把自己练出来。

当时很多人劝我去 Airwallex，但也有少数我信任的人会说：  
**Airwallex 很好，但未必是你现在这个阶段最适合的。**  
我当时就是相信了这个判断，最终选择了 Shopee。

现在回看，我依然能理解当时这个决策的逻辑。  
它并不是一个“糊涂的选择”，而是一个基于当时认知做出的、偏稳健的选择。

但这不妨碍我后来产生反复的后悔和动摇。

> - [[The Career Choice that Exposed the Flaw in my Decision-making Mechanism]]
> - [[Choosing Between Shopee vs. Airwallex]]

---
## 1.5 During Limbo Month

> - Sense of achievement: [[A Reflection on Comfort, Drift, and Rediscovering Drive]]
> - Setting direction, though not implemented
> 	- [[Limbo Month]]
> 	- [[Next Steps 20251217]]

---

## 2. 入职第一个月：两个 Entry Task，把我从“会讲故事”拉回“真刀真枪写系统”

### 2.1 Entry Task 1：用 Go 写一个 user management system

入职后的第一个月，我做了两个 entry task。  
第一个 task 是用 Go 写一个 user profile login and management system。这个任务其实很能暴露问题，因为它不是一个纯粹的 toy project，它有明确的 functional requirement，也有 performance requirement。相关要求包括高并发、缓存、有无缓存下的登录吞吐指标，以及 HTTP/TCP 分层、MySQL、protobuf 等设计约束。

对我来说，这个任务的挑战是多层的。

一方面，虽然我大学学过 Go，但这是我第一次用 Go 去写一个相对完整、偏工程化的 backend project。  
另一方面，我已经很久没有真正“自己从头理解并搭建”这样的系统了。过去几年 AI 工具越来越强，我也越来越习惯于把问题直接丢给 AI，尤其是 Cursor 出来之后，基本上是在 IDE 里直接开 agent mode，让它帮我写、帮我改、帮我推进。

表面上看，我后来已经比最开始“成熟”一点了。  
比如我不会完全无脑地让它一路乱写，我会先让 ChatGPT 帮我拆步骤、做 plan，再把这些步骤喂给 Cursor，让它一步一步执行，我自己再去验证。这个 workflow 看上去已经比“纯甩手掌柜”强很多。

但问题在于：  
**workflow 变精致了，不等于理解变扎实了。**

在这个 task 里，我最大的失败并不是“没有把功能做出来”，而是我让 AI 帮我迅速搭了一个庞大的系统，但我对里面的大量设计和实现其实并没有真正吃透。前期功能写得很顺，但一到性能优化阶段，问题就开始集中爆发：

- 为什么达不到 RPS 要求？
    
- 真正的瓶颈在哪里？
    
- pprof 到底怎么看？
    
- cache 起了什么作用？
    
- TCP connection pooling 为什么会影响性能？
    

这些问题一旦开始出现，我就陷入了非常典型的混乱状态：  
不是基于清晰模型去定位问题，而是开始不停问 AI，不停开新 chat，不停 trial and error，这里改一点，那里改一点，越改越乱。到后面项目结构越来越臃肿，我自己越来越没有掌控感，最后甚至慌到去看别人的 repo，把别人的写法搬过来，但搬过来也不理解。

后来我一度试图“推翻重来”。  
我告诉自己，也许问题不是技术本身，而是前期欠了太多**理解债**；如果我重写一遍，从头一点点建立掌控感，也许就会好很多。

但结果是：  
前面会写的地方还是会写，真正难的地方我还是继续让 AI 直接生成，我还是没有真正跨过那个门槛。  
所以问题反复出现，一遍又一遍。  
这让我第一次非常强烈地意识到：  
**AI 可以大幅提高推进速度，但如果我没有自己的问题框架和判断力，它也会把我带进更大的混乱里。**

除了技术本身，这个 task 还暴露了我另外两个很严重的问题：

### （1）时间管理与预估失真

我总会高估自己的效率，低估任务复杂度。  
我会默认进度大致是线性的：今天做到这里，明天做到那里，后天差不多收尾。  
但真实情况是，工程任务不是线性推进的。尤其是前期看起来很快，后期一旦进入性能、稳定性、调优、debug 阶段，复杂度会突然抬升。

所以最后的结果就是：

- 我不断延期
    
- 明明快 demo 了，核心问题还没解决
    
- 只能用下班时间、周末时间去补
    
- 连续几天做到凌晨一两点
    
- 第二天精神很差，但又不敢停
    
- 处在一种高压、亢奋、快崩溃的状态里
    

### （2）自我认知被冲击

我原本是带着某种“我虽然不是纯 backend 出身，但应该也不会太差”的预期进来的。  
结果 entry task 直接把这种预期打碎了。

尤其是当我和几个校招生聊天时，我会感到很强烈的 peer pressure 和落差。  
他们是第一份工作，是校招进来的人，按理来说上手应该慢一些；但他们在做同样任务的时候，虽然也 struggle，最终却基本能在规定时间内完成并达到性能要求。而我明明已经有一年多工作经验，是跳槽来的第二份工作，却反而做得很狼狈。

我开始怀疑：

- 我是不是能力真的不行？
    
- 我是不是之前的经验毫无价值？
    
- 我是不是高估自己了？
    
- 我是不是一个“水货”？
    
- 我连试用期都不一定过得了？
    

这种冲击是很真实的。  
因为它不只是一个 task 没做好，而是会让你连带性怀疑自己的职业选择：  
**backend 会不会本来就比我想象中难得多？我是不是根本不适合？**

---

### 2.2 Entry Task 2：把系统迁移到 GAS

第二个 entry task 是把前一个 task 里自己写的系统，迁移到公司内部 framework——GAS。这个任务更偏向理解 Shopee 的内部技术栈，比如 SPEX、GAS、CMDB、配置、部署、可观测性等。

这个 task 的 challenge 和第一个不一样。  
它不再主要考察性能优化，而是逼我开始理解“公司工程体系是怎么运作的”。

但这个过程对当时的我来说依然很迷茫。  
我基本上还是在照着 tutorial、参考别人代码、看 example 的过程中一点点拼起来。  
很多概念，比如：

- dependency injection
    
- lifecycle management
    
- config SPI
    
- service registration
    
- deployment config
    
- cache / DB / yaml 配置
    
- test 环境部署
    
- 观测和日志
    

我都处于一种“好像知道这个词，但并不真正理解它在整个系统里扮演什么角色”的状态。

甚至一些在别人看来可能很基础的事情，当时对我也并不熟：  
比如浏览器里发 HTTP request，怎么去 inspect request；部署之后怎么去看它实际有没有跑起来；各种 yaml、平台配置、环境资源是怎么串起来的。  
所以这个 task 的完成感并不强，更像是：  
我勉强把它做出来了，但心里其实是虚的。

如果说第一个 entry task 暴露的是“写系统和性能优化”的薄弱，  
那第二个 task 暴露的就是“工程环境与框架认知”的薄弱。

第一个月结束时，我最大的感受其实就是：  
**非常痛苦，非常混乱，但也非常真实。**  
它把我过去那些可以靠面试包装、靠表达、靠 AI 辅助撑起来的东西，都逼回了“你到底会不会”这个层面。

> [!info]- Discussion thread with ChatGPT: [link](https://chatgpt.com/g/g-p-693eac8167188191ae5403a4693be97c-shopee/c/6978af60-3044-8322-82de-1bd5014c9af3)
> So I'm going to reflect on what's really going on recently. So I've been in this new company, Shopee, for four weeks already, and I've finished two entry tasks. And yeah, it was quite slow. My progress was, I mean, the pace is fast, but my progress is much slower than I expected. So for their expectation, they want me to, for each entry task, they give me like one week to complete, but actually I took one week and a half for each task, and end up spending more time debugging and understanding a lot of things as well, which now is the fourth week, and yeah, I just finished. Actually, not yet. I'm still trying to refine something. Yeah, so it's this user management system, which I gave you, like, yeah. So for the first one, it was just about developing, and I validated the real, like how the backend development works, and I underestimated how long I need to take for the performance requirement I need to meet. So I developed the functional one very quickly, but the performance one I cannot meet, cannot meet. And yeah, I ended up, like at the very last minute, I tried to rewrite everything from scratch just to understand how things work and how... Because for the first time, I just let ChatGPT to plan out how to break down the steps, and I paste the files to Cursor to let it execute step by step. I thought this was a very structured approach and can let Cursor behave deterministically, and I advocated this type of approach a lot. But actually, I didn't really understand, I didn't really look into what's really going on. So I assumed the performance will just meet the requirement. I didn't even doubt anything until at the very last moment, I can see the performance was not meeting the requirements. And I tried to see like the difficult part, like the connection pooling and the protobuf marshalling and unmarshalling, those kind of thing. I tried to see how it works. And I tried to understand how Pprof works. All those tools I haven't experienced before. I'm trying to see how it works. And I over-relied on AI to help me debug, and I didn't understand anything. I'm just getting more and more confused. And luckily, I saw someone else's repo and just try to copy their code. And yeah, yeah, but I still didn't meet the requirement as I tried to review everything from scratch. So yeah, I acknowledged this during my first demo. I even delayed it by one day because I really wasn't able to meet the requirement. I really, really rushed a lot. Yeah. Yeah, and after the first demo, I tried to redo everything from scratch once again, once again. This time, let's making use of the cursor tab. Instead of letting it write the entire file, I just used tab, tab, tab and try to understand the behavior. Yeah, it still doesn't work and I broke some of the architecture requirement, which is to put the cache logic into the HTTP layer. It worked to meet the performance, but yeah, it failed architecturally. And I'm aware of this trade-off. I still don't know how to debug it and I really have no direction. Like, I am helpless. I'm really helpless. But never mind, I just move on to the second entry task, which is to understand the company's internal framework and to migrate the system to rewrite it using that framework, just about changing the wiring. And I thought after I just understand the framework and everything will work. And it took me a lot of time to wrap my mind around how it works. And I try to ask my mentor, ask tech lead, and I try to sync up with them every day and try to, yeah. And it took me a lot of time to understand and when I get started, it still feels quite hard and I still don't quite understand how the dependency injection work and how it works. And I just still trying to look at other code and try to piece together all those different things just to make the thing work. Yeah, that's really, really hard. And also the cursor reaches the limit, so I have to rely on most of my stuff to write. Luckily I finished it, but yeah, it was still quite hard. And I already extended the date by a few, and I had to work overtime every day and even over the weekends. I didn't, I haven't even stopped at all. And I feel that I'm just, I'm just working so hard and dedicating all my time just doing this project. And that that wasn't as expected, but I'm still far below the timeline. Yeah. And actually on the demo date, as I deployed the project into the... the online environment, some functionality broke as well, and I had to spend extra time debugging it. And in the requirements, they also require me to set up like monitoring, Grafana dashboard, and unit testing, which I just set up very quickly, and I didn't have time to write a unit test, which they say it's a criteria I need, but yeah. And also, during the demo, I struggled a lot because they asked me a lot of deep questions, like how the framework works internally, and your understanding of the framework, and what's really happening behind the scene, those kind of questions, which I barely could answer because I just about to get the things work, and I don't look into too much detail of the framework, and I really don't have time. I don't know why I'm spending so much time and I'm so far behind the timeline. And I feel quite bad after the demo because I couldn't answer half of their questions, and also, they haven't given me a proper feedback yet, but from what I heard, they say I have huge timeline-related issue, which I acknowledge. Yeah, I couldn't agree more because every time they give me a timeline and I try to estimate, I can say I want to delay it by a few days, but even after a delay, I still couldn't make it work, and I make some sacrifice and trade-off. And the second time, they gave me this timeline, they wanted me to extend by a few days. I did so, and I still couldn't get things worked. Why is that? And even that I'm working overtime every day, as I mentioned, I work over the weekend, I work at night, and I work. I just don't understand why am I so slow, and like, I've asked a few, like, junior joined last year, and they said they were able to meet the requirements, even if it's hard, they need to OT a bit. It was not that bad, at least all of them meet the requirements. And they are even one year less experienced than me, so I'm just really doubting myself, what's really going wrong with me, and I'm feel feeling so bad, I'm feeling so bad. I'm still trying to catch up with the unit test, and they are giving me one more task later, which will go into the real feature development later. And I'm just feeling so bad, like... The worst thing is, because at the moment when I search for a job, I got multiple offers, and this is the one with the lowest salary, but everyone say that this environment will be quite chill and other companies, the workload may be higher, and yeah, so because I came from a very relaxed environment where I didn't have any scope, I didn't need to do anything, like I just laying down flat, and I just slacking ojust slacking off almost every day, and every day I'm like doing less than two hours of work, and for the rest of the time, I just spend on my own, like write some diaries and just chilling off and talking with friends, because it was just too chill, and I am afraid that I couldn't get used to the more pressure environment in other companies, so I think I would choose this company as a bit of like a transition and will help me ramp up with the real development workflow, and they say this company offers more like onboarding and more structured documentation and guide, which it is the case. Yeah, but so I think it comes with a cost, like they offer a lower salary, and there's no sign-on bonus, which I missed a lot, a lot, a lot of money. Yeah, that's a lot of money. It's not a small amount. So I'm already feeling bad enough on this, and I try to think about like I'm going to learn in a more friendly, in a more like less stressed environment, which can help me ramp up and gradually get used to it. Yeah, but the problem is this is the worst thing I could ever think of. I mean, I'm literally working every day. And every moment on weekends and after work, and even my lunch break was truncated as well. I just couldn't find a reason to stop and I just couldn't stop. Like, I feel so tired. I feel so burned out, but I couldn't stop because the pace is just so fast and I'm already falling behind. So I'm really, I really don't understand what's going wrong here. And this made me feel so bad and it made me feel so bad that because if I go to another company, like, I don't believe any other company will have such high workload, will have such fast pace. And I choose this because I want a more relaxed environment and I sacrifice a bit of salary, but here it is, like, it's lower salary, but it's damn stressful. I mean, it's damn stressful. I mean, I have to acknowledge that they are giving me a lot of feedback. And I have my mentor, my tech lead, and my peers, they're all quite helpful. They're offering me a lot of help whenever I need. And that indeed, I learned a lot, so much more than I could, than I learned during the last year. Yeah, so I'm growing very fast, but I'm just, I'm just a bit burning out.And I don't know where am I heading toward next, and because it couldn't be like this.I really want to hear from your feedback, because if I talk to others, others will just comfort me and say, It's okay, because you don't have this kind of experience before and you're just trying to get used to these things, so you are allowed to move slower than others. You don't need to compare yourself with others and you can, like, learn at your own pace and as long as you are growing, then that's good, and you're already quite good. I don't want to hear these kind of things because that's meaningless. I want to address what's really going wrong with me. 
> I mean, I don't know what to say. I'm not chasing perfect understanding. I'm already sacrificing a lot of things. Like, I have to move on. I know I have to move on. And really, I finished it with partial understanding. But now the penalty is, I'm questioned deeply during the demo, which made me feel extremely bad because when they asked me about, like, the framework internals and how you understand it, like, how does this really work under the hood? I couldn't understand any of the things. I just say all the surface level things which I try to understand. Yeah, I really... That's the worst part. Yeah. I didn't chase perfectionism. Yeah, and also regarding debugging, I'm already making a lot of sacrifice and making trade-offs. It's not that I'm chasing perfection. Yeah, and for other juniors you mentioned, all of them were able to meet the requirements.
- 背景是当时warm-up task 2 demo刚做完，被challenge了很多问题都答不上来，已经够崩溃够自我怀疑了，却还因为 unit test 没有重视、没来得及写，而还要继续补，就真的非常崩溃，what's worse 是自己也根本不知道怎么写，cursor limit 还用超了hhh
- 不仅是吐槽压力大、怀疑能力，也触发了 decision remorse，早知道强度压力这么大，不如去一个高工资的地方，为啥要来一个钱又少又累的地方来受苦，真tm脑抽

---

## 3. 第二个月：开始进入真实 repo，开始第一次感受到“我在做真正的 backend 工作”

进入第二个月以后，状态稍微好了一点。  
因为开始做 warm-up task，终于不再是凭空造一个练习系统，而是进入公司真实 repo，去改实际业务里的 bug fix 和 feature。

这个变化很重要。  
因为它让我第一次真正接触到：

- 真实的调用链
    
- 真实的服务边界
    
- 真实的上下游 contract
    
- 真实的运行日志
    
- 真实的 code review
    
- 真实的多人协作
    

也正是在这个阶段，我开始第一次觉得：  
**这才是我想象中的 backend 工作。**

---

### 3.1 Warm-up Task 1：TCC cancellation edge case

第一个 warm-up task 是一个 TCC cancellation flow 的 edge case 修复。  
核心问题是：在 cancel 流程里，会调用一个 batch get voucher txn 的 API，而这个 API 有 batch size 限制；如果某个订单对应的 voucher transaction 超过限制，就可能导致 cancellation workflow 失败，用户的 voucher 无法正确返还。解决方式是把原本单次请求改成按批次发多个请求。

这个 task 的改动本身，其实不复杂。  
甚至可以说，从代码层面看，它只是一个比较小的逻辑修改。

> [[TCC Workflow]]
> [[Warm-up task -- TCC edge case]]
> Reflection: (in Internal Confluence Page) 

但这个 task 对我的意义，不在于改动大小，而在于它第一次让我比较完整地感受到：

### （1）业务背景和技术设计为什么是连在一起的

当时 mentor 给我讲整个 try / confirm / cancel 的背景，讲 TCC 为什么存在，讲 distributed system 里 consistency 和 availability 的考虑，那个时候我会第一次很强烈地感觉到：

以前在书上看 distributed system，是一个抽象的概念；  
但当你看到它落实在一个具体业务流程里，它就“活”了。

这对我来说很重要。  
因为我一直都不是那种只想背概念的人，我更喜欢看到概念为什么被发明、它在现实里解决了什么问题。

### （2）我开始享受“trace 一条完整链路”的过程

这次 task 里，我开始让 Cursor 帮我 trace repo、定位调用链，然后我自己去把这些 layer-by-layer 的调用关系拼起来。  
从 handler，到 service，到 domain service，到 repo，再到外部 API 调用，这个过程让我第一次比较完整地看到：

- 一个 request 是怎么进来的
    
- 经过哪些层
    
- 数据是怎么往下传的
    
- 错误是怎么往上返回的
    

当我把这个 picture 拼完整的时候，我是有成就感的。  
这和之前做 entry task 那种“乱七八糟搭系统”的感觉很不一样。  
这里的快乐更像是一种逻辑上的满足：我把一条真实的链路看懂了。

### （3）我第一次更深地意识到：改代码不能只看本地逻辑

这个 task 最开始我觉得自己已经做完了，因为逻辑改出来了。  
但 code review 给了我很大的提醒：  
真正重要的不只是“这个函数改对没改对”，而是：

- 你调用的外部 method 出错时返回什么形式的 error？
    
- 你 batch 之后，中间某一批失败了，该怎么处理？
    
- 最终返回给 caller 的 contract 有没有变化？
    
- 上游依赖这个方法的人，会不会因为你的改动收到不同的 error 行为？
    

这其实是在逼我从“local change 思维”走向“boundary & contract 思维”。

我后来越来越意识到，backend 很多时候的难点不在于代码本身复杂，而在于你能不能意识到：

- 这个方法不只是你自己在用
    
- 它嵌在一个更大的调用网络里
    
- 你的改动会沿着 contract 向上游和下游传播
    

### （4）我开始意识到：静态理解不够，必须验证 runtime behavior

我当时一开始只停留在“我把代码逻辑 trace 清楚了”，但后来才意识到这远远不够。  
真正关键的是：你得实际发一个 request，然后去 log platform 看它到底跑成什么样。

比如：

- batch logic 到底有没有生效？
    
- 实际发了几次请求？
    
- 每一层的 log 怎么打出来？
    
- runtime behavior 和我脑子里想的一样吗？
    

这是一个很重要的认知转折。  
以前我更偏向“看懂代码就觉得自己懂了”，  
现在我开始知道：  
**看懂静态代码，只是第一步；验证系统在运行时的行为，才是真正闭环。**

---

### 3.2 第一次 cycle review：一个中肯的评价

第一个 cycle 结束时，收到的 review 大致是：

- 工作态度、努力程度、反思意识都不错
    
- 愿意主动 check-in，也有很强的自我反思
    
- 但 technical ability 和 coding ability 仍然有明显提升空间
    
- 尤其是在 large complex Go project 的 navigation 上
    
- 对 API boundary、service contract、系统边界的理解需要加强
    

我觉得这个评价是非常中肯的。  
它没有否定我的努力，也没有因为我态度好就美化我的技术问题。  
它很准确地点出了：  
我不是不努力，我的问题是**能力结构还没建立起来**。

> - [[Shopee Probation Cycle 1 Review]]
> - [[Shopee Probation Cycle 1 Reflection]]

---

### 3.3 Warm-up Task 2：Shadow traffic isolation

第二个 warm-up task 和第一个风格完全不同。  
这是一个更偏技术治理、偏基础设施隔离的任务：要把 normal traffic 和 shadow traffic 的 rate limiter / circuit breaker 隔离开，避免 FCST 之类的压力测试流量影响真实线上流量。它本质上是在让系统根据“是不是 shadow traffic”这个信号，去读取 shadow 专属的 rate limiter 和 resilience 配置，而不是共用 normal 的配置。

相比第一个 task，这个任务没有那么强的“具象业务感”，它更抽象。  
它不是那种“这个用户点了什么，所以某个业务流程出 bug”的故事，而是：

- shadow traffic 是怎么标记的？
    
- rate limiter 怎么工作的？
    
- circuit breaker 在什么条件下打开？
    
- normal 和 shadow 的隔离到底落实在哪一层？
    
- config 是怎么读取和 fallback 的？
    

一开始我其实很懵。  
因为它不像前一个 task 那样，有很清楚的业务背景和链路。  
它更像一个“系统行为和机制”的问题。

我还是把东西丢给 AI，让它帮我写 tech design，然后一边看一边理解，再硬着头皮实现。  
代码最后改出来了，review 也过了，但其实我心里一直是不踏实的。  
真正让我开始理解这个 task 的，不是在写代码的时候，而是在 **end-to-end testing** 的时候。

我需要面对的问题是：

- 你要发什么 request 才能 trigger rate limiter？
    
- 怎么模拟 circuit breaker open？
    
- config center 里具体要改哪组 config？
    
- 怎么确认系统真的读到了 shadow config？
    
- 要不要让下游超时？还是直接关停服务？还是调低阈值？
    

这些问题一出来，我才发现我其实并没有真正理解这个系统。  
于是我开始逼着自己去 trace：

- request 到底怎么进来的
    
- step function 是怎么走的
    
- rate limiter internal counter 存在哪里
    
- common library 的实现在哪
    
- 它底层是不是 Redis
    
- Redis counter 是怎么被操作的
    
- resilience 的配置和命令名是怎么对应的
    

这一次，我终于不是只停留在“代码改通”这一层，而是慢慢去理解：

- 这个系统在运行时到底发生了什么
    
- 每一个 config 和机制在现实里怎么体现
    
- 我如何设计一个测试，去故意触发这些行为
    

这件事非常难，但也让我第一次真正享受一种更纯粹的 technical challenge。  
它没有那么多业务细节，而是更靠系统思维、逻辑推演、机制理解。  
而且虽然和 QA back and forth 很久，但每一次解释、每一次模拟、每一次验证，其实都在逼我把理解再往深处推进一层。

> - [[Warm-up task 2 -- E2E Request Flow]]
> - [[Warm-up task 2 -- TD]] -- in confluence page as well
> - [[Warm-up task 2 Shadow Traffic -- Meta Learnings]] -- todo
> - [[Warm-up task -- FCST shallow traffic isolation]]
> - Reflection: (in Internal Confluence Page) 
> 	- Retro
> 	- Verifying runtime behavior, not just static code

---

### 3.4 Medium Task：Food voucher customization

接下来的这个 medium task 给我的感受又和前两个不同。  
如果说第一个 warm-up 更像“顺着一条链路理解业务和代码”，第二个更像“抽象系统机制理解”，那这个 task 则第一次把我拉进了一个更真实的跨团队 feature project。

这个项目的本质是：  
ShopeeFood 那边新增或修改一些 voucher 相关字段，比如 use link、terms and conditions link、subtitle 等，我们 voucher 这边需要在多个 layer、多个 repo 中把这些字段接起来，再返回给前端。

代码层面的改动，实际上并不一定最难。  
真正难的是：  
**这是我第一次感受到，一个看起来“不就是加几个字段吗”的 feature，在大组织里为什么会牵扯出这么多沟通和协作成本。**

因为这个 task 不再是一个 isolated sandbox 里的小改动，而是涉及：

- 需求本身怎么定义
    
- Food 那边什么时候改 proto / API
    
- 字段以什么形式返回
    
- 前端到底希望拿到什么结构
    
- 前端会在哪条 flow 触发这个请求
    
- 各方什么时候完成各自的部分
    
- QA 要怎么测
    
- 这些改动跨多个 repo 后如何联动生效
    

对之前更习惯独立做事的我来说，这种协作密度是很头大的。  
以前我更多只需要把自己负责的那块逻辑改好，不需要考虑别人什么时候交付、我的改动要不要适配别人、整体节奏怎么对齐。  
但这个 task 让我意识到，feature delivery 在大公司里本来就不是“一个人把代码写完”这么简单。

> - Discussion with ChatGPT: [link](https://chatgpt.com/g/g-p-693eac8167188191ae5403a4693be97c-shopee/c/69b2abf6-d370-839e-a8c8-1ffaa02bd258)
> - Some emotion about too much time on Coordination: [[2026-03-12#Others]]

一开始我对整个 flow 的理解就花了很久。  
而且我后来也发现，我一开始踩了一个很典型的坑：  
我没有先搞清楚前端的 request 到底是怎么发过来的，就直接让 Cursor 去分析 repo、猜 flow。  
但 Cursor 并不了解实际业务和前端触发方式，它只能基于代码做猜测；而我自己本来又一无所知，于是就很容易被这些猜测带偏，越看越迷茫。

后来我才意识到，更正确的方式应该是：

1. 先问清楚前端到底怎么触发这几个 flow
    
2. 再去 log platform 里找一条真实正在跑的 request
    
3. 先从 runtime 看到“活的链路”
    
4. 再回去看代码，理解这些层是怎么接起来的
    

这个转变对我很重要。  
因为它代表我开始知道：  
**在业务复杂、跨团队的系统里，不能只靠静态代码推测，你得先找到真实世界里的参照。**

另外，这个 task 还让我第一次比较具体地理解了 **proto 作为 contract** 在多 repo 系统里的意义。  
以前我当然知道 proto 这个东西，但更多只是把它当成一个语法文件。  
这次我才真正体会到：

- proto 和代码分开管理
    
- 它本质上是服务之间的 interface / contract
    
- 改 proto 之后要发 version
    
- 下游 repo 需要升级到这个 specific version
    
- 这种方式让多个 repo 可以更独立、更高效地协作

> [[Proto File & Service Mesh Best Practices]]

这类问题在单 repo、小项目里几乎感觉不到，但在大规模工程里就是日常。  
这也让我意识到：  
很多我之前没有见过的问题，并不是因为它“高级到我学不会”，而是因为我之前所在的环境、接触的系统体量，根本还没有把这些问题暴露到我面前。

这其实是一个很值得安慰的点。  
它说明我现在面对的很多困惑，并不全是我个人太笨，而是我正在第一次进入一个更复杂、更真实的大型工程环境。

---

## 4. 两个多月后的情绪反扑：decision remorse 越来越重

技术上虽然在慢慢进步，但与此同时，我的情绪层面其实越来越不稳定。  
尤其是这段时间，关于“当初是不是选错了”的懊悔感，变得越来越强。

刚入职的时候，我其实已经对 Shopee 的 package 落差做过心理准备。  
我知道：

- base salary 虽然比上一份略涨
    
- 但整体福利不如其他 offer
    
- 零食、晚餐这些小 perk 会差很多
    

我那时候告诉自己，这些都是小事。  
既然我来这里是为了学习和打基础，那就不要太在意。

但现实中，it just doesn't work like this ——

我每天接触的，是这些真真实实的体验（e.g., 看着寒酸的零食柜皱眉、吃着难吃的饭菜而无奈、一整天坐在工位后的腰酸背疼、最后拿到“微薄”的薪水。。）—— 我好像很难靠着【这些细枝末节的小事都不重要，最重要的是学东西、积累经验，让简历更漂亮】的【宏观叙事】来安慰自己。
（当然这有可能是我的问题，过于【短视】，无法为了一个更长远、更有价值的目标与意义，而暂时牺牲一些眼前的福利）

但当这些差异在 day-to-day 生活里不断出现时，它们并不会只是“小事”，而是会不断累积成一种“我是不是亏了很多”的感受。

这些落差包括：

- 工资在几个 offer 里是最低的
    
- 工作量不小，但回报感不高
    
- 放弃了 HoYoverse 的 bonus
    
- 公司食物和零食落差很大
    
- 没有晚餐
    
- 没有 standing desk
    
- CNY gift 很寒酸

如果说这些都只是【细枝末节的小事】，那么接下来，当我确认到：

- 第一年的 performance 最好也只能拿到相对有限的 bonus
    
- employer CPF contribution 只有 5%
    
- 这和很多别的公司 full 17% 的差异，换算到每个月就是非常实在的钱
    

这种“机会成本”就变得非常刺眼。  
它不再只是抽象的“package 差一些”，而是变成一种持续的心理损耗：

**我是不是每天都在亏钱？**  
**我是不是用更辛苦的工作，换来了更差的整体回报？**

> - [[Dissatisfaction at Shopee (ongoing)]]
> - Bad thoughts dump & meaningful reflection: [[2026-02-27]]

而这种情绪，又会被朋友的动态反复放大。  
最近又看到几个朋友进了 Airwallex，而且反馈还不错，我就会不断被刺激到：  
是不是我当初真的选错了？  
是不是我本来就该去那边？  
如果我未来还考虑澳洲、美国，那 Airwallex 这种国际化一点的公司是不是本来就更合适？  
Shopee 在新加坡本地是强，但如果我要的是更国际化的跳板，那它真的有我当初想的那么好吗？

于是我的内心就会出现两套声音：

### 一套声音说：

你现在确实在学东西，而且学得很多。  
你以前在 HoYoverse 缺的东西，现在正在补。  
Shopee 的 structured onboarding、真实业务链路、复杂系统、跨团队协作，这些都在逼你成长。  
从这个角度看，这个选择未必错。

### 另一套声音说：

可是成长不只在 Shopee 才能有。  
去别的公司，你也一样会成长。  
而且如果别的公司钱更多、牌子更国际、福利更好，为什么要在这里受这种委屈？  
你明明当初有更好的 offer，为什么选了这个？

这两套声音一直在打架。  
而且因为我对自己未来到底要留在新加坡、去澳洲、还是去美国，并没有一个非常清晰的长期规划，所以我没法给“这个选择到底值不值”下一个稳定的结论。  
一旦未来目标不清晰，当下选择的评估标准就会一直变来变去，于是 regret 就会一直反复。

这种反复，最近已经影响到了我的睡眠、情绪和身体状态。  
我会想很多，停不下来，甚至把自己搞到生病（2026-03-13）-- 今天病假，所以我才有时间写下这么多hhh

---
## 5. 一个不能忽视的部分：一些还ok的地方

虽然这段时间我有很多 decision remorse，也会反复去想当初是不是选错了，但如果只是把注意力放在不满意的地方，其实也不完整。因为客观来说，Shopee 这边也确实有不少对我现阶段很重要、很有价值的东西。

首先，**我确实学到了很多东西**。  
这一点是最核心的。尤其是在 backend 这条路上，我之前很多理解都是零散的、漂浮的，缺乏真实项目作为承载。但来了这里之后，不管是 entry task，还是后面的 warm-up task、medium task，我都被迫去真正接触一个大型工程环境里会遇到的那些问题：request flow、system boundary、service contract、error handling、runtime behavior、log tracing、跨 repo 协作、proto contract、deployment、framework、infra middleware 等等。虽然过程很痛苦，但这类学习是非常真实的，不再只是停留在“听说过”或者“好像懂一点”的层面。

其次，**同事整体上是非常愿意帮助人的**。  
这一点我其实一直都很感激。每次我遇到问题，不管是 mentor、tech lead，还是其他组员，大家基本上都会很认真地回答，而且讲得很清楚，不是那种敷衍一下就算了。尤其是之前的 mentor，真的给了我很好的帮助。他讲问题的时候，会把背景、上下文、设计动机、整个 flow 都讲清楚，让我不是只知道“这里要怎么改”，而是能理解“为什么要这么设计”。这对我来说非常重要，因为我本来就不是那种只想知道答案的人，我更需要一个完整的 picture。虽然他后来离职了，这点挺可惜的，但现在 tech lead 也在继续带我，另外组里其他人整体也都比较 supportive。

再一个我觉得比较重要的点是，**这里的节奏总体上还是相对可控的**。  
虽然工作量并不小，我也确实经常觉得累，但整体上，它并不是那种把人完全推着跑、没有喘息空间的环境。相反，我会感觉自己大体上还能按照自己的节奏去学习，不只是机械地把任务完成掉，而是还有一些空间去理解、去探索、去问问题、去补背景。尤其是当我还在学习期的时候，tech lead 其实也会帮我挡住一些压力，在任务推进、预期管理、沟通节奏上做一些协调和调整。这个对我来说是很重要的，因为它给了我一个相对安全的环境，让我可以先把基础慢慢打起来，而不是一上来就被非常高压地逼着输出。

---
## 6. 补充：关于 Domain Knowledge 理解的反思

cycle review 里有一个目标是 —— establish voucher domain knowledge

到现在为止，我主要还是从 technical 的角度 去理解系统：  
例如去 trace request flow，然后在这个过程中理解每一层在做什么，并把需要修改的逻辑改对。

在这个过程中，我确实也会尝试去思考“为什么要做这个改动”  ——

- warm-up task 1 (add batching logic in cancellation flow) -- 当 voucher transaction 数量超过 API 的 batch size limit 时，可能导致 cancellation flow 失败，从而影响用户 voucher 的正确返还。修复这个问题可以避免 edge case 导致的错误，从而提升系统稳定性和用户体验。
    
- warm-up task 2 (shadow traffic isolation) -- 在进行 stress testing 或 shadow traffic 测试时，不会影响到真实的 production traffic，避免 rate limiter 或 circuit breaker 被测试流量触发，从而影响真实用户请求。
    
- medium task (food voucher customization) -- 偏产品层面的影响，比如通过增加各种字段，帮助用户更清楚地理解 voucher 的使用方式，从而提升使用体验或者 engagement。

但整体来说，这些理解目前都还是比较 **qualitative** 的。我更多是从逻辑上理解“为什么需要这个功能”，而不是能够很清楚地去量化它对业务指标的影响，比如：
- 具体会影响多少用户
- 对 voucher usage rate 有多少提升
- 对 conversion rate 或 DAU 有什么 measurable 的变化

另外，在更系统的 **domain knowledge** 方面，我其实也还没有真正开始系统地学习。比如：
- voucher ER diagram
- voucher lifecycle 的完整逻辑
- 不同类型优惠券的规则和使用方式
    
manager 之前也给过我一个比较形象的建议 —— 可以尝试慢慢拼出一个属于自己的 **“voucher map”**。就像在玩游戏一样，当你进入一个新的地图时，一开始对这个地方其实是完全不熟的，只能通过不断探索、完成任务、打怪升级，一点一点把地图上的区域解锁。随着你接触到更多的任务、看到更多的系统组件、理解更多的 request flow，这个地图就会逐渐被补全。

从这个角度看，我现在其实可能还处在刚刚进入地图、只解锁了少数几个区域的阶段。通过每一个 task，我只是接触到了某些局部的 flow，比如 cancellation flow、rate limiter / circuit breaker、某些 voucher API 的调用链，但这些点目前还没有完全连成一个完整的图景。

接下来可能需要做的，就是把这些零散的“已解锁区域”慢慢连接起来，逐渐形成自己对 voucher system 的整体理解。

---
# 小结

这两个多月，对我来说并不是一个轻松的开始。  
它比我预想中更难，也更频繁地打击我的自信。两个 entry task 让我很直接地暴露出自己在 backend coding、performance optimization、工程框架理解，以及在陌生环境里独立推进复杂任务方面的不足；后面的 warm-up task 和 medium task，又让我开始真正接触到真实业务链路、系统边界、error handling、runtime verification、跨团队协作和 multi-repo contract 这些更复杂、更接近工程现实的问题。

这个过程并不舒服。很多时候，我都处在一种一边做、一边怀疑自己、一边被迫快速学习的状态里。尤其是在最开始，我会很明显地感受到自己的经验并没有像我原本想象中那样，能够直接迁移到现在的 backend 工作里。以前没有真正补上的东西，现在都一点一点暴露出来了。无论是对系统整体的理解、对 performance 问题的分析、对 framework 和 runtime behavior 的掌握，还是对 task complexity 的预估和时间管理，我都在被迫重新学习、重新建立框架。

但另一方面，这段时间也确实让我学到了很多以前没有真正接触过的东西。我开始第一次比较具体地理解 backend 工作到底在做什么：不是只写某一个 function，也不是只把需求“改出来”，而是去理解一个 request 是怎么流经不同层、怎么跟上下游交互、怎么受到 contract 和 runtime behavior 的约束、又怎么在真实组织里通过跨团队协作被交付出来的。很多以前只是模糊听过的概念，现在开始慢慢变得具体，开始和真实项目、问题、系统连在一起。

而且，我也不能忽略这里确实存在的一些好的部分。虽然我对薪资、福利、机会成本这些方面一直有很强的不甘心和 regret，但从成长环境来说，这里也确实给了我一些现阶段很需要的东西。团队整体是愿意帮助人的，之前 mentor 也给了我很好的带领，让我第一次比较系统地去理解很多背景和 flow。后来虽然 mentor 离职了，但 TL 和其他组员整体也还是 supportive 的。再加上整体节奏相对可控，让我能在一个相对没那么高压的环境里，按照自己的节奏去补基础、去理解问题、去慢慢建立 backend 的思维框架。

所以如果要说这段时间最真实的状态，它不是单纯的“成长”，也不是单纯的“后悔”，而是两者交织在一起。  
我一边在变强，一边也在承受这个过程带来的失衡、阵痛和反复动摇；我一边越来越看到自己在技术和工程理解上的积累，一边也还是会因为 offer 选择、机会成本、未来路径不清晰以及对自身能力的不安，而陷入很多情绪上的内耗。

而这份记录的意义，就是把这些复杂的感受留下来。  
让我以后回头看时，能够看见一个更真实的自己：我不是从一开始就很笃定、很顺利地走过来的，我也是在混乱、怀疑、懊悔、被打击和一点点摸索中，慢慢长出自己的能力、判断和方向。哪怕现在还没有一个很清晰的答案，这段经历本身也已经在塑造我，让我更接近一个真正能够独立思考、理解系统、也理解自己想要什么的 engineer.

---
> ChatGPT Feedback: [[Feedback & Reflection (2+ Months at Shopee)]]
