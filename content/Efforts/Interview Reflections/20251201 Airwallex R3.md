---
title:
draft: true
tags:
  - "#real-interview"
date: 2025-12-01
---
1. Tell me about a pleasant team collaboration experience you've worked with
- what's your ideal working environment

3. Tell me about a time during work when you disagreed with someone and how is that resolved

1&2 -- conflict & collaboration

3. How do you collaborate with different stakeholders / business teams, etc.

4. Tell me about how the resposibilities / ownership are attributed 

5. Tell me about a time when you face tight deadline and need to make certain decisions, and how do you prioritize, what's the logic behind
- challenge, problem-solving, prioritization

3. Tell me about a tech that you learned outside of work recently 
- adaptability & initiative?

5. How do you see yourself in 3-5 years


---

Subject: Reliability Tiers and Team Structure
Content: The T0 team focuses on ensuring infinite uptime and reliability for critical services, with no tolerance for downtime. The team is split into different tiers based on service criticality and availability requirements. Tier 0 services must be always available, while Tier 1 and Tier 2 can tolerate brief outages. The team employs different technology stacks and deployment strategies, with Tier 0 prioritizing reliability over speed and innovation. Currently, the team is working on a project called Crossbean, an API for deploying resources, and is transitioning from GitOps to a more developer-friendly approach. They are also planning to expand their presence in Singapore due to geopolitical factors, while maintaining a presence in Shanghai. The team culture encourages collaboration, and they communicate through a mix of English and Chinese, with written communications being key.

Speaker 1 00:00:03
So the T0 team that we split out mostly by tiers and what it's really referencing is the tiers of the services, the criticality of the reliability of the services.
So for tier zero team.
Umm, this team is dedicated to basically infinite amount of uptime and reliability.
Umm, basically these are systems so critical that, uh, they really can't even have minute level outreaches so.
Umm, some of our products went that way. So Pete mix up consistently.
So like, if you imagine like you, you know, you're, you're, you're a checkout and you swipe your card at a stand and it takes a few seconds, right? If it takes more than a few seconds, you start wondering if your credit card was declined or there's something going wrong in the back end.
Those things can never go down, so that's what we call AT0.
So that's what we have actually. So that, that basically has second level dependencies on, uh, availability.
Umm, the rest of the team is called T Rex, which is basically Tier 1 and Tier 2, which is basically our normal 80% versus our tier one. They basically are they can go down for a few, you know, for 30 seconds to a minute to.
A few minutes, that's OK.
Our Tier 2 is basically you can go down for hours, nobody cares.
So we have Tier 0 and Tier X teams. And the reason it's distributed this way is because.
The high cost of the tier zero team means that they're, you know, really focused on like one or two domains basically for as the TRX team is mostly for everybody else.
Lastly is the tier uh, the data and AI thought it for team is focused on Kafka fleek umm, our.
Data breaks and a couple other data platforms for our data engineers essentially.
OK, let's see. Yeah.
Speaker 2 00:01:53
So basically it's developed, it's divided into like different tiers for different tiers have different reliability and availability requirements.
And because of the cost, we try to.
Allocate.
A dedicated team to the manage the T Rex.
Speaker 1 00:02:14
It's not about cost, more about technology stuff. Uh, for example, umm, our 20 teams have both blue-green, have cluster level blue-green deployments. That means that we can, we're able to spin up brand new infrastructure stacks and networking stacks on on behalf of every single deployment.
And that is very expensive, but that's because we're doing blue-green at at the infrastructure level, whereas we don't really need that type of technology for the TRX to keep the TRX team can just inside one cluster, you know, update, they can deploy and it's, it's OK very quickly. And so, umm, the technology stack, the way to deploy their way of thinking is culturally very different because if you imagine it like.
The J zero teams will take absolutely no risk, whereas the the chairs thing can go much faster. They can innovate a little bit faster with technology, they can a little bit more fun around like new things whereas.
Uh, the Tier 02 is a lot more regimented because they have to be, right? Yes.
Speaker 2 00:03:13
So basically they're just have different concerns, they are developing at different paces and using slightly different technology.
Speaker 1 00:03:21
Exactly. OK, so.
Speaker 2 00:03:24
So I was so curious about the relevance to me. So if I were to join like uh, which part will be I Will will I be responsible for?
Speaker 1 00:03:33
You guys should be joining the tier zero team actually. Umm.
So the interesting pieces they're, they're working on something called Crossben right now, which is basically an API. It's like confirmation for you API for your.
Eric Cloud Resources, it's still declared it, but it's not git OPS, which is what we traditionally use at our wallets.
Umm, so.
Do you know what gitops is, by the way? Uh, yeah.
OK, So what, So this team is moving away from Gitops because what they're trying to do is they're trying to give APIs to developers to say, hey, spin up your own clusters. Don't, don't bother us, right here's here's your deployment. You need to play this role. Our requirements that you deploy new cluster don't and you do traffic switching and we have this all automated now.
And so the point is to get to a point where.
You don't need to cut Mrs. for every single least that we do.
It's really now it's much more needed.
But the other thing that this team is doing in the next in 2026 is that we're moving from just GCP to, uh, multi cloud solutions. So if you join your going part of this, it's very exciting adventure. Umm.
We're going to be running.
The service across multiple clouds, so AWS and TCP at the same time. So you can imagine like a request coming in, it has a probability of either going to AWS or TCP and then going down from there into the different back end services.
Speaker 2 00:05:01
I see.
Pretty interesting. Is this mainly for liability concern or also for cost?
Speaker 1 00:05:10
Uh, for both actually, uh, it's also for. So there's cost reliability and there's also, uh, availability issues that.
Speaker 2 00:05:21
Yeah.
Think that that is our team is also trying to explore this multi call strategy.
As well. So if that's a trend.
Speaker 1 00:05:34
Makes sense yeah yeah, you you're seeing is like there's a a lot of.
It's not vendor lock in, but there's locking instability from the cloud usually these days.
And so, uh, moving on, multi cloud seems to be on air base bucket list.
When it goes forward, yeah.
Speaker 2 00:05:54
OK. So I think enough for the technical part then for the non-technical maybe the like the like the team member conversation like currently for for this team, what are the like the composition of the member? Is it mainly like seniors or are they also junior or mid level involved?
How did it work?
Speaker 1 00:06:17
So so.
Uh, OK. It's a good question actually, because this is one you're definitely worried about. Umm, OK.
We are split between Shanghai and in Singapore, OK, and we are building a Singapore team. We have four people in Shanghai and two people in Singapore right now.