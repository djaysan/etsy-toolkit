import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { OAuthClient } from '../../api/oauth.js';
import { TokenStorage } from '../../storage/tokens.js';
import { ShopsResource } from '../../api/resources/shops.js';

export function registerAuthTools(
  server: McpServer,
  oauth: OAuthClient,
  storage: TokenStorage,
  shops: ShopsResource,
) {
  server.tool(
    'authenticate',
    'Start OAuth flow with Etsy. Opens a browser window — complete the login there.',
    {},
    async () => {
      const url = oauth.getAuthInitiationUrl();
      oauth.startCallbackServer().catch(() => {});
      return {
        content: [{
          type: 'text' as const,
          text: `Open this URL to authenticate:\n\n${url}\n\nWaiting for callback...`,
        }],
      };
    }
  );

  server.tool(
    'set_default_shop',
    'Fetch your Etsy shops and save the first one as default. Run this after authenticating.',
    {},
    async () => {
      const tokens = storage.getTokens();
      if (!tokens?.access_token) {
        return { content: [{ type: 'text' as const, text: 'Not authenticated. Run authenticate first.' }] };
      }
      if (!tokens.user_id) {
        return { content: [{ type: 'text' as const, text: 'No user_id in token. Re-authenticate.' }] };
      }
      const shopList = await shops.getUserShops(tokens.user_id);
      if (!shopList.length) {
        return { content: [{ type: 'text' as const, text: 'No shops found for this account.' }] };
      }
      const shop = shopList[0];
      storage.saveTokens({ ...tokens, shop_id: shop.shop_id, shop_name: shop.shop_name });
      return {
        content: [{ type: 'text' as const, text: `Default shop set: ${shop.shop_name} (ID: ${shop.shop_id})` }],
      };
    }
  );

  server.tool(
    'get_default_shop',
    'Show the currently saved default shop.',
    {},
    async () => {
      const tokens = storage.getTokens();
      if (!tokens?.shop_id) {
        return { content: [{ type: 'text' as const, text: 'No default shop set. Run set_default_shop.' }] };
      }
      return {
        content: [{ type: 'text' as const, text: `Default shop: ${tokens.shop_name} (ID: ${tokens.shop_id})` }],
      };
    }
  );
}
