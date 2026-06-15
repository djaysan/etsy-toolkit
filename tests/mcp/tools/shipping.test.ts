import { ShippingResource } from '../../../src/api/resources/shipping.js';
import { TokenStorage } from '../../../src/storage/tokens.js';

jest.mock('../../../src/api/resources/shipping.js');
jest.mock('../../../src/storage/tokens.js');

describe('shipping tool handlers', () => {
  let shipping: jest.Mocked<ShippingResource>;
  let storage: jest.Mocked<TokenStorage>;

  beforeEach(() => {
    shipping = new ShippingResource(null as any) as jest.Mocked<ShippingResource>;
    storage = new TokenStorage() as jest.Mocked<TokenStorage>;
    storage.getTokens = jest.fn().mockReturnValue({ shop_id: 42 });
  });

  it('list profiles delegates to shipping.list with resolved shop id', async () => {
    shipping.list = jest.fn().mockResolvedValue([]);
    const { listProfilesHandler } = await import('../../../src/mcp/tools/shipping.js');
    await listProfilesHandler({ shop_id: undefined }, shipping, storage);
    expect(shipping.list).toHaveBeenCalledWith(42);
  });

  it('create destination delegates correctly', async () => {
    shipping.createDestination = jest.fn().mockResolvedValue({});
    const { createDestinationHandler } = await import('../../../src/mcp/tools/shipping.js');
    await createDestinationHandler(
      { shop_id: undefined, shipping_profile_id: 1, primary_cost: 18, secondary_cost: 0, destination_country_iso: 'GB' },
      shipping,
      storage
    );
    expect(shipping.createDestination).toHaveBeenCalledWith(42, 1, {
      primary_cost: 18,
      secondary_cost: 0,
      destination_country_iso: 'GB',
    });
  });
});
