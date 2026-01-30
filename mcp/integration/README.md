# ChannelSeal MCP Server Index

**Note:** This content is confidential and proprietary

## MCP Server indexing using spider



```mermaid
---
title: Preparing Index
---
sequenceDiagram

participant CSA as ChannelSeal <br>MCP Spider Agent
participant MR as MCP Registry
participant MS as MCP Server
participant CMC as ChannelSeal <br>MCP Catalog
participant CSDS as ChannelSeal <br>Sensitive Data <br>Detection Service
participant CPS as ChannleSeal <br>Platform Services
participant CMTC as ChannelSeal <br>MCP Tool Channels
participant CMRC as ChannelSeal <br>MCP Resource Channels

CSA->>MR: find servers
CSA->>CSA: Has Server Card?
CSA->>MS: Yes, Get Server Card <br>...com/.well-known/mcp/server-card/...
CSA->>MS: No, Get Capabilities
CSA->>CMC: Add Server, Capabilities
CMC->>CPS: Add Tools/Resources
CPS->>CMTC: Add Tool Channels
CPS->>CMRC: Add Resource Channels
CMC->>CSDS: Identify SDEs
CMC->>CMTC: Update with SDEs
CMC->>CMRC: Update with SDEs

```

## Add MCP Server to index (ad-hoc)


```mermaid
---
title: Add MCP server
---
sequenceDiagram

participant A as Application
participant CSA as ChannelSeal <br>MCP Spider Agent
participant MS as MCP Server
participant CMC as ChannelSeal <br>MCP Catalog
participant CSDS as ChannelSeal <br>Sensitive Data <br>Detection Service
participant CPS as ChannleSeal <br>Platform Services
participant CMTC as ChannelSeal <br>MCP Tool Channels
participant CMRC as ChannelSeal <br>MCP Resource Channels

A->>CSA: Add example.com/mcp
CSA->>CSA: Has Server Card?
CSA->>MS: Yes, Get Server Card <br>...com/.well-known/mcp/server-card/...
CSA->>MS: No, Get Capabilities
CSA->>CMC: Add Server, Capabilities
CMC->>CPS: Add Tools/Resources
CPS->>CMTC: Add Tool Channels
CPS->>CMRC: Add Resource Channels
CMC->>CSDS: Identify SDEs
CMC->>CMTC: Update with SDEs
CMC->>CMRC: Update with SDEs
```

## AI Agent Traffic Log Collection

```mermaid
---
title: AI Traffic Log
---
flowchart LR
    style A fill:lightgray
    style AG fill:lightgray
    style MS fill:lightgray
    style S fill:lightgray
    style C fill:lightgray
    A[Agent <br>MCP Client]--tool/ resource calls-->AG[Agent Gateway]--tool/ resource calls-->MS[MCP Server]
    MS--API-->S[Service]
    AG--Log events-->C[OTel Collector]
    C--Log events-->DP[ChannelSeal<br>Data Pipeline]
    DP--Log events-->CP[ChannelSeal<br>Platform]
    CP-->MT[ChannelSeal<br>MCP Catalog]

```