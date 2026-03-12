---
title:
draft: true
tags:
date:
---
Proto file defines the interface / contract

and it's managed separately from business logic code

so that the other projects that depend on this interface

can pull it and work on it

even if the actual "implementation" is not provided yet

this feature, together with PFB 

allows dev to work more efficiently & non-blocking on multiple features / versions

wanna know what's the best practice 

---
## Steps for publishing a proto file

### Create a new topic in service mesh

create a topic in Service CMDB --> Service Mesh (Spex) --> Spex proto

change api namespace (usually the shorter one)

create a new topic, e.g., named "feature-1-pb"

### Publish pb to that topic

after that under the same path as where `sp-workspace.yml` is defined -- 

execute `spcli proto publish <topic-name> <path-to-proto-file-to-be-published>` 

- path is relative to the `sp-workspace.yml` file
- e.g., `sp_proto/voucher/ss/business.proto`

### In the other repo (that use this new pb), pull the change

which pb to use is defined in `sp-workspace.yml`

```yml
protocol:

# root directory for the source code of protocols.
source_dir: "./sp_proto"

# root directory for generated code.
generated_dir: "../../internal/proto/spex/gen"

...
# dependencies: please maintain alphabetical order
dep:
- name: "account.address"
  topic_name: "master"
  ...
- name: "the.one.you.care.about"
  topic_name: "the topic name you just defined" -- change this 
```

> later after we merge the other repo's changes to master, need to update here as well


