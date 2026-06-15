import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { ShopsResource } from '../../api/resources/shops.js';
import { TokenStorage } from '../../storage/tokens.js';

export function registerShopTools(server: McpServer, shops: ShopsResource, storage: TokenStorage) {
  server.tool(
    'get_shop_details',
    'Get details for a shop.',
    { shop_id: z.number().optional().describe('Shop ID. Uses default if omitted.') },
    async ({ shop_id }) => {
      const id = shop_id ?? storage.getTokens()?.shop_id;
      if (!id) return { content: [{ type: 'text' as const, text: 'No shop ID. Run set_default_shop.' }] };
      const shop = await shops.getShop(id);
      return { content: [{ type: 'text' as const, text: JSON.stringify(shop, null, 2) }] };
    }
  );
}
