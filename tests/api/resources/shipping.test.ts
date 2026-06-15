import { EtsyApiClient } from '../../../src/api/client.js';
import { ShippingResource } from '../../../src/api/resources/shipping.js';
import { ShippingProfile, ShippingProfileDestination, ShippingProfileUpgrade } from '../../../src/api/types.js';

jest.mock('../../../src/api/client.js');

const mockProfile: ShippingProfile = {
  shipping_profile_id: 1,
  title: 'DS Lite - EU/UK/US',
  user_id: 100,
  origin_country_iso: 'PL',
  origin_postal_code: '04-393',
  profile_type: 'manual',
};

const mockDestination: ShippingProfileDestination = {
  shipping_profile_destination_id: 10,
  shipping_profile_id: 1,
  origin_country_iso: 'PL',
  destination_country_iso: 'GB',
  destination_region: 'none',
  primary_cost: { amount: 1800, divisor: 100, currency_code: 'EUR' },
  secondary_cost: { amount: 0, divisor: 100, currency_code: 'EUR' },
};

const mockUpgrade: ShippingProfileUpgrade = {
  shipping_profile_id: 1,
  upgrade_id: 20,
  upgrade_name: 'Courier to Door',
  type: '0',
  rank: 1,
  language: 'en-GB',
  price: { amount: 1800, divisor: 100, currency_code: 'EUR' },
  secondary_price: { amount: 0, divisor: 100, currency_code: 'EUR' },
};

describe('ShippingResource', () => {
  let client: jest.Mocked<EtsyApiClient>;
  let resource: ShippingResource;

  beforeEach(() => {
    client = new EtsyApiClient(null as any, null as any) as jest.Mocked<EtsyApiClient>;
    resource = new ShippingResource(client);
  });

  describe('profiles', () => {
    it('lists shipping profiles', async () => {
      client.get = jest.fn().mockResolvedValue({ count: 1, results: [mockProfile] });
      const result = await resource.list(42);
      expect(client.get).toHaveBeenCalledWith('/application/shops/42/shipping-profiles', undefined);
      expect(result).toEqual([mockProfile]);
    });

    it('creates a shipping profile', async () => {
      client.post = jest.fn().mockResolvedValue(mockProfile);
      const result = await resource.create(42, {
        title: 'DS Lite - EU/UK/US',
        origin_country_iso: 'PL',
        origin_postal_code: '04-393',
        primary_cost: 0,
        secondary_cost: 0,
        destination_region: 'eu',
      });
      expect(client.post).toHaveBeenCalledWith(
        '/application/shops/42/shipping-profiles',
        expect.objectContaining({ title: 'DS Lite - EU/UK/US' })
      );
      expect(result.shipping_profile_id).toBe(1);
    });

    it('updates a shipping profile', async () => {
      client.put = jest.fn().mockResolvedValue({ ...mockProfile, title: 'Updated' });
      const result = await resource.update(42, 1, { title: 'Updated' });
      expect(client.put).toHaveBeenCalledWith(
        '/application/shops/42/shipping-profiles/1',
        { title: 'Updated' }
      );
      expect(result.title).toBe('Updated');
    });

    it('deletes a shipping profile', async () => {
      client.delete = jest.fn().mockResolvedValue(undefined);
      await resource.delete(42, 1);
      expect(client.delete).toHaveBeenCalledWith('/application/shops/42/shipping-profiles/1');
    });
  });

  describe('destinations', () => {
    it('lists destinations', async () => {
      client.get = jest.fn().mockResolvedValue({ count: 1, results: [mockDestination] });
      const result = await resource.listDestinations(42, 1);
      expect(result).toEqual([mockDestination]);
    });

    it('creates a destination', async () => {
      client.post = jest.fn().mockResolvedValue(mockDestination);
      const result = await resource.createDestination(42, 1, {
        primary_cost: 18,
        secondary_cost: 0,
        destination_country_iso: 'GB',
      });
      expect(client.post).toHaveBeenCalledWith(
        '/application/shops/42/shipping-profiles/1/destinations',
        expect.objectContaining({ destination_country_iso: 'GB' })
      );
      expect(result.shipping_profile_destination_id).toBe(10);
    });

    it('deletes a destination', async () => {
      client.delete = jest.fn().mockResolvedValue(undefined);
      await resource.deleteDestination(42, 1, 10);
      expect(client.delete).toHaveBeenCalledWith(
        '/application/shops/42/shipping-profiles/1/destinations/10'
      );
    });
  });

  describe('upgrades', () => {
    it('lists upgrades', async () => {
      client.get = jest.fn().mockResolvedValue({ count: 1, results: [mockUpgrade] });
      const result = await resource.listUpgrades(42, 1);
      expect(result).toEqual([mockUpgrade]);
    });

    it('creates an upgrade', async () => {
      client.post = jest.fn().mockResolvedValue(mockUpgrade);
      const result = await resource.createUpgrade(42, 1, {
        upgrade_name: 'Courier to Door',
        type: '0',
        price: 18,
        secondary_price: 0,
      });
      expect(client.post).toHaveBeenCalledWith(
        '/application/shops/42/shipping-profiles/1/upgrades',
        expect.objectContaining({ upgrade_name: 'Courier to Door' })
      );
      expect(result.upgrade_id).toBe(20);
    });

    it('deletes an upgrade', async () => {
      client.delete = jest.fn().mockResolvedValue(undefined);
      await resource.deleteUpgrade(42, 1, 20);
      expect(client.delete).toHaveBeenCalledWith(
        '/application/shops/42/shipping-profiles/1/upgrades/20'
      );
    });
  });
});
