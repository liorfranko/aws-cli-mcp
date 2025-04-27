import { exec } from 'child_process';
import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

let defaultRegion: string | undefined;

export function registerAwsCliTools(server: McpServer) {
  // Tool: setDefaultRegion
  server.tool(
    'setDefaultRegion',
    {
      region: z.string().describe('AWS region to set as default for this session. Use empty string to clear.'),
    },
    async (args) => {
      const { region } = args;
      if (region && region.trim() !== '') {
        defaultRegion = region.trim();
        return { content: [{ type: 'text', text: `Default region set to '${defaultRegion}' for this session.` }] };
      } else {
        defaultRegion = undefined;
        return { content: [{ type: 'text', text: 'Default region cleared for this session.' }] };
      }
    }
  );

  // Tool: executeAwsCommand
  server.tool(
    'executeAwsCommand',
    {
      command: z.string().describe('AWS service (e.g., s3, ec2, lambda)'),
      subcommand: z.string().optional().describe('Command to execute (e.g., ls, describe-instances)'),
      options: z.record(z.union([z.string(), z.boolean()])).optional().describe('Command options as key-value pairs'),
      region: z.string().optional().describe('AWS region to use for this command'),
    },
    async (args) => {
      const { command, subcommand, options, region } = args;
      // Only allow read-only commands
      const allowedSubcommands = [/^get/, /^list/, /^describe/, /^help/, /^ls$/];
      const fullCmd = [command, subcommand].filter(Boolean).join(' ');
      const isStsGetCallerIdentity = fullCmd === 'sts get-caller-identity';
      const isAllowed =
        isStsGetCallerIdentity ||
        (subcommand && allowedSubcommands.some((pat) => pat.test(subcommand)));
      if (!isAllowed) {
        return { content: [{ type: 'text', text: 'Error: Only read-only AWS CLI commands are permitted in this MCP.' }] };
      }
      let cliCmd = `aws ${command}`;
      if (subcommand) cliCmd += ` ${subcommand}`;
      if (options && typeof options === 'object') {
        for (const [key, value] of Object.entries(options)) {
          if (typeof value === 'boolean') {
            if (value) cliCmd += ` --${key}`;
          } else {
            cliCmd += ` --${key} ${value}`;
          }
        }
      }
      // Add region if provided or defaultRegion is set
      const effectiveRegion = region || defaultRegion;
      if (effectiveRegion) {
        cliCmd += ` --region ${effectiveRegion}`;
      }
      return new Promise((resolve) => {
        exec(cliCmd, (error, stdout, stderr) => {
          if (error) {
            resolve({ content: [{ type: 'text', text: stderr || error.message }] });
          } else {
            resolve({ content: [{ type: 'text', text: stdout }] });
          }
        });
      });
    }
  );

  // Tool: getServiceDetails
  server.tool(
    'getServiceDetails',
    {
      service: z.string().describe('AWS service name (e.g., s3, ec2, lambda)'),
      region: z.string().optional().describe('AWS region to use for this command'),
    },
    async (args) => {
      const { service, region } = args;
      let cliCmd = `aws ${service} help`;
      const effectiveRegion = region || defaultRegion;
      if (effectiveRegion) {
        cliCmd += ` --region ${effectiveRegion}`;
      }
      return new Promise((resolve) => {
        exec(cliCmd, (error, stdout, stderr) => {
          if (error) {
            resolve({ content: [{ type: 'text', text: stderr || error.message }] });
          } else {
            resolve({ content: [{ type: 'text', text: stdout }] });
          }
        });
      });
    }
  );

  // Tool: testAwsCredentials
  server.tool(
    'testAwsCredentials',
    {
      region: z.string().optional().describe('AWS region to use for this command'),
    },
    async (args) => {
      const { region } = args || {};
      let cliCmd = 'aws sts get-caller-identity';
      const effectiveRegion = region || defaultRegion;
      if (effectiveRegion) {
        cliCmd += ` --region ${effectiveRegion}`;
      }
      return new Promise((resolve) => {
        exec(cliCmd, (error, stdout, stderr) => {
          if (error) {
            resolve({ content: [{ type: 'text', text: stderr || error.message }] });
          } else {
            resolve({ content: [{ type: 'text', text: stdout }] });
          }
        });
      });
    }
  );

  // Tool: crawlResources
  server.tool(
    'crawlResources',
    {
      region: z.string().describe('AWS region to crawl for resources (e.g., us-west-2)'),
    },
    async (args) => {
      const { region } = args;
      if (!region || region.trim() === '') {
        return { content: [{ type: 'text', text: 'Region is required.' }] };
      }
      const cliCmd = `aws resourcegroupstaggingapi get-resources --region ${region.trim()}`;
      return new Promise((resolve) => {
        exec(cliCmd, (error, stdout, stderr) => {
          if (error) {
            resolve({ content: [{ type: 'text', text: stderr || error.message }] });
          } else {
            resolve({ content: [{ type: 'text', text: stdout }] });
          }
        });
      });
    }
  );
} 