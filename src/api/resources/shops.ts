import { EtsyApiClient } from '../client.js';
import { Shop, ListResponse } from '../types.js';

export class ShopsResource {
  constructor(private client: EtsyApiClient) {}

  async getShop(shopId: number): Promise<Shop> {
    return this.client.get<Shop>(`/application/shops/${shopId}`);
  }

  async getUserShops(userId: number): Promise<Shop[]> {
    // Etsy returns a single Shop object for this endpoint, not a list
    const shop = await this.client.get<Shop>(`/application/users/${userId}/shops`);
    return [shop];
  }
}
