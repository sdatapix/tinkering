import { OpenAPIServer } from "@ivotoby/openapi-mcp-server";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// ── OAuth2 Client Credentials token provider ──────────────────────────────────

const TOKEN_URL     = process.env.OAUTH_TOKEN_URL;
const CLIENT_ID     = process.env.OAUTH_CLIENT_ID;
const CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET;
const SCOPE         = process.env.OAUTH_SCOPE ?? "";
const AUDIENCE      = process.env.JWT_AUDIENCE;

let cachedToken    = null;
let tokenExpiresAt = 0;

async function fetchToken() {
  const body = new URLSearchParams({
    grant_type:    "client_credentials",
    client_id:     CLIENT_ID,
    client_secret: CLIENT_SECRET,
    audience:      AUDIENCE,
    ...(SCOPE ? { scope: SCOPE } : {}),
  });

  const res = await fetch(TOKEN_URL, {
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    throw new Error(`Token request failed: ${res.status} ${await res.text()}`);
  }

  const data     = await res.json();
  cachedToken    = data.access_token;
  tokenExpiresAt = Date.now() + (data.expires_in ?? 3600) * 1000 - 30_000;
  return cachedToken;
}

async function getToken() {
  if (!cachedToken || Date.now() >= tokenExpiresAt) {
    await fetchToken();
  }
  return cachedToken;
}

// ── AuthProvider ──────────────────────────────────────────────────────────────

const authProvider = {
  async getAuthHeaders() {
    const token = await getToken();
    return { Authorization: `Bearer ${token}` };
  },

  async handleAuthError(error) {
    if (error?.response?.status === 401) {
      cachedToken    = null;
      tokenExpiresAt = 0;
      return true;  // retry
    }
    return false;
  },
};

// ── Server ────────────────────────────────────────────────────────────────────

const server = new OpenAPIServer({
  name:            "my-api-server",
  version:         "1.0.0",
  apiBaseUrl:      process.env.API_BASE_URL,
  openApiSpec:     process.env.OPENAPI_SPEC,
  specInputMethod: "file",
  transportType:   "stdio",
  toolsMode:       "all",
  authProvider,
  headers: {
    "Content-Type": "application/json"
  },
});

const transport = new StdioServerTransport();
await server.start(transport);