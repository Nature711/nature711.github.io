---
title:
draft: true
tags:
date: 2026-01-20
---
## Overview

### Goal

Build a **SPEX microservice** that:
1. receives RPC (server side) via SPEX
2. calls another service (client side) via SPEX
3. does all of it using *GAS SPIs + generated code*, not hand-rolled networking

> [!info] Simply put, it's about
> - how you become a service in the mesh
> - how you expose and consume commands safely

### Why 

1. **RPC Communication**
	- Spex enables service-to-service RPC calls
	- Type-safe via protobuf
	- Handles serialization, networking, error handling

2. **Service-Oriented Architecture**
	- Services expose APIs via Spex
	- Clients call services via Spex client
	- Enables microservices communication

3. **GAS Integration**
	- Uses `spexspi.Server` (SPI pattern)
	- Business code depends on interfaces, not concrete implementations
	- Engine manages the Spex server lifecycle

4. **Standardized Communication**
	- Protobuf ensures contract compatibility
	- Generated code handles boilerplate
	- Consistent error handling and serialization

---
## Workflow

### 1. Code Generation

```
scaffold.proto
    ↓
[spkit gen gas-spex]
    ↓
Generated Code:
  - scaffold.gas.client.go (client code)
  - gas_scaffold.pb.go (protobuf messages)
    ↓
Your Handler implements the interface
```

### 2. Registration

```go
// 1. Provide handler implementation
pb.ProvideServiceHandler(new(scaffoldService), "handler")
// Creates handler instance, names it "handler"

// 2. Register service with Spex
pb.RegisterService("handler")
// Tells Spex to expose this service

// 3. Provide health checker
spexspi.ProvideHealthChecker(new(scaffoldHealthChecker))
// Spex health check endpoint
```

### 3. Configuration


---
## Understanding its behavior

```
spkit new gas-spex <1server-name>
```

Just like `spkit init`, it gives some prompts, so input the following information:

```
# answer Yes when prompted to import the latest spi/spex

# could use --editor to copy paste the following information directly
spex-service-name: <2service.name>
api-name-space: <3api.namespace>
config-key-non-live: <4a-very-long-config-key>
smb-project-name: <5smbproject>
smb-module-name: <6smbmodule>
```

1. <1server-name>
- becomes the name of the folder mod: `mod/<1server-name>/module.go`
- becomes the name of the yml file under `etc`: `etc/<1server-name>.yml`
- becomes the name of the handler go file: `internal/handler/<1server-name>.go`
- becomes the run command in deploy file: `./bin/<1server-name>`

1. <2service.name>
- becomes the service name in `etc/yml`: 

```yml
# /etc/<1server-name>.yml

_spex: &_spex

service_name: <2service.name>

non_live_config_key: <4a-very-long-config-key>

sdu_id: default

tag: master

gas.spex.server:

<<: *_spex

gas.spex.client:

<<: *_spex
```

1. <3api.namespace>
- becomes the name of folder / structure under `proto/spex/sp_proto`

`proto/spex/sp_proto/<3api>/<namespace>.proto

- each dot creates a new folder layer

1. <6smbmodule>
- becomes the name of the deploy json file: `deploy/<6smbmodule.json>`

```json
{
"project_dir_depth": 2,
"project_name": "<5smbprojectname>",
"module_name": "<6smbmodulename>",
"build": {
```

