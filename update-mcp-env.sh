#!/bin/bash
# update-mcp-env.sh
# Updates .cursor/mcp.json with the latest AWS credentials from ~/.awscreds

MCP_JSON="$HOME/.cursor/mcp.json"
CREDS_FILE="$HOME/.awscreds"

if [ ! -f "$CREDS_FILE" ]; then
  echo "Credentials file $CREDS_FILE not found!"
  exit 1
fi
if [ ! -f "$MCP_JSON" ]; then
  echo "MCP config $MCP_JSON not found!"
  exit 1
fi

# Extract credentials from ~/.awscreds
AWS_ACCESS_KEY_ID=$(grep AWS_ACCESS_KEY_ID "$CREDS_FILE" | cut -d'=' -f2-)
AWS_SECRET_ACCESS_KEY=$(grep AWS_SECRET_ACCESS_KEY "$CREDS_FILE" | cut -d'=' -f2-)
AWS_SESSION_TOKEN=$(grep AWS_SESSION_TOKEN "$CREDS_FILE" | cut -d'=' -f2-)
AWS_CREDENTIAL_EXPIRATION=$(grep AWS_CREDENTIAL_EXPIRATION "$CREDS_FILE" | cut -d'=' -f2-)

# Update .cursor/mcp.json for aws-cli-mcp-server in mcpServers object
jq \
  --arg id "$AWS_ACCESS_KEY_ID" \
  --arg key "$AWS_SECRET_ACCESS_KEY" \
  --arg token "$AWS_SESSION_TOKEN" \
  --arg exp "$AWS_CREDENTIAL_EXPIRATION" \
  '.mcpServers["aws-cli-mcp-server"].env.AWS_ACCESS_KEY_ID = $id |
   .mcpServers["aws-cli-mcp-server"].env.AWS_SECRET_ACCESS_KEY = $key |
   .mcpServers["aws-cli-mcp-server"].env.AWS_SESSION_TOKEN = $token |
   .mcpServers["aws-cli-mcp-server"].env.AWS_CREDENTIAL_EXPIRATION = $exp' \
  "$MCP_JSON" > "$MCP_JSON.tmp" && mv "$MCP_JSON.tmp" "$MCP_JSON"

echo "Updated aws-cli-mcp-server credentials in mcpServers object in $MCP_JSON from $CREDS_FILE." 