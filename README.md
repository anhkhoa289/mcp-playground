# MCP Playground

MCP (Model Context Protocol) server với hỗ trợ cả hai phương thức transport:
- **Pure MCP SDK (Stdio)** - Standard input/output transport
- **SSE Transport (Server-Sent Events)** - HTTP-based transport

## Tính năng

- ✅ Hỗ trợ Pure MCP SDK với Stdio transport
- ✅ Hỗ trợ SSE (Server-Sent Events) transport
- ✅ Các công cụ (tools) ví dụ: echo, add, get_time, generate_uuid
- ✅ Các tài nguyên (resources) ví dụ: server info, example data
- ✅ TypeScript với type safety đầy đủ
- ✅ Development mode với hot reload

## Cài đặt

```bash
npm install
```

## Sử dụng

### 1. Stdio Transport (Pure MCP SDK)

Chạy server với stdio transport:

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

Server sẽ giao tiếp qua stdin/stdout, phù hợp cho việc tích hợp với Claude Desktop hoặc các MCP clients khác.

#### Cấu hình cho Claude Desktop

Thêm vào file cấu hình Claude Desktop (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "mcp-playground": {
      "command": "node",
      "args": ["/path/to/mcp-playground/dist/index.js"]
    }
  }
}
```

Hoặc trong development mode:

```json
{
  "mcpServers": {
    "mcp-playground": {
      "command": "npx",
      "args": ["tsx", "/path/to/mcp-playground/src/index.ts"]
    }
  }
}
```

### 2. SSE Transport (Server-Sent Events)

Chạy server với SSE transport:

```bash
# Development mode
npm run dev:sse

# Production mode
npm run build
npm run start:sse
```

Server sẽ chạy trên `http://localhost:3000` với các endpoints:

- `GET /health` - Health check
- `GET /sse` - SSE connection endpoint
- `POST /messages` - Client message endpoint

#### Kết nối với SSE Client

Sử dụng MCP Client để kết nối:

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

const transport = new SSEClientTransport(
  new URL("http://localhost:3000/sse")
);

const client = new Client(
  {
    name: "example-client",
    version: "1.0.0",
  },
  {
    capabilities: {},
  }
);

await client.connect(transport);
```

## API

### Tools (Công cụ)

#### `echo`
Phản hồi lại tin nhắn được gửi.

**Input:**
```json
{
  "message": "Hello, World!"
}
```

**Output:**
```
Echo: Hello, World!
```

#### `add`
Cộng hai số với nhau.

**Input:**
```json
{
  "a": 5,
  "b": 3
}
```

**Output:**
```
5 + 3 = 8
```

#### `get_time`
Trả về thời gian hiện tại của server.

**Input:**
```json
{}
```

**Output:**
```
Current server time: 2024-01-15T10:30:00.000Z
```

#### `generate_uuid` (chỉ SSE)
Tạo UUID ngẫu nhiên.

**Input:**
```json
{}
```

**Output:**
```
Generated UUID: 123e4567-e89b-12d3-a456-426614174000
```

### Resources (Tài nguyên)

#### `info://server`
Thông tin về MCP server.

#### `data://example`
Dữ liệu JSON ví dụ.

#### `stats://connections` (chỉ SSE)
Thống kê kết nối.

## Cấu trúc dự án

```
mcp-playground/
├── src/
│   ├── index.ts          # Stdio transport server
│   └── sse-server.ts     # SSE transport server
├── dist/                 # Compiled JavaScript
├── package.json
├── tsconfig.json
└── README.md
```

## Development

```bash
# Build project
npm run build

# Watch mode (auto rebuild)
npm run watch

# Run stdio server in dev mode
npm run dev

# Run SSE server in dev mode
npm run dev:sse
```

## Kiểm thử

### Test Stdio Transport

```bash
# Chạy server
npm run dev

# Gửi JSON-RPC request qua stdin (trong terminal khác)
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | npm run dev
```

### Test SSE Transport

```bash
# Chạy server
npm run dev:sse

# Test health endpoint
curl http://localhost:3000/health

# Test SSE endpoint (trong browser hoặc với curl)
curl -N http://localhost:3000/sse
```

## Tài liệu tham khảo

- [Model Context Protocol Documentation](https://modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP Specification](https://spec.modelcontextprotocol.io/)

## License

MIT