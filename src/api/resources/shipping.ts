import { EtsyApiClient } from '../client.js';
import {
  ShippingProfile,
  ShippingProfileDestination,
  ShippingProfileUpgrade,
  ListResponse,
  CreateShippingProfileParams,
  UpdateShippingProfileParams,
  CreateDestinationParams,
  CreateUpgradeParams,
} from '../types.js';

export class ShippingResource {
  constructor(private client: EtsyApiClient) {}

  // ---- Profiles ----

  /** List all shipping profiles for a shop. */
  async list(shopId: number): Promise<ShippingProfile[]> {
    const res = await this.client.get<ListResponse<ShippingProfile>>(
      `/application/shops/${shopId}/shipping-profiles`,
      undefined
    );
    return res.results;
  }

  /** Create a new shipping profile for a shop. */
  async create(shopId: number, params: CreateShippingProfileParams): Promise<ShippingProfile> {
    return this.client.post<ShippingProfile>(
      `/application/shops/${shopId}/shipping-profiles`,
      params
    );
  }

  /** Update an existing shipping profile. */
  async update(shopId: number, profileId: number, params: UpdateShippingProfileParams): Promise<ShippingProfile> {
    return this.client.put<ShippingProfile>(
      `/application/shops/${shopId}/shipping-profiles/${profileId}`,
      params
    );
  }

  /** Delete a shipping profile. */
  async delete(shopId: number, profileId: number): Promise<void> {
    return this.client.delete(
      `/application/shops/${shopId}/shipping-profiles/${profileId}`
    );
  }

  // ---- Destinations ----

  /** List all destinations for a shipping profile. */
  async listDestinations(shopId: number, profileId: number): Promise<ShippingProfileDestination[]> {
    const res = await this.client.get<ListResponse<ShippingProfileDestination>>(
      `/application/shops/${shopId}/shipping-profiles/${profileId}/destinations`
    );
    return res.results;
  }

  /** Create a new destination entry on a shipping profile. */
  async createDestination(shopId: number, profileId: number, params: CreateDestinationParams): Promise<ShippingProfileDestination> {
    return this.client.post<ShippingProfileDestination>(
      `/application/shops/${shopId}/shipping-profiles/${profileId}/destinations`,
      params
    );
  }

  /** Delete a destination from a shipping profile. */
  async deleteDestination(shopId: number, profileId: number, destinationId: number): Promise<void> {
    return this.client.delete(
      `/application/shops/${shopId}/shipping-profiles/${profileId}/destinations/${destinationId}`
    );
  }

  // ---- Upgrades ----

  /** List all shipping upgrades for a profile (e.g. express options). */
  async listUpgrades(shopId: number, profileId: number): Promise<ShippingProfileUpgrade[]> {
    const res = await this.client.get<ListResponse<ShippingProfileUpgrade>>(
      `/application/shops/${shopId}/shipping-profiles/${profileId}/upgrades`
    );
    return res.results;
  }

  /** Create a new shipping upgrade on a profile. */
  async createUpgrade(shopId: number, profileId: number, params: CreateUpgradeParams): Promise<ShippingProfileUpgrade> {
    return this.client.post<ShippingProfileUpgrade>(
      `/application/shops/${shopId}/shipping-profiles/${profileId}/upgrades`,
      params
    );
  }

  /** Delete a shipping upgrade from a profile. */
  async deleteUpgrade(shopId: number, profileId: number, upgradeId: number): Promise<void> {
    return this.client.delete(
      `/application/shops/${shopId}/shipping-profiles/${profileId}/upgrades/${upgradeId}`
    );
  }
}
