import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { ShippingResource } from '../../api/resources/shipping.js';
import { TokenStorage } from '../../storage/tokens.js';
import { CreateDestinationParams, CreateUpgradeParams } from '../../api/types.js';

export async function listProfilesHandler(
  args: { shop_id?: number },
  shipping: ShippingResource,
  storage: TokenStorage,
) {
  const shopId = args.shop_id ?? storage.getTokens()?.shop_id;
  if (!shopId) throw new Error('No shop ID. Run set_default_shop.');
  return shipping.list(shopId);
}

export async function createDestinationHandler(
  args: {
    shop_id?: number;
    shipping_profile_id: number;
    primary_cost: number;
    secondary_cost: number;
    destination_country_iso?: string;
    destination_region?: 'eu' | 'non_eu' | 'none';
    min_delivery_days?: number;
    max_delivery_days?: number;
    mail_class?: string;
  },
  shipping: ShippingResource,
  storage: TokenStorage,
) {
  const shopId = args.shop_id ?? storage.getTokens()?.shop_id;
  if (!shopId) throw new Error('No shop ID. Run set_default_shop.');
  const params: CreateDestinationParams = {
    primary_cost: args.primary_cost,
    secondary_cost: args.secondary_cost,
    destination_country_iso: args.destination_country_iso,
    destination_region: args.destination_region,
    min_delivery_days: args.min_delivery_days,
    max_delivery_days: args.max_delivery_days,
    mail_class: args.mail_class,
  };
  return shipping.createDestination(shopId, args.shipping_profile_id, params);
}

function toText(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
}

function errText(msg: string) {
  return { content: [{ type: 'text' as const, text: msg }] };
}

