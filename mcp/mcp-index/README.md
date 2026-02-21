# Straw man: ChannelSeal MCP Server Index (MSI)

This document describes design of indexing MCP Server components in order to identify sensitive data flows from AI application traffic.

First, let's get some background on technologies we would use.

## Background

As AI applications gain mainstream adoption, the industry has invested heavily in model capabilities, achieving rapid advances in inferencing, reasoning and quality. However, even the most sophisticated models are constrained by their isolation from data—trapped behind information silos and legacy systems. Every new data source requires its own custom implementation, making truly connected systems difficult to scale.

[Model Context Protocol (MCP)](https://modelcontextprotocol.io/docs/getting-started/intro) addresses this challenge. It provides a universal, open standard for connecting AI systems with data sources, replacing fragmented integrations with a single protocol.

### MCP Architecture

The key participants in the MCP architecture are:
1. MCP Host: The AI application that coordinates and manages one or multiple MCP clients
2. MCP Client: A component that maintains a connection to an MCP server and obtains context from an MCP server for the MCP host to use
3. MCP Server: A program that provides context to MCP clients

#### MCP Server

MCP servers are programs that expose specific capabilities to AI applications through standardized protocol interfaces. MCP server has 3 building blocks or primitives.

1. Tools: Functions that LLM can actively call, and decides when to use them based on user requests. Tools can write to databases, call external APIs, modify files, or trigger other logic.
2. Resources: Passive data sources that provide read-only access to information for context, such as file contents, database schemas, or API documentation.
3. Prompts: Pre-built instruction templates that tell the model to work with specific tools and resources.

MCP distinguishes tools (for actions like `POST`/`PUT`/`DELETE`, often with side effects) from resources (read-only data retrieval, typically `GET` for context like lists or queries).

##### MCP Tools

MCP allows servers to expose tools that can be invoked by language models. Tools enable models to interact with external systems, such as querying databases, calling APIs, or performing computations.

Each tool is uniquely identified by a name and includes [metadata](https://modelcontextprotocol.io/specification/2025-11-25/server/tools#tool) describing its schema as shown below.

* `name`: Unique identifier for the tool
* `title`: Optional human-readable name of the tool for display purposes.
* `description`: Human-readable description of functionality
* `icons`: Optional array of icons for display in user interfaces
* `inputSchema`: JSON Schema defining expected parameters
* `outputSchema`: Optional JSON Schema defining expected output structure
* `annotations`: Optional properties describing tool behavior

**Example**

```json
{
  "name": "get_weather_data",
  "title": "Weather Data Retriever",
  "description": "Get current weather data for a location",
  "inputSchema": {
    "type": "object",
    "properties": {
      "location": {
        "type": "string",
        "description": "City name or zip code"
      }
    },
    "required": ["location"]
  },
  "outputSchema": {
    "type": "object",
    "properties": {
      "temperature": {
        "type": "number",
        "description": "Temperature in celsius"
      },
      "conditions": {
        "type": "string",
        "description": "Weather conditions description"
      },
      "humidity": {
        "type": "number",
        "description": "Humidity percentage"
      }
    },
    "required": ["temperature", "conditions", "humidity"]
  }
}
```

##### MCP Resource

MCP provides a standardized way for servers to expose resources to clients. Resources allow servers to share data that provides context to language models, such as files, database schemas, or application-specific information.

An MCP [resource definition]() includes the following:

* `uri`: Unique identifier for the resource
* `name`: The name of the resource.
* `title`: Optional human-readable name of the resource for display purposes.
* `description`: Optional description
* `icons`: Optional array of icons for display in user interfaces
* `mimeType`: Optional MIME type
* `size`: Optional size in bytes

**Example**

```json
{
    "uri": "file:///project/src/main.rs",
    "name": "main.rs",
    "title": "Rust Software Application Main File",
    "description": "Primary application entry point",
    "mimeType": "text/x-rust",
    "icons": [
      {
        "src": "https://example.com/rust-file-icon.png",
        "mimeType": "image/png",
        "sizes": ["48x48"]
      }
    ]
}
```

#### MCP Servers from APIs

Enterprises have invested 15+ years into exposing enterprise capabilities (internal and external) with APIs. MCP, as exciting as it is, is really just a simple protocol `shim` for AI models to call tools. It is expected that enterprises would expose their existing APIs as MCP tools to leverage this investment.

Number of libraries, API design tools, API gateways, etc. are providing tools to generate MCP server from an API specification described in the OpenAPI format. 

##### OpenAPI Operation As MCP Tool

Following table as described in [Exposing OpenAPI as MCP Tools - Semantics Matter](https://blog.christianposta.com/semantics-matter-exposing-openapi-as-mcp-tools/) provides practical mapping between OpenAPI attributes in MCP tool attributes.

| MCP Tool Element     | 	OpenAPI Source Field(s)	             | Notes |
|----------------------|---------------------------------------| -------- |
| name	                | operationId                           |	Unique, machine-friendly; fallback to method/path |
| title / description	 | summary / description                 |	Prefer summary for brevity, description for detail
| inputSchema          | 	parameters, requestBody	             | Structured input; includes types, constraints
| outputSchema	        | responses	                            | Structured output; success and error responses
| Invocation Details   | 	servers, path, method	               | URL, HTTP verb, server base
| Security             | 	security, components.securitySchemes |	Auth context for protected endpoints

Check out [Petstore MCP Server](./petstore_mcp.json) generated by Claude from [Petstore OpenAPI document](https://petstore3.swagger.io/api/v3/openapi.json).

### MCP Server Discovery

#### MCP Registry

![Ecosystem](https://mintcdn.com/mcp/C7bOrAKftvTohitd/registry/ecosystem-diagram.excalidraw.svg?w=1100&fit=max&auto=format&n=C7bOrAKftvTohitd&q=85&s=6dff7c7f525109560120ecfec3d1eb04)

The MCP registry provides MCP clients with a list of MCP servers, like an app store for MCP servers.

There are two parts to the registry project:

1. The MCP registry spec: An API specification that allows anyone to implement a registry.
2. The Official MCP registry: A hosted registry following the MCP registry spec at `registry.modelcontextprotocol.io`. This serves as the authoritative repository for publicly-available MCP servers. Server creators publish once, and all consumers (MCP clients, aggregators, marketplaces) reference the same canonical data. This is owned by the MCP open-source community, backed by major trusted contributors to the MCP ecosystem such as Anthropic, GitHub, PulseMCP and Microsoft.

Find more details on [MCP Registry Ecosystem Vision](https://github.com/modelcontextprotocol/registry/blob/main/docs/design/ecosystem-vision.md).

#### MCP Server Card

MCP clients currently lack efficient mechanisms to discover information about MCP servers before establishing a full connection. To obtain even basic metadata like server name and version, clients must complete an entire initialization handshake. This creates friction for discovery, integration, and optimization scenarios.

MCP Server Card is a standardized, self-contained format to describe MCP servers, e.g. for discovery using a `.well-known` endpoint. This enables clients to automatically discover server capabilities, available transports, authentication requirements, protocol versions and descriptions of primitives (prompts, resources, tools) before establishing a connection.

Find more details on  [MCP Server Card - SEP-2127](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/125fb1fd766b338c840b7d012aac89fd0a450042/seps/2127-mcp-server-cards.md)

## MCP Server Indexing

MCP Server indexing is the process by which ChannelSeal would analyze MCP servers for sensitive data usage and store that information in a structured database (the “index”) so that it can be retrieved quickly while processing AI traffic metadata without needing to inspect the payload.

Following are the main steps involved in MCP Server Indexing.

* Crawling
* Processing the content
* Analyzing
* Storing in the index
* Continuous updating

### Rationale


### Indexing MCP Tools

MSI would use the following attributes from an MCP tool in order to identify channel and sensitive data elements.

`name`, `title`, `description`, `inputSchema` and `outputSchema`

### Indexing MCP Resources

##### Does MCP Resource need to be indexed?


Many popular OpenAPI->MCP conversion tools semantically map operations as following:
* Actions (non-GET, or configurable GETs with params) become tools for AI invocation.
* Simple GETs default to resources for passive data access.

However, according to Claude:

Most real-world OpenAPI → MCP converters (awslabs.openapi-mcp-server, openapi-mcp-generator, Stainless, Higress) only generate tools, not resources. The dominant pattern treats every API endpoint as a tool, since MCP clients universally support tools but resource support varies widely. Stainless Resources are the right semantic fit for stable, addressable, read-only content — but in practice, the ecosystem has converged on tools-only for maximum compatibility.



### Populating ChannelSeal MCP Server Index 

### Using MCP Spider

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
participant CPS as ChannelSeal <br>Platform Services
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

#### Ad-hoc


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
participant CPS as ChannelSeal <br>Platform Services
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


### Using MCP Server Index For Sensitive Data Detection in AI Traffic

```mermaid
---
title: AI Traffic Log
---
flowchart LR
    style A fill:lightgray
    style AG fill:lightgray
    style MS fill:lightgray
    style S fill:lightgray
    A[Agent <br>MCP Client]-.tool/ resource calls.->AG[Agent Gateway]-.tool/ resource calls.->MS[Remote MCP Server]
    A--tool/ resource calls-->MS
    MS--API-->S[Service]
    A--Log events-->C
    AG-.Log events.->C[OTel Collector<br> + HTTP exporter]
    C--Log events-->CC[ChannelSeal]
```

References:

1. [MCP Server Card - SEP-2127](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/125fb1fd766b338c840b7d012aac89fd0a450042/seps/2127-mcp-server-cards.md)
2. [MCP Registry](https://github.com/modelcontextprotocol/registry/tree/main)
3. [Official MCP Registry](https://github.com/modelcontextprotocol/registry/blob/main/docs/reference/api/official-registry-api.md)
3. [MCP Server Discovery Flow](https://github.com/modelcontextprotocol/registry/blob/main/docs/design/tech-architecture.md#2-consumer-discovery-flow)
4. [Exposing OpenAPI as MCP Tools - Semantics Matter](https://blog.christianposta.com/semantics-matter-exposing-openapi-as-mcp-tools/)

**Note:** Confidential and proprietary