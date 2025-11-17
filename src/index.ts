#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

// Create MCP server instance
const server = new Server(
  {
    name: "mcp-playground",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// Define available tools
const TOOLS: Tool[] = [
  {
    name: "echo",
    description: "Echoes back the provided message",
    inputSchema: {
      type: "object",
      properties: {
        message: {
          type: "string",
          description: "The message to echo back",
        },
      },
      required: ["message"],
    },
  },
  {
    name: "add",
    description: "Adds two numbers together",
    inputSchema: {
      type: "object",
      properties: {
        a: {
          type: "number",
          description: "First number",
        },
        b: {
          type: "number",
          description: "Second number",
        },
      },
      required: ["a", "b"],
    },
  },
  {
    name: "get_time",
    description: "Returns the current server time",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
];

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: TOOLS,
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "echo": {
      const message = args?.message as string;
      return {
        content: [
          {
            type: "text",
            text: `Echo: ${message}`,
          },
        ],
      };
    }

    case "add": {
      const a = args?.a as number;
      const b = args?.b as number;
      const result = a + b;
      return {
        content: [
          {
            type: "text",
            text: `${a} + ${b} = ${result}`,
          },
        ],
      };
    }

    case "get_time": {
      const now = new Date().toISOString();
      return {
        content: [
          {
            type: "text",
            text: `Current server time: ${now}`,
          },
        ],
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// List available resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "info://server",
        name: "Server Information",
        description: "Information about this MCP server",
        mimeType: "text/plain",
      },
      {
        uri: "data://example",
        name: "Example Data",
        description: "Example resource with sample data",
        mimeType: "application/json",
      },
    ],
  };
});

// Handle resource reads
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  switch (uri) {
    case "info://server":
      return {
        contents: [
          {
            uri,
            mimeType: "text/plain",
            text: `MCP Playground Server
Name: mcp-playground
Version: 1.0.0
Transport: Stdio
Capabilities: Tools, Resources

This is a demonstration MCP server with support for both Stdio and SSE transports.`,
          },
        ],
      };

    case "data://example":
      return {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify(
              {
                example: "data",
                timestamp: new Date().toISOString(),
                items: ["item1", "item2", "item3"],
              },
              null,
              2
            ),
          },
        ],
      };

    default:
      throw new Error(`Unknown resource: ${uri}`);
  }
});

// Start the server with Stdio transport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
