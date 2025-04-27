import { registerAwsCliTools } from '../src/tools/awsCliTool';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

jest.mock('child_process', () => ({
  exec: jest.fn((cmd, cb) => cb(null, 'mocked output', '')),
}));
jest.mock('fs', () => ({
  appendFileSync: jest.fn(),
}));

describe('awsCliTool MCP (read-only)', () => {
  let server: any;
  let tools: Record<string, Function> = {};

  beforeEach(() => {
    tools = {};
    server = {
      tool: (name: string, _schema: any, fn: Function) => {
        tools[name] = fn;
      },
    };
    registerAwsCliTools(server as unknown as McpServer);
  });

  it('allows read-only commands (get, list, describe, help, sts get-caller-identity)', async () => {
    const allowed = [
      { command: 's3', subcommand: 'ls' },
      { command: 'ec2', subcommand: 'describe-instances' },
      { command: 'iam', subcommand: 'list-users' },
      { command: 's3api', subcommand: 'get-bucket-location' },
      { command: 'ec2', subcommand: 'help' },
      { command: 'sts', subcommand: 'get-caller-identity' },
    ];
    for (const args of allowed) {
      const result = await tools.executeAwsCommand(args);
      expect(result.content[0].text).toBe('mocked output');
    }
  });

  it('blocks mutating commands (put, create, delete, update, etc.)', async () => {
    const blocked = [
      { command: 's3', subcommand: 'mb' },
      { command: 'ec2', subcommand: 'run-instances' },
      { command: 's3api', subcommand: 'put-object' },
      { command: 'ec2', subcommand: 'terminate-instances' },
      { command: 'lambda', subcommand: 'create-function' },
      { command: 'dynamodb', subcommand: 'delete-table' },
      { command: 'ec2', subcommand: 'start-instances' },
      { command: 'ec2', subcommand: 'stop-instances' },
    ];
    for (const args of blocked) {
      const result = await tools.executeAwsCommand(args);
      expect(result.content[0].text).toMatch(/Error: Only read-only AWS CLI commands are permitted/);
    }
  });
}); 