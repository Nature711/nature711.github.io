---
title:
draft: true
tags:
date:
---
From entry task 1 (keep it short, < 5min)

- rebuild from scratch to understand how each components works
- performance testing at each stage (instead of build all then test at the end) – better
- better usage of AI: 
	- separate windows: 1 for purely writing code (agent mode); another for reviewing & suggestion -- just like how pair programming works
- architectural & performance tradeoff
	- move cache access to http layer -- reduces http <-> tcp communication overhead; improve performance to 21k
	- trade-off: http layer contains certain "business logic"
	- in the future: discuss this kind of architecture decision at the start
	- and also thanks to entry task 2 -- i don't need to worry about all these haha

Entry task 2

- problem & context
- architectural design (before & after)
- what GAS & SPEX gives
	- abstraction of client / server communication, routing, connection...
	- dependency injection -- instead of relying on specific libraries, now rely on abstractions 
- understand the mapping
	- HTTP server -- original HTTP server; a client of the SPEX server
	- SPEX server -- original TCP server 
- egress vs. ingress
	- for HTTP: 
		- ingress: HTTP server SPI (HTTP server serves request from browser, curl)
		- egress: SPEX client
		- http server is both a client & server -- server of HTTP requests; client of SPEX server
	- for SPEX:
		- ingress: SPEX server SPI (serves request from HTTP server)
		- egress: DB, cache, config
- repo structure
	- show structure
	- same repo, seperate mod folder -- one per deployable unit
	- separate repo would make life easier, but here using 1 repo more closely mimics how many shopee shared services work; understand how to build multi deployable services and manages the config / dependency, etc. (help me elaborate)
	- demo of workflow
- demo of working prototype
- challenges & resolution
	- understanding dependency injection
	- make things work then understand
- future improvements



