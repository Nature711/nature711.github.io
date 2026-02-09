
my OS doesn’t have “one Go installation” -- it has **multiple**

VSCode (or whatever IDE you use) currently points to **Go 1.25.5** (a specific version)
- any tools you run within the IDE, e.g., the button [run package test], uses this version (unless specified elsewhere)
- verify by using `Cmd + Shift + P` --> `Go: Locate Configured Go Tools`

The terminal points to another version (probably)? if you configured
- verify by using `which (-a) go` and `go version` (or maybe specific to the terminal I opened, I may forget if I exported / unset certain things some time before hhh)

The project I download -- has a dependency that is **Go-version-sensitive** (specifically, `aegislib`) 

```
link: git.garena.com/shopee/devops/golang_aegislib/aegislib: invalid reference to runtime.allgs
```

workaround: `unset GOFLAGS`

---

`go-get -u ....`: update a certain dependency to use a certain updated version (external lib)

if there's any error, do `go mod tidy`  -- tidy the module graph
- what's happening here: after `go get` we may end up with: extra / redundant entries in `go.mod / go.sum`; noisy dependency graph
- after doing `go mod tidy`:
	- Makes go.mod match what your code actually imports (adds missing, removes unused)
	- Prunes go.sum so it only has checksums for modules that are still in the graph
	- Leaves you with a minimal, consistent module graph

---