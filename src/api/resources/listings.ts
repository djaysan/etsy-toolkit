import { EtsyApiClient } from '../client.js';
import { Listing, ListResponse, CreateListingParams } from '../types.js';

export class ListingsResource {
  constructor(private client: EtsyApiClient) {}

  async getListings(shopId: number, limit = 25, offset = 0): Promise<Listing[]> {
    const res = await this.client.get<ListResponse<Listing>>(
      `/application/shops/${shopId}/listings/active`,
      { limit, offset }
    );
    return res.results;
  }

  async createListing(shopId: number, params: CreateListingParams): Promise<Listing> {
    return this.client.post<Listing>(
      `/application/shops/${shopId}/listings`,
      params
    );
  }
}
