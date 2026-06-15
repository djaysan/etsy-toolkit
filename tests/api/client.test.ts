import axios from 'axios';
import { EtsyApiClient } from '../../src/api/client.js';
import { TokenStorage } from '../../src/storage/tokens.js';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

jest.mock('axios');

describe('EtsyApiClient', () => {
  let storage: TokenStorage;
  let tmpDir: string;
  let mockCreate: jest.Mock;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'etsy-test-'));
    storage = new TokenStorage(tmpDir);

    const mockInstance = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    };
    mockCreate = jest.fn(() => mockInstance);
    (axios.create as jest.Mock) = mockCreate;
  });

  afterEach(() => fs.rmSync(tmpDir, { recursive: true }));

  it('creates axios instance with correct base URL', () => {
    new EtsyApiClient('test-key', storage);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ baseURL: 'https://api.etsy.com/v3' })
    );
  });
});
