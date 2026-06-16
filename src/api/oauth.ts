import crypto from 'crypto';
import express from 'express';
import { Server } from 'http';
import axios from 'axios';
import { TokenStorage } from '../storage/tokens.js';
import { TokenResponse } from './types.js';
import { logger } from '../utils/logger.js';

const OAUTH_BASE = 'https://www.etsy.com/oauth/connect';
const TOKEN_URL = 'https://api.etsy.com/v3/public/oauth/token';

const SCOPES = [
  'listings_r',
  'listings_w',
  'shops_r',
  'shops_w',
  'profile_r',
  'address_r',
  'email_r',
  'transactions_r',
].join(' ');

interface StateEntry {
  codeVerifier: string;
  createdAt: number;
}

export class OAuthClient {
  private stateStore = new Map<string, StateEntry>();
  private server: Server | null = null;

  constructor(
    private apiKey: string,
    private redirectUri: string,
    private storage: TokenStorage,
    private port: number = 3003,
  ) {}

  generatePKCE(): { codeVerifier: string; codeChallenge: string } {
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    const codeChallenge = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');
    return { codeVerifier, codeChallenge };
  }

  getAuthorizationUrl(state: string, codeChallenge: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.apiKey,
      redirect_uri: this.redirectUri,
      scope: SCOPES,
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });
    return `${OAUTH_BASE}?${params.toString()}`;
  }

  async startCallbackServer(): Promise<string> {
    return new Promise((resolve, reject) => {
      const app = express();

      app.get('/auth', (_req, res) => {
        const state = crypto.randomBytes(16).toString('hex');
        const { codeVerifier, codeChallenge } = this.generatePKCE();
        this.stateStore.set(state, { codeVerifier, createdAt: Date.now() });
        const url = this.getAuthorizationUrl(state, codeChallenge);
        logger.log('Redirecting to Etsy OAuth:', url);
        res.redirect(url);
      });

      app.get('/oauth/callback', async (req, res) => {
        const { code, state, error } = req.query;

        if (error) {
          res.status(400).send(`<h1>Auth Error: ${error}</h1>`);
          this.stopCallbackServer();
          return reject(new Error(`OAuth error: ${error}`));
        }

        const entry = this.stateStore.get(state as string);
        if (!entry) {
          res.status(400).send('<h1>Invalid state</h1>');
          return reject(new Error('Invalid OAuth state'));
        }

        this.stateStore.delete(state as string);

        try {
          const tokens = await this.exchangeCode(code as string, entry.codeVerifier);
          this.storage.saveTokens(tokens);
          res.send('<h1>Authenticated! You can close this window.</h1><script>setTimeout(()=>window.close(),2000)</script>');
          this.stopCallbackServer();
          resolve(tokens.access_token);
        } catch (err) {
          res.status(500).send('<h1>Token exchange failed</h1>');
          this.stopCallbackServer();
          reject(err);
        }
      });

      this.server = app.listen(this.port, 'localhost', () => {
        logger.log(`OAuth server listening on localhost:${this.port}`);
      });

      this.server.on('error', reject);
    });
  }

  async exchangeCode(code: string, codeVerifier: string): Promise<TokenResponse> {
    const res = await axios.post<TokenResponse>(TOKEN_URL, {
      grant_type: 'authorization_code',
      client_id: this.apiKey,
      redirect_uri: this.redirectUri,
      code,
      code_verifier: codeVerifier,
    });
    const data = res.data;
    // Etsy sometimes omits user_id from the token response; it's always the numeric prefix of the access_token
    if (!data.user_id) {
      const match = data.access_token.match(/^(\d+)\./);
      if (match) data.user_id = parseInt(match[1], 10);
    }
    return data;
  }

  async refreshToken(refreshToken: string): Promise<Pick<TokenResponse, 'access_token' | 'expires_in'>> {
    const res = await axios.post<TokenResponse>(TOKEN_URL, {
      grant_type: 'refresh_token',
      client_id: this.apiKey,
      refresh_token: refreshToken,
    });
    return { access_token: res.data.access_token, expires_in: res.data.expires_in };
  }

  stopCallbackServer(): void {
    this.server?.close();
    this.server = null;
  }

  getAuthInitiationUrl(): string {
    return `http://localhost:${this.port}/auth`;
  }
}
