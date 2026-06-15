import * as dotenv from 'dotenv';
dotenv.config();

import { TokenStorage } from './storage/tokens.js';
import { OAuthClient } from './api/oauth.js';
import { EtsyApiClient } from './api/client.js';
import { EtsyMcpServer } from './mcp/server.js';
import { logger } from './utils/logger.js';

const apiKey = process.env.ETSY_API_KEY;
if (!apiKey) throw new Error('ETSY_API_KEY is required in .env');

const port = parseInt(process.env.ETSY_MCP_PORT ?? '3003', 10);
const redirectUri = process.env.ETSY_REDIRECT_URI ?? `http://localhost:${port}/oauth/callback`;
const storageDir = process.env.ETSY_MCP_TOKEN_PATH || undefined;

const storage = new TokenStorage(storageDir);
const oauth = new OAuthClient(apiKey, redirectUri, storage, port);
const client = new EtsyApiClient(apiKey, storage, (rt) => oauth.refreshToken(rt));
const server = new EtsyMcpServer(client, oauth, storage);

server.start().catch((err) => {
  logger.error('Server failed to start:', err);
  process.exit(1);
});
