import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerAwsCliTools } from './tools/awsCliTool';

const server = new McpServer({
  name: 'AWS CLI MCP',
  version: '1.0.0',
  description: 'Model Context Protocol server for executing AWS CLI commands',
  systemPrompt: `You are an agent that can execute AWS CLI commands on behalf of the user. Use the available tools to interact with AWS services. Always validate input and return clear, structured results. You support setting the AWS region per command or for the session using setDefaultRegion. If both are set, the per-command region takes precedence.`,
  usage: {
    examples: [
      'List all S3 buckets',
      'Describe EC2 instances in us-west-2',
      'Get help for the Lambda service in eu-central-1',
      'Create a new S3 bucket in ap-southeast-1',
      'Show available AWS services',
      'Set the default region to us-east-1',
      'Clear the default region',
    ],
  },
});

registerAwsCliTools(server);

const transport = new StdioServerTransport();

// Start the MCP server
(async () => {
  await server.connect(transport);
})(); 