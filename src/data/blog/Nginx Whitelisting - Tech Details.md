---
title: Nginx Whitelisting - Tech Details
description: >-
  - In a multi-environment setup (office / testing / production),
  cross-environment access is strictly controlled for security reasons.
pubDatetime: 2025-08-02T00:00:00.000Z
tags: []
author: Nature
draft: false
featured: true
slug: Nginx Whitelisting - Tech Details
---
## Project Technical Deep Dive: Nginx-Based Resource Whitelisting Automation

### Project Background

- In a multi-environment setup (office / testing / production), cross-environment access is strictly controlled for security reasons.
- To allow services in one environment to access internal endpoints in another (e.g., Clickhouse in prod), we needed to update **Nginx-based reverse proxy whitelist configurations**
- The previous process was semi-manual and error-prone; our goal was to standardize and automate it via GitOps + CI/CD + Jenkins for production safety and efficiency.

### System Architecture

- **Config Layer**: Whitelist rules maintained in a Git repo (`infra-whitelist-proxy/`), categorized by business unit (data / platform / payment).
- **CI/CD Layer**: Git tagging triggers GitLab CI pipeline to package configuration files and upload to OSS storage.
- **Deployment Layer**: Ops engineers select the release package in HoYoCloud, and deploy it to Nginx reverse proxy machines via platform UI.
- **Activation Layer**: Jenkins job triggers a remote reload of Nginx on selected target machines using **Ansible**.
    
> [!info] Data Flow
> ```
> [Config commit] → [Git Tag] → [CI/CD pipeline] → [OSS Package] → [Ops Portal Deploy] → [Jenkins reload job (Ansible)] → [Effective Nginx Reload]
> ```
> 

### Key Implementation Details

#### Configuration Workflow
- Identified the source and destination IPs and determined whether new whitelist rules were needed (e.g., 10.146.0.0/16 → 10.171.154.143).
- Analyzed service info (via `dig -x`, service name conventions) to locate the correct reverse proxy layer (e.g., `data-prod` → `plat-sg03-infra-prod-data-reverse-proxy`).
- Created new Nginx config files following predefined naming conventions.
- Included appropriate whitelist rules (e.g., intranet IPs) and assigned a unique listen port.
    
#### CI/CD Integration
- On merge to `main`, created a Git tag to trigger `.gitlab-ci.yml`.
- CI pipeline packaged all config files into a `*_all_in_one.tar.gz` artifact and uploaded it to OSS.

#### Jenkins Automation
- Triggered a Jenkins job to activate the config via `nginx -s reload`.
- The Jenkins job used **Ansible with base64-encoded commands** to securely perform remote execution across multiple Nginx servers.
- Ensured config validity via a `dry_run` check before actual reload.

### Testing & Validation

- Dry-run Nginx syntax checks (`nginx -t`) before reload.
    
- Post-deploy validation included:
    - Checking deployed config in target machine (`ls /home/data/software/nginx/conf.d/`)
    - Verifying connectivity via `telnet <service>.inner <port>`
    - Checking logs via `tail -f error.log`
        
### Failure Modes & Recovery

- Common errors: wrong IP segment, port conflicts, invalid config syntax.
- Dry-run step caught syntax errors early.
- If deployment failed, configs could be rolled back via Git, and reload re-triggered.

### Trade-offs & Design Decisions

#### Pros
- Git-driven approach made access control auditable and reversible.
- Used standard tools (Jenkins + Ansible) without requiring SSH access or manual ops.
        
#### Cons
- Port management still required some manual decision-making (based on listing used ports).
- End-to-end deployment was still semi-automated — Jenkins had to be triggered manually via ticket or button.
        
### Related Knowledge Areas

- Nginx config structure and directive semantics
- CI/CD workflows with GitLab
- Jenkins job customization with Python and Ansible
- IP-based access control and network segmentation
- Reverse proxy design in internal network architectures
