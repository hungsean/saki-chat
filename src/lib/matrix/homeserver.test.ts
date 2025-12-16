import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  normalizeHomeserverUrl,
  verifyHomeserver,
  extractHomeserverDomain,
} from './homeserver';

describe('normalizeHomeserverUrl', () => {
  it('應該為沒有 protocol 的 URL 加上 https://', () => {
    const result = normalizeHomeserverUrl('matrix.org');
    expect(result).toBe('https://matrix.org');
  });

  it('應該保留已有 https:// protocol 的 URL', () => {
    const result = normalizeHomeserverUrl('https://matrix.org');
    expect(result).toBe('https://matrix.org');
  });

  it('應該保留已有 http:// protocol 的 URL', () => {
    const result = normalizeHomeserverUrl('http://localhost:8008');
    expect(result).toBe('http://localhost:8008');
  });

  it('應該去除前後空白', () => {
    const result = normalizeHomeserverUrl('  matrix.org  ');
    expect(result).toBe('https://matrix.org');
  });

  it('應該處理帶有 port 的 URL', () => {
    const result = normalizeHomeserverUrl('matrix.org:8448');
    expect(result).toBe('https://matrix.org:8448');
  });
});

describe('extractHomeserverDomain', () => {
  it('應該從 https:// URL 提取 domain', () => {
    const result = extractHomeserverDomain('https://matrix.org');
    expect(result).toBe('matrix.org');
  });

  it('應該從 http:// URL 提取 domain', () => {
    const result = extractHomeserverDomain('http://localhost:8008');
    expect(result).toBe('localhost:8008');
  });

  it('應該處理沒有 protocol 的 URL', () => {
    const result = extractHomeserverDomain('matrix.org');
    expect(result).toBe('matrix.org');
  });

  it('應該保留 port number', () => {
    const result = extractHomeserverDomain('https://matrix.org:8448');
    expect(result).toBe('matrix.org:8448');
  });
});

describe('verifyHomeserver', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = mockFetch;
  });

  it('應該成功驗證有效的 homeserver', async () => {
    const mockResponse = {
      'm.homeserver': {
        base_url: 'https://matrix-client.matrix.org',
      },
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await verifyHomeserver('matrix.org');

    expect(result).toEqual({
      isValid: true,
      baseUrl: 'https://matrix-client.matrix.org',
      normalizedUrl: 'https://matrix.org',
    });

    expect(mockFetch).toHaveBeenCalledWith(
      'https://matrix.org/.well-known/matrix/client'
    );
  });

  it('應該處理連線失敗的情況', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
    });

    const result = await verifyHomeserver('invalid-server.com');

    expect(result).toEqual({
      isValid: false,
      normalizedUrl: 'https://invalid-server.com',
      error: 'Cannot connect to homeserver',
    });
  });

  it('應該處理無效的回應格式', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({}), // 沒有 m.homeserver
    });

    const result = await verifyHomeserver('matrix.org');

    expect(result).toEqual({
      isValid: false,
      normalizedUrl: 'https://matrix.org',
      error: 'Invalid homeserver response',
    });
  });

  it('應該處理 fetch 錯誤', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const result = await verifyHomeserver('matrix.org');

    expect(result).toEqual({
      isValid: false,
      normalizedUrl: 'https://matrix.org',
      error: 'Network error',
    });
  });

  it('應該處理非 Error 物件的例外', async () => {
    mockFetch.mockRejectedValue('Unknown error');

    const result = await verifyHomeserver('matrix.org');

    expect(result).toEqual({
      isValid: false,
      normalizedUrl: 'https://matrix.org',
      error: 'Verification failed',
    });
  });

  it('應該正確處理需要標準化的 URL', async () => {
    const mockResponse = {
      'm.homeserver': {
        base_url: 'https://matrix-client.matrix.org',
      },
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await verifyHomeserver('matrix.org'); // 沒有 https://

    expect(result.normalizedUrl).toBe('https://matrix.org');
    expect(mockFetch).toHaveBeenCalledWith(
      'https://matrix.org/.well-known/matrix/client'
    );
  });
});
