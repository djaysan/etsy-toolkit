import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { TokenStorage } from '../storage/tokens.js';
import { logger } from '../utils/logger.js';

const BASE_URL = 'https://api.etsy.com/v3';

// Optional function to exchange a refresh token for a new access token
type RefreshFn = (refreshToken: string) => Promise<{ access_token: string; expires_in: number }>;

export class EtsyApiClient {
  private http: AxiosInstance;

  constructor(
    private apiKey: string,
    private storage: TokenStorage,
    private refreshFn?: RefreshFn,
    private sharedSecret?: string,
  ) {
    // Create the axios instance pointing at the Etsy v3 base URL
    this.http = axios.create({ baseURL: BASE_URL });

    // Request interceptor: attach Bearer token + API key to every outgoing request
    // Etsy requires x-api-key to be "keystring:shared_secret" for authenticated endpoints
    this.http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      const tokens = this.storage.getTokens();
      if (tokens?.access_token) {
        config.headers['Authorization'] = `Bearer ${tokens.access_token}`;
      }
      config.headers['x-api-key'] = this.sharedSecret
        ? `${this.apiKey}:${this.sharedSecret}`
        : this.apiKey;
      return config;
    });

    // Response interceptor: on 401, attempt a silent token refresh and retry once
    this.http.interceptors.response.use(
      (res) => res,
      async (error: AxiosError) => {
        if (error.response?.status === 401 && this.refreshFn) {
          const stale = this.storage.loadPotentiallyExpiredTokens();
          if (stale?.refresh_token) {
            try {
              logger.log('Refreshing access token...');
              const fresh = await this.refreshFn(stale.refresh_token);
              // Persist updated tokens so future requests use the new one
              this.storage.saveTokens({ ...stale, ...fresh });
              const config = error.config!;
              config.headers['Authorization'] = `Bearer ${fresh.access_token}`;
              return this.http.request(config);
            } catch (refreshError) {
              logger.error('Token refresh failed:', refreshError);
            }
          }
        }
        throw error;
      }
    );
  }

  // GET request — returns typed response data
  async get<T>(path: string, params?: Record<string, unknown>): Promise<T> {
    const res = await this.http.get<T>(path, { params });
    return res.data;
  }

  // POST request — sends JSON body, returns typed response data
  async post<T>(path: string, body: unknown): Promise<T> {
    const res = await this.http.post<T>(path, body);
    return res.data;
  }

  // PUT request — sends JSON body, returns typed response data
  async put<T>(path: string, body: unknown): Promise<T> {
    const res = await this.http.put<T>(path, body);
    return res.data;
  }

  // DELETE request — no response body expected
  async delete(path: string): Promise<void> {
    await this.http.delete(path);
  }
}
