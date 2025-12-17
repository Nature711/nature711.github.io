---
title:
draft: false
tags:
date: 2025-12-10
---
**Q: "Tell me about a time you improved system reliability"**

> "I participated in chaos engineering drills where we deliberately failed infrastructure components. We discovered that while graceful shutdowns had zero impact, ungraceful failures like machine reboots caused 10-30 second outages. This revealed our load balancer health checks were too slow.
> 
> I proposed reducing the health check interval and implementing connection draining timeouts. We validated this would have prevented the outages by simulating network failures with `tc` command in our staging environment before rolling to production."

**Q: "How do you validate your monitoring is effective?"**

> "Through fault injection testing. At HoYoverse, we used `tc` to simulate 50% packet loss and 1-second latency increases while validating our Prometheus alerts triggered correctly. We tested that our `increase(ping_failure_total[5m]) > 0` alert caught network issues and our latency threshold of >300ms was appropriate given our baseline of 100-200ms cross-region."

## Points to explore: The unexpected failure

> Observation: 10-30s request failure during machine down / restart; different from the proposal

**Hypothesis 1**: Connection pool poisoning

- Dead connections stayed in the pool
- When network recovered, app tried to reuse dead connections
- Had to fail once to realize connections were stale

**Hypothesis 2**: Load balancer state sync delay

- Health checks passed
- But load balancer routing tables not updated yet
- Sent traffic to instance not fully recovered

-- Ask "Did we figure out why recovery also caused failures?" 