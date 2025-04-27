# AWS CLI MCP

An MCP (Model Context Protocol) server that lets you generate and execute AWS CLI commands via HTTP, designed for LLM (Large Language Model) integration.

## ✨ Features

- Modular, tool-based architecture (inspired by [home-assistant-mcp](https://github.com/liorfranko/home-assistant-mcp))
- Execute AWS CLI commands through HTTP endpoints (**read-only commands only: get, list, describe, help, sts get-caller-identity**)
- Get detailed information about AWS services
- Full access to AWS CLI capabilities (read-only)

## 🗂️ Project Structure

```
src/
  tools/            # All AWS CLI tool implementations
    awsCliTool.ts   # Modular AWS CLI tool logic
  index.ts          # Tool registration and HTTP API
  ...
dist/               # Compiled output
```

## 🛠️ Tool Reference & API

> **Note:** The MCP server is strictly read-only. Only AWS CLI commands that do not modify state are supported (get, list, describe, help, sts get-caller-identity).

### POST /api/execute-aws-command
- Execute an AWS CLI command
- **Body:**
  ```json
  {
    "command": "s3",
    "subcommand": "ls",
    "options": { "region": "us-west-2" }
  }
  ```
- **Returns:**
  ```json
  { "output": "..." }
  ```

### GET /api/get-service-details/:service
- Get help for a specific AWS service (e.g., `ec2`, `s3`)
- **Returns:**
  ```json
  { "help": "..." }
  ```

### POST /api/crawl-resources
- Enumerate all AWS resources in a specific region using the Resource Groups Tagging API
- **Body:**
  ```json
  {
    "region": "us-west-2"
  }
  ```
- **Returns:**
  ```json
  { "resources": [ ... ] }
  ```
- **Description:**
  Returns a list of all AWS resources in the specified region that are discoverable via the Resource Groups Tagging API. Useful for inventory, auditing, and automation workflows.

## 🚀 Quick Start

1. Clone this repository:
   ```sh
   git clone <your-repo-url>
   cd aws-cli-mcp
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Build the project:
   ```sh
   npm run build
   ```
4. Ensure AWS CLI is configured:
   ```sh
   aws configure
   ```
5. Start the server:
   ```sh
   npm start
   ```

The server will listen on port 3000 by default.

## 🪪 AWS Credentials & Environment Setup

This project uses a helper script to manage AWS credentials for the MCP server.

## 🔐 Security Notes
- This server executes AWS CLI commands with the same permissions as your configured AWS credentials.
- **MCP is strictly read-only: only non-mutating AWS CLI operations are allowed.**
- Be careful about who can access this server.
- Consider implementing additional authentication for production use.

## 🛠️ Troubleshooting

### MCP Can't Reach AWS Environment Variables
If you encounter issues where the MCP server cannot access your AWS credentials or environment variables:

- Ensure the environment variables (e.g., `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_DEFAULT_REGION`) are set in the environment where the server is running.
- If you configured AWS CLI using `aws configure`, ensure the credentials are in the correct profile and accessible to the user running the MCP server.
- Restart the server after updating environment variables or credentials.
- Check for typos or missing values in your environment setup.

If problems persist, try running the server in a terminal where you have confirmed the environment variables are set correctly (e.g., by running `env | grep AWS`).

## 🏗️ Architectural Patterns

- Modular, domain-driven tool architecture
- Explicit tool registration in `src/index.ts`
- Strong typing & validation
- Comprehensive error handling
- **Strict read-only enforcement for all AWS CLI operations**

## Running Tests

This project uses [Jest](https://jestjs.io/) for testing. To run the test suite:

```sh
npm install
npm test
```

Test files should be placed in the `__tests__/` directory at the project root or alongside the modules they test.

## License
MIT License 