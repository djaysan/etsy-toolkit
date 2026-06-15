import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { EtsyApiClient } from '../api/client.js';
import { OAuthClient } from '../api/oauth.js';
import { TokenStorage } from '../storage/tokens.js';
import { ShopsResource } from '../api/resources/shops.js';
import { ListingsResource } from '../api/resources/listings.js';
import { ShippingResource } from '../api/resources/shipping.js';
import { registerAuthTools } from './tools/auth.js';
import { registerShopTools } from './tools/shops.js';
import { registerListingTools } from './tools/listings.js';
import { registerShippingTools } from './tools/shipping.js';
import { logger } from '../utils/logger.js';

export class EtsyMcpServer {
  private server: McpServer;

  constructor(
    private client: EtsyApiClient,
    private oauth: OAuthClient,
    private storage: TokenStorage,
  ) {
    this.server = new McpServer({
      name: 'etsy-toolkit',
      version: '0.1.0',
    });

    const shops = new ShopsResource(client);
    const listings = new ListingsResource(client);
    const shipping = new ShippingResource(client);

    registerAuthTools(this.server, oauth, storage, shops);
    registerShopTools(this.server, shops, storage);
    registerListingTools(this.server, listings, storage);
    registerShippingTools(this.server, shipping, storage);
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    logger.log('MCP server started');
  }
}
