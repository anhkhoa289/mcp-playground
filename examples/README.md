# Examples

Các ví dụ về cách sử dụng MCP Playground.

## SSE Client Example

File `sse-client.ts` minh họa cách kết nối và sử dụng MCP server với SSE transport.

### Chạy ví dụ

1. Khởi động SSE server:
```bash
npm run dev:sse
```

2. Trong terminal khác, chạy client:
```bash
npx tsx examples/sse-client.ts
```

### Các tính năng được demo

- ✅ Kết nối đến MCP server qua SSE
- ✅ Liệt kê các tools có sẵn
- ✅ Gọi các tools: echo, add, get_time, generate_uuid
- ✅ Liệt kê các resources có sẵn
- ✅ Đọc resource content
- ✅ Xử lý lỗi và đóng kết nối

## Stdio Transport

Stdio transport được sử dụng chủ yếu với Claude Desktop hoặc các MCP clients tích hợp.

### Cấu hình cho Claude Desktop

Thêm vào `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "mcp-playground": {
      "command": "npx",
      "args": ["tsx", "/absolute/path/to/mcp-playground/src/index.ts"]
    }
  }
}
```

Sau đó khởi động lại Claude Desktop và bạn sẽ thấy các tools và resources từ MCP Playground.

## Test với curl

### Health Check
```bash
curl http://localhost:3000/health
```

### SSE Stream
```bash
curl -N http://localhost:3000/sse
```

## Tạo client của riêng bạn

### SSE Client

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

const transport = new SSEClientTransport(
  new URL("http://localhost:3000/sse")
);

const client = new Client(
  { name: "my-client", version: "1.0.0" },
  { capabilities: {} }
);

await client.connect(transport);

// Gọi tool
const result = await client.request({
  method: "tools/call",
  params: {
    name: "echo",
    arguments: { message: "Hello!" }
  }
}, { schema: { type: "object" } });

await client.close();
```

### Stdio Client

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
  command: "node",
  args: ["dist/index.js"]
});

const client = new Client(
  { name: "my-client", version: "1.0.0" },
  { capabilities: {} }
);

await client.connect(transport);

// Sử dụng tương tự như SSE client

await client.close();
```
