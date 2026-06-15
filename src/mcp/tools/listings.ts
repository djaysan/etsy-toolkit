import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { ListingsResource } from '../../api/resources/listings.js';
import { TokenStorage } from '../../storage/tokens.js';

export function registerListingTools(server: McpServer, listings: ListingsResource, storage: TokenStorage) {
  server.tool(
    'get_listings',
    'Get active listings for a shop.',
    {
      shop_id: z.number().optional(),
      limit: z.number().optional().default(25),
      offset: z.number().optional().default(0),
    },
    async ({ shop_id, limit, offset }) => {
      const id = shop_id ?? storage.getTokens()?.shop_id;
      if (!id) return { content: [{ type: 'text' as const, text: 'No shop ID.' }] };
      const result = await listings.getListings(id, limit, offset);
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    'create_listing',
    'Create a new Etsy listing. For physical items, provide a shipping_profile_id.',
    {
      shop_id: z.number().optional(),
      quantity: z.number(),
      title: z.string(),
      description: z.string(),
      price: z.number().describe('Price in the shop currency (e.g. 89.99)'),
      who_made: z.enum(['i_did', 'someone_else', 'collective']),
      when_made: z.string().describe('e.g. "2020_2024"'),
      taxonomy_id: z.number(),
      shipping_profile_id: z.number().optional(),
      type: z.enum(['physical', 'digital', 'download']).optional().default('physical'),
    },
    async ({ shop_id, ...params }) => {
      const id = shop_id ?? storage.getTokens()?.shop_id;
      if (!id) return { content: [{ type: 'text' as const, text: 'No shop ID.' }] };
      const listing = await listings.createListing(id, params);
      return { content: [{ type: 'text' as const, text: JSON.stringify(listing, null, 2) }] };
    }
  );
}
