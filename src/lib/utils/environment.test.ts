import { describe, it, expect, afterEach } from 'vitest';
import { isTauri } from './environment';

/** Narrow shape for toggling the Tauri internals marker on `window` in tests. */
type TauriWindow = { __TAURI_INTERNALS__?: unknown };

describe('environment', () => {
  afterEach(() => {
    // 清理測試期間注入的 Tauri 標記,避免影響其他測試
    delete (window as unknown as TauriWindow).__TAURI_INTERNALS__;
  });

  describe('isTauri', () => {
    it('應該在 window.__TAURI_INTERNALS__ 存在時回傳 true', () => {
      // Arrange - 模擬 Tauri runtime 已注入 internals
      (window as unknown as TauriWindow).__TAURI_INTERNALS__ = {
        invoke: () => {},
      };

      // Act
      const result = isTauri();

      // Assert
      expect(result).toBe(true);
    });

    it('應該在 window.__TAURI_INTERNALS__ 不存在時回傳 false', () => {
      // Arrange - 確保未注入 (純瀏覽器環境)
      delete (window as unknown as TauriWindow).__TAURI_INTERNALS__;

      // Act
      const result = isTauri();

      // Assert
      expect(result).toBe(false);
    });
  });
});
