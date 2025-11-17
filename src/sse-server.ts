#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import express from "express";
import cors from "cors";

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Create MCP server instance
const createServer = () => {
  const server = new Server(
    {
      name: "mcp-playground-sse",
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
    {
      name: "generate_uuid",
      description: "Generates a random UUID",
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

      case "generate_uuid": {
        const uuid = crypto.randomUUID();
        return {
          content: [
            {
              type: "text",
              text: `Generated UUID: ${uuid}`,
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
        {
          uri: "stats://connections",
          name: "Connection Statistics",
          description: "Statistics about active connections",
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
              text: `MCP Playground Server (SSE)
Name: mcp-playground-sse
Version: 1.0.0
Transport: Server-Sent Events (SSE)
Capabilities: Tools, Resources

This is a demonstration MCP server with SSE transport support.
Endpoint: http://localhost:${PORT}/sse`,
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
                  transport: "SSE",
                },
                null,
                2
              ),
            },
          ],
        };

      case "stats://connections":
        return {
          contents: [
            {
              uri,
              mimeType: "application/json",
              text: JSON.stringify(
                {
                  timestamp: new Date().toISOString(),
                  server: "running",
                  transport: "SSE",
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

  return server;
};

// Health check endpoint
app.get("/health", (_req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    transport: "SSE",
  });
});

// SSE endpoint
app.get("/sse", async (req, res) => {
  console.log("New SSE connection established");

  const server = createServer();
  const transport = new SSEServerTransport("/messages", res);

  await server.connect(transport);

  req.on("close", () => {
    console.log("SSE connection closed");
  });
});

// POST endpoint for client messages
app.post("/messages", async (req, res) => {
  // This endpoint is used by the SSE transport to receive messages from the client
  res.status(200).end();
});

// Start the server
app.listen(PORT, () => {
  console.log(`MCP SSE Server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`SSE endpoint: http://localhost:${PORT}/sse`);
});
