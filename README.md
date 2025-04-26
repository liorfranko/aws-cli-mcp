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

## 🔐 Security Notes
- This server executes AWS CLI commands with the same permissions as your configured AWS credentials.
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

## License
MIT License 