import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

interface TokenData {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  user_id?: number;
  shop_id?: number;
  shop_name?: string;
}

export class TokenStorage {
  private filePath: string;

  constructor(storageDir?: string) {
    const dir = storageDir ?? path.join(os.homedir(), '.etsy-toolkit');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { mode: 0o700, recursive: true });
    }
    this.filePath = path.join(dir, 'tokens.json');
  }

  saveTokens(tokens: TokenData & { expires_in?: number }): void {
    const expires_at = tokens.expires_in != null
      ? Date.now() + tokens.expires_in * 1000
      : (tokens.expires_at ?? Date.now() + 3600 * 1000);

    const data: TokenData = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      user_id: tokens.user_id,
      shop_id: tokens.shop_id,
      shop_name: tokens.shop_name,
      expires_at,
    };

    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), { mode: 0o600 });
  }

  getTokens(): TokenData | null {
    const data = this.loadPotentiallyExpiredTokens();
    if (!data) return null;
    if (data.expires_at && data.expires_at < Date.now()) return null;
    return data;
  }

  loadPotentiallyExpiredTokens(): TokenData | null {
    if (!fs.existsSync(this.filePath)) return null;
    try {
      return JSON.parse(fs.readFileSync(this.filePath, 'utf8')) as TokenData;
    } catch {
      return null;
    }
  }

  clearTokens(): void {
    if (fs.existsSync(this.filePath)) fs.unlinkSync(this.filePath);
  }

  hasValidToken(): boolean {
    return this.getTokens()?.access_token != null;
  }
}
