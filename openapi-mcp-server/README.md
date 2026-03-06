# Integrating ChannelSeal With Claude Desktop

This document describes how to use ChannelSeal APIs from Claude Desktop.

## Overview

To integrate ChannelSeal APIs with Claude Desktop, we need a [Model Context Protocol (MCP)][mcp] server that exposes OpenAPI endpoints as MCP `tools`, along with optional support for MCP `prompts` and `resources`. Such a server would allow Large Language Models to discover and interact with REST APIs defined by OpenAPI specifications through the MCP protocol.

Also, an MCP server should support OAuth grant type `client_credentials` with token expiration.

## Environment

| Component       | Value                                                                          |
|-----------------|--------------------------------------------------------------------------------|
| MCP Server Package | `@ivotoby/openapi-mcp-server`                                                  |
| Server Script   | `server.js`                                                                    |
| Claude Desktop Configurtion | `claude_desktop_config.json`                                                   |
| Auth Provider   | Auth0                                                                          |
| API             | Download OpeanAPI document for Platform APIs from ChannelSeal Developer Portal |


## MCP Server

For ChannelSeal APIs that use OAuth `grant_type` as `client_credentials` with token expiration, the [@ivotoby/openapi-mcp-server][ivotoby] package that exposes an AuthProvider interface would be appropriate. However, we have to implement `getAuthHeaders()` (called before every request, to return a fresh token) and `handleAuthError()` (called on 401/403 errors, return true to retry). 

This requires writing a small wrapper script [server.json](server.js) as found in this directory. Prepare required npm modules by running the following.

```shell
npm install
```

## Claude Desktop Integration

For Claude Desktop to recognize an MCP server locally, its configuration needs to be updated. The `claude_desktop_config.json` resides at the following locations:

* macOS: ~/Library/Application Support/Claude/claude_desktop_config.json
* Windows: %AppData%\Claude\claude_desktop_config.json

Add `channelseal` under `mcpServers` in `claude_desktop_config.json` as shown below. Find a template in [`claude_desktop_config.json`](claude_desktop_config.json).

```json

  "mcpServers": {
    "channelseal": {
      "command": "node",
      "args": ["/<path-to>/server.js"],
      "env": {
        "API_BASE_URL":      "https://<env>.channelseal.com/platform",
        "OPENAPI_SPEC":      "/<path-to>/platform-api-specs.yaml",
        "OAUTH_TOKEN_URL":   "https://dev-channelseal.us.auth0.com/oauth/token",
        "JWT_AUDIENCE":      "https://api.channelseal.com",
        "OAUTH_CLIENT_ID":   "your client id",
        "OAUTH_CLIENT_SECRET": "your client secret",
        "NODE_TLS_REJECT_UNAUTHORIZED": "0" //<- only for dev environment
      }
    }
  }
```
where

\<env\> would be
* `uat`
* `staging`

### Restart Claude Desktop

After changing the configuration, restart Claude Desktop. 

### Verify Configuration

Verify by going to Settings->Developer. Check if `channelseal` appears in `Local MCP Servers` in `running` state. Alternately, you would be able to find a connector (Settings->Connectors) with name `channelseal` having all tools available. 

### Start a prompt in Claude Desktop

If everything works, the MCP tools for the ChannelSeal API would show up automatically in conversation with AI.

Type `list classifications from channelseal` for example. 

You may encounter some issues. Following describes how to resolve those.

## Troubleshooting

### Issue 1: SSL Certificate Verification Failure

**Error:** `API request failed: unable to verify the first certificate`

**Root Cause:** The staging server uses a channelseal's certificate not trusted by the default Node.js trust store.

**Fix:** Adding `NODE_TLS_REJECT_UNAUTHORIZED=0` to the MCP server environment in `claude_desktop_config.json`, resolves this error.

> ⚠️ This should only be used in non-production/staging environments. In production, use a properly signed certificate.


### Issue 2: Missing Content-Type Header (415 Unsupported Media Type)

**Error:** `API request failed: 415 - Content-Type 'null' is not supported`

**Root Cause:** The `@ivotoby/openapi-mcp-server` package was not setting the `Content-Type: application/json` header on outgoing API requests.

**File:** `node_modules/@ivotoby/openapi-mcp-server/dist/bundle.js`, line 19046

Before:
```javascript
headers: { ...authHeaders, ...headerParams }
```

After:
```javascript
headers: { "Content-Type": "application/json", ...authHeaders, ...headerParams }
```

Applied via sed command (macOS):
```bash
sed -i '' 's/headers: { \.\.\.authHeaders, \.\.\.headerParams }/headers: { "Content-Type": "application\/json", ...authHeaders, ...headerParams }/' \
  node_modules/@ivotoby/openapi-mcp-server/dist/bundle.js
```

> ⚠️ This is a patch to `node_modules` and will be lost if the package is reinstalled. Consider forking the package or submitting a PR upstream.

---

[mcp]: https://modelcontextprotocol.io/
[ivotoby]: https://github.com/ivo-toby/mcp-openapi-server