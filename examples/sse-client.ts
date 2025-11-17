import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

/**
 * Example MCP client using SSE transport
 */
async function main() {
  console.log("Connecting to MCP SSE server...");

  // Create SSE transport
  const transport = new SSEClientTransport(
    new URL("http://localhost:3000/sse")
  );

  // Create MCP client
  const client = new Client(
    {
      name: "example-sse-client",
      version: "1.0.0",
    },
    {
      capabilities: {},
    }
  );

  try {
    // Connect to server
    await client.connect(transport);
    console.log("✅ Connected to server");

    // List available tools
    console.log("\n📋 Listing available tools...");
    const toolsResult = await client.request(
      {
        method: "tools/list",
      },
      { schema: { type: "object" } }
    );
    console.log("Available tools:", JSON.stringify(toolsResult, null, 2));

    // Call echo tool
    console.log("\n🔊 Calling echo tool...");
    const echoResult = await client.request(
      {
        method: "tools/call",
        params: {
          name: "echo",
          arguments: {
            message: "Hello from SSE client!",
          },
        },
      },
      { schema: { type: "object" } }
    );
    console.log("Echo result:", JSON.stringify(echoResult, null, 2));

    // Call add tool
    console.log("\n➕ Calling add tool...");
    const addResult = await client.request(
      {
        method: "tools/call",
        params: {
          name: "add",
          arguments: {
            a: 42,
            b: 58,
          },
        },
      },
      { schema: { type: "object" } }
    );
    console.log("Add result:", JSON.stringify(addResult, null, 2));

    // Call get_time tool
    console.log("\n⏰ Calling get_time tool...");
    const timeResult = await client.request(
      {
        method: "tools/call",
        params: {
          name: "get_time",
          arguments: {},
        },
      },
      { schema: { type: "object" } }
    );
    console.log("Time result:", JSON.stringify(timeResult, null, 2));

    // Call generate_uuid tool
    console.log("\n🔑 Calling generate_uuid tool...");
    const uuidResult = await client.request(
      {
        method: "tools/call",
        params: {
          name: "generate_uuid",
          arguments: {},
        },
      },
      { schema: { type: "object" } }
    );
    console.log("UUID result:", JSON.stringify(uuidResult, null, 2));

    // List available resources
    console.log("\n📚 Listing available resources...");
    const resourcesResult = await client.request(
      {
        method: "resources/list",
      },
      { schema: { type: "object" } }
    );
    console.log("Available resources:", JSON.stringify(resourcesResult, null, 2));

    // Read server info resource
    console.log("\n📖 Reading server info resource...");
    const infoResult = await client.request(
      {
        method: "resources/read",
        params: {
          uri: "info://server",
        },
      },
      { schema: { type: "object" } }
    );
    console.log("Server info:", JSON.stringify(infoResult, null, 2));

    console.log("\n✅ All tests completed successfully!");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await client.close();
    console.log("\n👋 Disconnected from server");
  }
}

main().catch(console.error);
