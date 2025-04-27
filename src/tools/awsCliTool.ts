import { exec } from 'child_process';
import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { STSClient, GetCallerIdentityCommand } from '@aws-sdk/client-sts';
import { EC2Client, DescribeVpcsCommand } from '@aws-sdk/client-ec2';
import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';
import { ResourceGroupsTaggingAPIClient, GetResourcesCommand } from '@aws-sdk/client-resource-groups-tagging-api';
import { CloudWatchClient, ListDashboardsCommand } from '@aws-sdk/client-cloudwatch';
import { CloudWatchLogsClient, DescribeLogGroupsCommand } from '@aws-sdk/client-cloudwatch-logs';
import { CloudWatchEventsClient, ListRulesCommand } from '@aws-sdk/client-cloudwatch-events';
import { DynamoDBClient, ListTablesCommand } from '@aws-sdk/client-dynamodb';
import { ElasticLoadBalancingV2Client, DescribeLoadBalancersCommand } from '@aws-sdk/client-elastic-load-balancing-v2';
import { IAMClient, ListUsersCommand } from '@aws-sdk/client-iam';
import { LambdaClient, ListFunctionsCommand } from '@aws-sdk/client-lambda';
import { KafkaClient, ListClustersCommand } from '@aws-sdk/client-kafka';

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
      const effectiveRegion = region || defaultRegion;
      // Only allow read-only commands
      const allowedSubcommands = [/^get/, /^list/, /^describe/, /^help/, /^ls$/];
      if (!subcommand || !allowedSubcommands.some((pat) => pat.test(subcommand))) {
        return { content: [{ type: 'text', text: 'Error: Only read-only AWS SDK commands are permitted in this MCP.' }] };
      }
      try {
        if (command === 'ec2' && subcommand === 'describe-vpcs') {
          const client = new EC2Client({ region: effectiveRegion });
          const sdkCommand = new DescribeVpcsCommand(options || {});
          const data = await client.send(sdkCommand);
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        }
        if (command === 's3' && subcommand === 'list-buckets') {
          const client = new S3Client({ region: effectiveRegion });
          const sdkCommand = new ListBucketsCommand(options || {});
          const data = await client.send(sdkCommand);
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        }
        if (command === 'cloudwatch' && subcommand === 'list-dashboards') {
          const client = new CloudWatchClient({ region: effectiveRegion });
          const sdkCommand = new ListDashboardsCommand(options || {});
          const data = await client.send(sdkCommand);
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        }
        if (command === 'cloudwatchlogs' && subcommand === 'describe-log-groups') {
          const client = new CloudWatchLogsClient({ region: effectiveRegion });
          const sdkCommand = new DescribeLogGroupsCommand(options || {});
          const data = await client.send(sdkCommand);
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        }
        if (command === 'cloudwatchevents' && subcommand === 'list-rules') {
          const client = new CloudWatchEventsClient({ region: effectiveRegion });
          const sdkCommand = new ListRulesCommand(options || {});
          const data = await client.send(sdkCommand);
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        }
        if (command === 'dynamodb' && subcommand === 'list-tables') {
          const client = new DynamoDBClient({ region: effectiveRegion });
          const sdkCommand = new ListTablesCommand(options || {});
          const data = await client.send(sdkCommand);
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        }
        if (command === 'elbv2' && subcommand === 'describe-load-balancers') {
          const client = new ElasticLoadBalancingV2Client({ region: effectiveRegion });
          const sdkCommand = new DescribeLoadBalancersCommand(options || {});
          const data = await client.send(sdkCommand);
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        }
        if (command === 'iam' && subcommand === 'list-users') {
          const client = new IAMClient({ region: effectiveRegion });
          const sdkCommand = new ListUsersCommand(options || {});
          const data = await client.send(sdkCommand);
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        }
        if (command === 'lambda' && subcommand === 'list-functions') {
          const client = new LambdaClient({ region: effectiveRegion });
          const sdkCommand = new ListFunctionsCommand(options || {});
          const data = await client.send(sdkCommand);
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        }
        if (command === 'msk' && subcommand === 'list-clusters') {
          const client = new KafkaClient({ region: effectiveRegion });
          const sdkCommand = new ListClustersCommand(options || {});
          const data = await client.send(sdkCommand);
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        }
        return { content: [{ type: 'text', text: `Error: SDK support for '${command} ${subcommand}' is not implemented yet.` }] };
      } catch (error: any) {
        return { content: [{ type: 'text', text: `Error: ${error.message || error}` }] };
      }
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
      const { service } = args;
      // List available SDK methods for the service
      if (service === 'ec2') {
        return { content: [{ type: 'text', text: 'Available EC2 SDK methods: DescribeVpcs, ...' }] };
      }
      if (service === 's3') {
        return { content: [{ type: 'text', text: 'Available S3 SDK methods: ListBuckets, ...' }] };
      }
      if (service === 'resourcegroupstaggingapi') {
        return { content: [{ type: 'text', text: 'Available ResourceGroupsTaggingAPI SDK methods: GetResources, ...' }] };
      }
      if (service === 'cloudwatch') {
        return { content: [{ type: 'text', text: 'Available CloudWatch SDK methods: ListDashboards, ...' }] };
      }
      if (service === 'cloudwatchlogs') {
        return { content: [{ type: 'text', text: 'Available CloudWatchLogs SDK methods: DescribeLogGroups, ...' }] };
      }
      if (service === 'cloudwatchevents') {
        return { content: [{ type: 'text', text: 'Available CloudWatchEvents SDK methods: ListRules, ...' }] };
      }
      if (service === 'dynamodb') {
        return { content: [{ type: 'text', text: 'Available DynamoDB SDK methods: ListTables, ...' }] };
      }
      if (service === 'elbv2') {
        return { content: [{ type: 'text', text: 'Available ELBv2 SDK methods: DescribeLoadBalancers, ...' }] };
      }
      if (service === 'iam') {
        return { content: [{ type: 'text', text: 'Available IAM SDK methods: ListUsers, ...' }] };
      }
      if (service === 'lambda') {
        return { content: [{ type: 'text', text: 'Available Lambda SDK methods: ListFunctions, ...' }] };
      }
      if (service === 'msk') {
        return { content: [{ type: 'text', text: 'Available MSK SDK methods: ListClusters, ...' }] };
      }
      return { content: [{ type: 'text', text: `Error: SDK support for service '${service}' is not implemented yet.` }] };
    }
  );

  // Tool: crawlResources
  server.tool(
    'crawlResources',
    {
      region: z.string().optional().describe('AWS region to crawl for resources (e.g., us-west-2). If not provided, uses the default region.'),
    },
    async (args) => {
      const { region } = args;
      const effectiveRegion = region || defaultRegion;
      try {
        const client = new ResourceGroupsTaggingAPIClient({ region: effectiveRegion });
        const sdkCommand = new GetResourcesCommand({});
        const data = await client.send(sdkCommand);
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      } catch (error: any) {
        return { content: [{ type: 'text', text: `Error: ${error.message || error}` }] };
      }
    }
  ); 
} 