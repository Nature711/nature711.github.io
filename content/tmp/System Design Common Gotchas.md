
What if DB write succeeded but Redis write failed? 

1. cache-aside
	- don't write to cache immediately after DB write
	- instead write to cache only on cache miss when next read
	- write to cache fail no problem since next read just fetch from DB
2. write-behind with retry
	- add failed jobs to a retry queue
	- use background workers to retry
3. accept stale cache + TTL
	- accept fail, rely on TTL to expire stale data
	- use short TTL for critical data



When qn involves interacting with 3rd party API, think of:
- retry, exponential backoff, rate limiting



redis data structures


pre-warm cache before high load

use queue to decouple production & consumption