export function registerShippingTools(
  server: McpServer,
  shipping: ShippingResource,
  storage: TokenStorage,
) {
  server.tool(
    'list_shipping_profiles',
    'List all shipping profiles for a shop.',
    { shop_id: z.number().optional() },
    async ({ shop_id }) => {
      try {
        return toText(await listProfilesHandler({ shop_id }, shipping, storage));
      } catch (e: any) {
        return errText(e.message);
      }
    }
  );

  server.tool(
    'create_shipping_profile',
    'Create a new shipping profile. Creates the profile with its first destination in one call.',
    {
      shop_id: z.number().optional(),
      title: z.string().describe('Profile name, e.g. "DS Lite - EU/UK/US"'),
      origin_country_iso: z.string().default('PL').describe('2-letter ISO country code of origin'),
      origin_postal_code: z.string().optional(),
      primary_cost: z.number().default(0).describe('Base shipping cost for one item'),
      secondary_cost: z.number().default(0).describe('Cost for each additional item'),
      destination_country_iso: z.string().optional().describe('e.g. "US". Use destination_region for groups.'),
      destination_region: z.enum(['eu', 'non_eu', 'none']).optional(),
      min_delivery_days: z.number().optional(),
      max_delivery_days: z.number().optional(),
    },
    async ({ shop_id, ...params }) => {
      try {
        const shopId = shop_id ?? storage.getTokens()?.shop_id;
        if (!shopId) return errText('No shop ID. Run set_default_shop.');
        const profile = await shipping.create(shopId, params as any);
        return toText(profile);
      } catch (e: any) {
        return errText(e.message);
      }
    }
  );

  server.tool(
    'update_shipping_profile',
    'Update an existing shipping profile title or processing times.',
    {
      shop_id: z.number().optional(),
      shipping_profile_id: z.number(),
      title: z.string().optional(),
      origin_country_iso: z.string().optional(),
      origin_postal_code: z.string().optional(),
      min_processing_days: z.number().optional(),
      max_processing_days: z.number().optional(),
    },
    async ({ shop_id, shipping_profile_id, ...params }) => {
      try {
        const shopId = shop_id ?? storage.getTokens()?.shop_id;
        if (!shopId) return errText('No shop ID.');
        const profile = await shipping.update(shopId, shipping_profile_id, params);
        return toText(profile);
      } catch (e: any) {
        return errText(e.message);
      }
    }
  );

  server.tool(
    'delete_shipping_profile',
    'Delete a shipping profile by ID.',
    {
      shop_id: z.number().optional(),
      shipping_profile_id: z.number(),
    },
    async ({ shop_id, shipping_profile_id }) => {
      try {
        const shopId = shop_id ?? storage.getTokens()?.shop_id;
        if (!shopId) return errText('No shop ID.');
        await shipping.delete(shopId, shipping_profile_id);
        return toText({ deleted: true, shipping_profile_id });
      } catch (e: any) {
        return errText(e.message);
      }
    }
  );

  server.tool(
    'list_shipping_profile_destinations',
    'List all destinations for a shipping profile.',
    {
      shop_id: z.number().optional(),
      shipping_profile_id: z.number(),
    },
    async ({ shop_id, shipping_profile_id }) => {
      try {
        const shopId = shop_id ?? storage.getTokens()?.shop_id;
        if (!shopId) return errText('No shop ID.');
        return toText(await shipping.listDestinations(shopId, shipping_profile_id));
      } catch (e: any) {
        return errText(e.message);
      }
    }
  );

  server.tool(
    'create_shipping_profile_destination',
    'Add a destination (country or region) to an existing shipping profile.',
    {
      shop_id: z.number().optional(),
      shipping_profile_id: z.number(),
      primary_cost: z.number().describe('Shipping cost for one item (e.g. 18 for €18)'),
      secondary_cost: z.number().default(0),
      destination_country_iso: z.string().optional().describe('e.g. "GB", "US"'),
      destination_region: z.enum(['eu', 'non_eu', 'none']).optional(),
      min_delivery_days: z.number().optional(),
      max_delivery_days: z.number().optional(),
      mail_class: z.string().optional(),
    },
    async (args) => {
      try {
        return toText(await createDestinationHandler(args, shipping, storage));
      } catch (e: any) {
        return errText(e.message);
      }
    }
  );

  server.tool(
    'delete_shipping_profile_destination',
    'Remove a destination from a shipping profile.',
    {
      shop_id: z.number().optional(),
      shipping_profile_id: z.number(),
      shipping_profile_destination_id: z.number(),
    },
    async ({ shop_id, shipping_profile_id, shipping_profile_destination_id }) => {
      try {
        const shopId = shop_id ?? storage.getTokens()?.shop_id;
        if (!shopId) return errText('No shop ID.');
        await shipping.deleteDestination(shopId, shipping_profile_id, shipping_profile_destination_id);
        return toText({ deleted: true, shipping_profile_destination_id });
      } catch (e: any) {
        return errText(e.message);
      }
    }
  );

  server.tool(
    'create_shipping_profile_upgrade',
    'Add a courier upgrade option to a shipping profile.',
    {
      shop_id: z.number().optional(),
      shipping_profile_id: z.number(),
      upgrade_name: z.string().describe('e.g. "Courier to Door"'),
      type: z.enum(['0', '1']).default('0').describe('"0" = shipping upgrade, "1" = handling upgrade'),
      price: z.number().describe('Upgrade cost for one item'),
      secondary_price: z.number().default(0),
      min_delivery_days: z.number().optional(),
      max_delivery_days: z.number().optional(),
      mail_class: z.string().optional(),
    },
    async ({ shop_id, shipping_profile_id, ...params }) => {
      try {
        const shopId = shop_id ?? storage.getTokens()?.shop_id;
        if (!shopId) return errText('No shop ID.');
        return toText(await shipping.createUpgrade(shopId, shipping_profile_id, params as CreateUpgradeParams));
      } catch (e: any) {
        return errText(e.message);
      }
    }
  );

  server.tool(
    'delete_shipping_profile_upgrade',
    'Remove a courier upgrade from a shipping profile.',
    {
      shop_id: z.number().optional(),
      shipping_profile_id: z.number(),
      upgrade_id: z.number(),
    },
    async ({ shop_id, shipping_profile_id, upgrade_id }) => {
      try {
        const shopId = shop_id ?? storage.getTokens()?.shop_id;
        if (!shopId) return errText('No shop ID.');
        await shipping.deleteUpgrade(shopId, shipping_profile_id, upgrade_id);
        return toText({ deleted: true, upgrade_id });
      } catch (e: any) {
        return errText(e.message);
      }
    }
  );
}
