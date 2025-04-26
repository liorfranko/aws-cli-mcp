# AWS CLI MCP

An MCP (Model Context Protocol) server that lets you generate and execute AWS CLI commands via HTTP, designed for LLM (Large Language Model) integration.

## ✨ Features

- Modular, tool-based architecture (inspired by [home-assistant-mcp](https://github.com/liorfranko/home-assistant-mcp))
- Execute AWS CLI commands through HTTP endpoints
- Get detailed information about AWS services
- Full access to AWS CLI capabilities

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

### `update-mcp-env.sh`

This script updates the MCP server's credentials by copying values from your `~/.awscreds` file into the `.cursor/mcp.json` configuration.

**When to use:**  
Run this script whenever your AWS credentials change or expire to ensure the MCP server uses the latest credentials.

**How it works:**
- Reads AWS credentials from `~/.awscreds` in your home directory.
- Updates the `mcpServers["aws-cli-mcp-server"].env` section in `.cursor/mcp.json` (in your home directory).

**Usage:**
```sh
./update-mcp-env.sh
```

**Required files:**
- `~/.awscreds` (must exist and contain your AWS credentials)
- `~/.cursor/mcp.json` (must exist and be initialized)

**Example `~/.awscreds` file:**
```
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_SESSION_TOKEN=your-session-token
AWS_CREDENTIAL_EXPIRATION=2024-12-31T23:59:59Z
```

**Troubleshooting:**
- If either file is missing, the script will print an error and exit.
- Make sure both files exist before running the script.

## 🔐 Security Notes
- This server executes AWS CLI commands with the same permissions as your configured AWS credentials.
- Be careful about who can access this server.
- Consider implementing additional authentication for production use.

## 🏗️ Architectural Patterns

- Modular, domain-driven tool architecture
- Explicit tool registration in `src/index.ts`
- Strong typing & validation
- Comprehensive error handling

## License
MIT License 