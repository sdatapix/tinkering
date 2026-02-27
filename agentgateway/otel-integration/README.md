# agentgateway → OTel Collector — Trace Export

Captures rich OTLP traces from agentgateway for every MCP tool call and HTTP
request, with maximum span attributes, sent to an OTel Collector.

---

## Architecture

```
agentgateway
  frontendPolicies.tracing
    │  OTLP/gRPC
    ▼
otel-collector:4317
  [otlp receiver]
  [resourcedetection processor]
  [resource processor]
  [batch processor]
    │
    ▼
  [debug exporter]        → stdout  (docker compose logs -f otel-collector)
  [otlp/backend exporter] → ChannelSeal cloud
```

### Why `frontendPolicies.tracing` and not `config.tracing`?

agentgateway has two tracing modes:

| Mode | Config key | Custom span attributes |
|---|---|---|
| Static | `config.tracing.otlpEndpoint` | ❌ No |
| Dynamic | `frontendPolicies.tracing.host` | ✅ Yes — CEL expressions |

Dynamic tracing is used here because it is the only mode that supports
adding custom span attributes via CEL expressions (`attributes:` block).

---

## Files

```
agentgateway-otel-logs-plugin/
├── agentgateway/
│   └── config.yaml                  # agentgateway: dynamic tracing + petstore backend
├── collector/
│   └── otel-collector-config.yaml   # OTel Collector: traces pipeline
├── docker-compose.yaml              # Two services: agentgateway + otel-collector
├── petstore_openapi.json            # OpenAPI spec (place in this directory)
├── .env.example                     # Optional: forward to a real backend
└── README.md
```

---

## Prerequisites

- Docker Desktop (Mac/Windows) or Docker Engine (Linux)
- `petstore_openapi.json` in the same directory as `docker-compose.yaml`
- Petstore API running on the host at port 10080

---

## Quick start

```bash
# 1. Place petstore_openapi.json in this directory

# 2. Start the stack
docker compose up

# 3. Open the agentgateway playground
open http://127.0.0.1:15000/ui/playground

# 4. Watch traces appear in the collector
docker compose logs -f otel-collector

# 5. Make a tool call in the playground — you'll see spans like:
#    -> mcp.tool.name: Str(listPets)
#    -> http.request.method: Str(POST)
#    -> http.response.status_code: Str(200)
```

---

## Span attributes

Every tool call span carries the following attributes, all set via CEL
expressions in `frontendPolicies.tracing.attributes`:

### MCP

| Attribute | CEL expression | Description |
|---|---|---|
| `mcp.tool.name` | `mcp.tool.name` | Name of the tool called |
| `mcp.tool.target` | `mcp.tool.target` | Backend server that owns the tool |
| `mcp.prompt.name` | `mcp.prompt.name` | Set on prompt calls |
| `mcp.resource.name` | `mcp.resource.name` | Set on resource calls |
| `mcp.session.id` | `request.headers["mcp-session-id"]` | MCP session identifier |

### HTTP request

| Attribute | CEL expression |
|---|---|
| `http.request.method` | `request.method` |
| `http.request.path` | `request.path` |
| `http.request.uri` | `request.uri` |
| `http.request.host` | `request.host` |
| `http.request.scheme` | `request.scheme` |
| `http.request.version` | `request.version` |
| `http.request.user_agent` | `request.headers["user-agent"]` |
| `http.request.content_type` | `request.headers["content-type"]` |
| `http.request.forwarded_for` | `request.headers["x-forwarded-for"]` |
| `http.request.trace_parent` | `request.headers["traceparent"]` |
| `http.request.accept` | `request.headers["accept"]` |
| `http.request.cache_control` | `request.headers["cache-control"]` |
| `http.request.start_time` | `string(request.startTime)` |
| `http.request.end_time` | `string(request.endTime)` |

### HTTP response

| Attribute | CEL expression |
|---|---|
| `http.response.status_code` | `string(response.code)` |
| `http.response.content_type` | `response.headers["content-type"]` |

### Network & backend

| Attribute | CEL expression |
|---|---|
| `network.peer.address` | `source.address` |
| `network.peer.port` | `string(source.port)` |
| `backend.name` | `backend.name` |
| `backend.type` | `backend.type` |
| `backend.protocol` | `backend.protocol` |

### Resource attributes (all spans)

| Attribute | Value |
|---|---|
| `service.name` | `agentgateway` |

---

## Viewing traces

### Collector stdout (default)

```bash
docker compose logs -f otel-collector
```

Spans appear as `Str()` / `Int()` / `Bool()` typed values — this is the OTel
Collector debug exporter's internal representation. `Str(listPets)` means the
attribute has string value `listPets`. 

### zPages (live pipeline debug)

```
http://127.0.0.1:55679/debug/tracez
```

### Forward to a real backend

1. Copy `.env.example` to `.env` and set `OTEL_BACKEND_ENDPOINT`:

```bash
# ChannelSeal OTel Collector+Exporter running locally
OTEL_BACKEND_ENDPOINT=http://localhost:14317

# ChannelSeal Cloud
OTEL_BACKEND_ENDPOINT=https://logs.channelseal.com/v1/otel
```

2. Uncomment the `otlp/backend` exporter in `collector/otel-collector-config.yaml`
   and add it to the traces pipeline exporters list.

---

## Sampling

`randomSampling: "1.0"` in `frontendPolicies.tracing` samples 100% of
requests. Note this must be a **quoted string**, not a number — the schema
requires it.

To sample a percentage in production use `clientSampling`:

```yaml
frontendPolicies:
  tracing:
    clientSampling: "0.1"   # 10% — also must be a quoted string
```

---

## Platform notes

### Mac / Docker Desktop
Works as-is. `host.docker.internal` resolves automatically without
`extra_hosts`. The `extra_hosts` entry in `docker-compose.yaml` is a no-op
on Mac but required on Linux.

### Linux / Docker Engine
Works as-is. The `extra_hosts: host.docker.internal:host-gateway` entry
injects the host's gateway IP so the agentgateway container can reach
services running on the host (petstore at port 10080).

### Admin UI
The admin UI is bound to `0.0.0.0:15000` via `config.adminAddr` in
`agentgateway/config.yaml`. Without this override, agentgateway binds the
admin UI to `127.0.0.1` inside the container, making it unreachable from
the host even with a port mapping.

Access at: `http://127.0.0.1:15000/ui`

---

## OTel Collector components used

All included in `otel/opentelemetry-collector-contrib`:

| Component | Role |
|---|---|
| `otlp` receiver | Receives OTLP/gRPC traces from agentgateway on :4317 |
| `resourcedetection` processor | Adds host.name, os.type from the container environment |
| `resource` processor | Stamps service.name and deployment.environment |
| `batch` processor | Buffers spans before export |
| `debug` exporter | Prints spans to stdout |
| `health_check` extension | Healthcheck endpoint on :13133 for docker-compose depends_on |
| `zpages` extension | Live pipeline debug UI on :55679 |