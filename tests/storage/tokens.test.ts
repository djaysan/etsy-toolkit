import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { TokenStorage } from '../../src/storage/tokens.js';

describe('TokenStorage', () => {
  let storage: TokenStorage;
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'etsy-test-'));
    storage = new TokenStorage(tmpDir);
  });

  afterEach(() => fs.rmSync(tmpDir, { recursive: true }));

  it('returns null when no tokens saved', () => {
    expect(storage.getTokens()).toBeNull();
  });

  it('saves and retrieves tokens', () => {
    storage.saveTokens({ access_token: 'tok_abc', refresh_token: 'ref_xyz', expires_in: 3600 });
    const tokens = storage.getTokens();
    expect(tokens?.access_token).toBe('tok_abc');
    expect(tokens?.refresh_token).toBe('ref_xyz');
  });

  it('returns null for expired tokens', () => {
    storage.saveTokens({ access_token: 'tok_abc', expires_in: -1 });
    expect(storage.getTokens()).toBeNull();
  });

  it('loadPotentiallyExpiredTokens returns expired tokens', () => {
    storage.saveTokens({ access_token: 'tok_abc', expires_in: -1 });
    expect(storage.loadPotentiallyExpiredTokens()?.access_token).toBe('tok_abc');
  });

  it('clears tokens', () => {
    storage.saveTokens({ access_token: 'tok_abc', expires_in: 3600 });
    storage.clearTokens();
    expect(storage.getTokens()).toBeNull();
  });

  it('hasValidToken returns false when no token', () => {
    expect(storage.hasValidToken()).toBe(false);
  });

  it('hasValidToken returns true when valid token exists', () => {
    storage.saveTokens({ access_token: 'tok_abc', expires_in: 3600 });
    expect(storage.hasValidToken()).toBe(true);
  });
});
