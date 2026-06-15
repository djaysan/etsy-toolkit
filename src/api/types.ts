// ---- Generic ----

export interface ListResponse<T> {
  count: number;
  results: T[];
}

// ---- OAuth ----

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user_id: number;
}

// ---- Shop ----

export interface Shop {
  shop_id: number;
  shop_name: string;
  user_id: number;
  title: string;
  currency_code: string;
  is_vacation: boolean;
  listing_active_count: number;
}

// ---- Listing ----

export interface Money {
  amount: number;
  divisor: number;
  currency_code: string;
}

export interface Listing {
  listing_id: number;
  shop_id: number;
  title: string;
  description: string;
  state: 'active' | 'inactive' | 'sold_out' | 'draft' | 'expired';
  price: Money;
  quantity: number;
  taxonomy_id: number;
  shipping_profile_id?: number;
  url: string;
}

export interface CreateListingParams {
  quantity: number;
  title: string;
  description: string;
  price: number;
  who_made: 'i_did' | 'someone_else' | 'collective';
  when_made: string;
  taxonomy_id: number;
  shipping_profile_id?: number;
  type?: 'physical' | 'digital' | 'download';
}

// ---- Shipping Profile ----

export type DestinationRegion = 'eu' | 'non_eu' | 'none';

export interface ShippingProfile {
  shipping_profile_id: number;
  title: string;
  user_id: number;
  min_processing_days?: number;
  max_processing_days?: number;
  processing_days_display_label?: string;
  origin_country_iso: string;
  origin_postal_code?: string;
  profile_type: 'manual' | 'calculated';
  domestic_handling_fee?: number;
  international_handling_fee?: number;
}

export interface ShippingProfileDestination {
  shipping_profile_destination_id: number;
  shipping_profile_id: number;
  origin_country_iso: string;
  destination_country_iso: string;
  destination_region: DestinationRegion;
  primary_cost: Money;
  secondary_cost: Money;
  mail_class?: string;
  min_delivery_days?: number;
  max_delivery_days?: number;
}

export interface ShippingProfileUpgrade {
  shipping_profile_id: number;
  upgrade_id: number;
  upgrade_name: string;
  type: '0' | '1';
  rank: number;
  language: string;
  price: Money;
  secondary_price: Money;
  mail_class?: string;
  min_delivery_days?: number;
  max_delivery_days?: number;
}

// ---- Request Params ----

export interface CreateShippingProfileParams {
  title: string;
  origin_country_iso: string;
  origin_postal_code?: string;
  primary_cost: number;
  secondary_cost: number;
  destination_country_iso?: string;
  destination_region?: DestinationRegion;
  min_delivery_days?: number;
  max_delivery_days?: number;
  mail_class?: string;
}

export interface UpdateShippingProfileParams {
  title?: string;
  origin_country_iso?: string;
  origin_postal_code?: string;
  min_processing_days?: number;
  max_processing_days?: number;
}

export interface CreateDestinationParams {
  primary_cost: number;
  secondary_cost: number;
  destination_country_iso?: string;
  destination_region?: DestinationRegion;
  min_delivery_days?: number;
  max_delivery_days?: number;
  mail_class?: string;
}

export interface CreateUpgradeParams {
  upgrade_name: string;
  type: '0' | '1';
  price: number;
  secondary_price: number;
  mail_class?: string;
  min_delivery_days?: number;
  max_delivery_days?: number;
}
