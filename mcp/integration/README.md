# ChannelSeal MCP Server Index

## Background

### MCP Regsitry Ecosystem

![Ecosystem](./ecosystem-diagram.excalidraw.svg)

The MCP registry provides MCP clients with a list of MCP servers, like an app store for MCP servers.

There are two parts to the registry project:

1. 🟦 The MCP registry spec: An API specification that allows anyone to implement a registry.
2. 🟥 The Official MCP registry: A hosted registry following the MCP registry spec at `registry.modelcontextprotocol.io`. This serves as the authoritative repository for publicly-available MCP servers. Server creators publish once, and all consumers (MCP clients, aggregators, marketplaces) reference the same canonical data. This is owned by the MCP open-source community, backed by major trusted contributors to the MCP ecosystem such as Anthropic, GitHub, PulseMCP and Microsoft.

Find more details on [MCP Registry Ecosystem Vision](https://github.com/modelcontextprotocol/registry/blob/main/docs/design/ecosystem-vision.md)

## Use Spider to populate ChannelSeal MCP Index

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

CSA->>MR: List MCP servers
CSA->>CSA: Has Server Card?
CSA->>MS: Yes, Get Server Card <br>...com/.well-known/mcp/server-card/...
CSA->>MS: No, init, tools/resources/list
CSA->>CSA: Has Remote Protocol?
CSA->>CMC: Yes, Add Server, Capabilities
CMC->>CPS: Add Tools/Resources
CPS->>CMTC: Add Tool Channels
CPS->>CMRC: Add Resource Channels
CMC->>CSDS: Identify SDEs
CMC->>CMTC: Update with SDEs
CMC->>CMRC: Update with SDEs

```

## Add MCP Server to ChannelSeal MCP Index (ad-hoc)


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
CSA->>MS: No, init, tools/resources/list
CSA->>CSA: Has Remote Protocol?
CSA->>CMC: Yes, Add Server, Capabilities
CMC->>CPS: Add Tools/Resources
CPS->>CMTC: Add Tool Channels
CPS->>CMRC: Add Resource Channels
CMC->>CSDS: Identify SDEs
CMC->>CMTC: Update with SDEs
CMC->>CMRC: Update with SDEs
```

## AI Agent traffic logs and ChannelSeal MCP Index

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

References:

1. [MCP Server Card - SEP-2127](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/125fb1fd766b338c840b7d012aac89fd0a450042/seps/2127-mcp-server-cards.md)
2. [MCP Registry](https://github.com/modelcontextprotocol/registry/tree/main)
3. [Official MCP Registry](https://github.com/modelcontextprotocol/registry/blob/main/docs/reference/api/official-registry-api.md)
3. [MCP Server Discovery Flow](https://github.com/modelcontextprotocol/registry/blob/main/docs/design/tech-architecture.md#2-consumer-discovery-flow)

**Note:** Confidential and proprietary