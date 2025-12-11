# 測試指南 (TESTING.md)

本文件提供 Saki Chat 專案的測試撰寫規範、Mock 策略及測試範例。

---

## 目錄

- [測試架構](#測試架構)
- [測試撰寫規範](#測試撰寫規範)
- [Mock 策略](#mock-策略)
- [測試範例](#測試範例)
- [常見問題](#常見問題)

---

## 測試架構

### 技術棧

- **測試框架**: Vitest 4.x
- **測試工具**: React Testing Library 16.x
- **測試環境**: jsdom
- **覆蓋率**: V8 provider

### 測試指令

```bash
pnpm test              # 測試(監看模式)
pnpm test:ui           # 測試 UI 介面
pnpm test:run          # 執行一次測試
pnpm test:coverage     # 生成覆蓋率報告
```

### 覆蓋率目標

- **Lines**: 70%
- **Functions**: 70%
- **Branches**: 70%
- **Statements**: 70%

### 測試排除

以下檔案不計入覆蓋率:

- `node_modules/`
- `src/test/`
- `src/components/ui/**` (shadcn/ui 元件)
- `**/*.d.ts`
- `**/*.config.*`
- `**/mockData`
- `**/test/**`

---

## 測試撰寫規範

### 檔案命名

- 測試檔案命名: `*.test.ts` 或 `*.test.tsx`
- 測試檔案位置: 與被測試檔案同目錄
- Mock 檔案位置: `src/test/mocks/`

### 測試結構

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@/test/utils/testUtils';

describe('元件或功能名稱', () => {
  beforeEach(() => {
    // 每個測試前的設定
  });

  afterEach(() => {
    // 每個測試後的清理
    vi.clearAllMocks();
  });

  it('應該要做什麼事情', () => {
    // Arrange - 準備
    const props = { /* ... */ };

    // Act - 執行
    render(<Component {...props} />);

    // Assert - 驗證
    expect(screen.getByText('預期文字')).toBeInTheDocument();
  });
});
```

### 命名規範

- **describe**: 描述測試對象 (元件名稱、功能模組)
- **it**: 描述測試案例 (應該要做什麼)
- 使用中文描述,清楚表達測試意圖

### AAA 模式

每個測試遵循 AAA 模式:

1. **Arrange (準備)**: 設定測試資料和環境
2. **Act (執行)**: 執行被測試的行為
3. **Assert (驗證)**: 驗證結果是否符合預期

---

## Mock 策略

### 1. Tauri API Mock

```typescript
// src/test/mocks/tauri.ts
import { vi } from 'vitest';

export const mockTauriStore = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
};

export const mockTauriInvoke = vi.fn();

vi.mock('@tauri-apps/api/core', () => ({
  invoke: mockTauriInvoke,
}));

vi.mock('@tauri-apps/plugin-store', () => ({
  Store: vi.fn(() => mockTauriStore),
}));
```

**使用範例**:

```typescript
import { mockTauriStore } from '@/test/mocks/tauri';

it('應該儲存設定', async () => {
  mockTauriStore.set.mockResolvedValue(undefined);

  await saveSettings({ theme: 'dark' });

  expect(mockTauriStore.set).toHaveBeenCalledWith(
    'settings',
    { theme: 'dark' }
  );
});
```

### 2. Matrix SDK Mock

```typescript
// src/test/mocks/matrix.ts
import { vi } from 'vitest';

export const mockMatrixClient = {
  login: vi.fn(),
  startClient: vi.fn(),
  stopClient: vi.fn(),
  getRoom: vi.fn(),
  sendMessage: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
};

vi.mock('matrix-js-sdk', () => ({
  createClient: vi.fn(() => mockMatrixClient),
  RoomEvent: {
    Timeline: 'Room.timeline',
    Name: 'Room.name',
  },
}));
```

**使用範例**:

```typescript
import { mockMatrixClient } from '@/test/mocks/matrix';

it('應該登入成功', async () => {
  mockMatrixClient.login.mockResolvedValue({
    user_id: '@user:matrix.org',
    access_token: 'token123',
  });

  const result = await login('user', 'pass');

  expect(result.user_id).toBe('@user:matrix.org');
});
```

### 3. IndexedDB Mock

```typescript
// src/test/mocks/indexedDB.ts
import { vi } from 'vitest';

export const mockIDB = {
  openDB: vi.fn(),
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
  clear: vi.fn(),
};

vi.mock('idb', () => mockIDB);
```

### 4. Zustand Store Mock

```typescript
// src/test/mocks/stores.ts
import { vi } from 'vitest';

export const mockAuthStore = {
  isAuthenticated: false,
  user: null,
  login: vi.fn(),
  logout: vi.fn(),
};

vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn((selector) =>
    selector ? selector(mockAuthStore) : mockAuthStore
  ),
}));
```

**使用範例**:

```typescript
import { mockAuthStore } from '@/test/mocks/stores';

it('應該顯示使用者名稱', () => {
  mockAuthStore.isAuthenticated = true;
  mockAuthStore.user = { id: '1', name: 'Test User' };

  render(<UserProfile />);

  expect(screen.getByText('Test User')).toBeInTheDocument();
});
```

### 5. React Router Mock

```typescript
// 在 testUtils.tsx 已經包含 BrowserRouter
import { render } from '@/test/utils/testUtils';

// 測試導航
import { useNavigate } from 'react-router-dom';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});
```

---

## 測試範例

### 1. React 元件測試

```typescript
// src/components/chat/ChatMessage.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils/testUtils';
import ChatMessage from './ChatMessage';

describe('ChatMessage', () => {
  it('應該顯示訊息內容', () => {
    const message = {
      id: '1',
      sender: 'Alice',
      content: 'Hello World',
      timestamp: new Date(),
    };

    render(<ChatMessage message={message} />);

    expect(screen.getByText('Hello World')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('應該套用正確的樣式到自己的訊息', () => {
    const message = {
      id: '1',
      sender: '@me:matrix.org',
      content: 'My message',
      timestamp: new Date(),
    };

    render(<ChatMessage message={message} isMine={true} />);

    const messageEl = screen.getByTestId('chat-message');
    expect(messageEl).toHaveClass('self-end');
  });
});
```

### 2. Hook 測試

```typescript
// src/hooks/useMatrix.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useMatrix } from './useMatrix';
import { mockMatrixClient } from '@/test/mocks/matrix';

describe('useMatrix', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('應該登入並啟動客戶端', async () => {
    mockMatrixClient.login.mockResolvedValue({
      user_id: '@user:matrix.org',
      access_token: 'token',
    });
    mockMatrixClient.startClient.mockResolvedValue(undefined);

    const { result } = renderHook(() => useMatrix());

    await result.current.login('user', 'pass', 'https://matrix.org');

    await waitFor(() => {
      expect(mockMatrixClient.login).toHaveBeenCalled();
      expect(mockMatrixClient.startClient).toHaveBeenCalled();
    });
  });
});
```

### 3. Store 測試

```typescript
// src/stores/chatStore.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useChatStore } from './chatStore';

describe('chatStore', () => {
  beforeEach(() => {
    // 重置 store
    useChatStore.setState({
      messages: [],
      currentRoomId: null,
    });
  });

  it('應該設定當前房間', () => {
    const { setCurrentRoom } = useChatStore.getState();

    setCurrentRoom('!room:matrix.org');

    expect(useChatStore.getState().currentRoomId).toBe('!room:matrix.org');
  });

  it('應該新增訊息', () => {
    const { addMessage } = useChatStore.getState();
    const message = {
      id: '1',
      content: 'Test',
      sender: '@user:matrix.org',
      timestamp: new Date(),
    };

    addMessage(message);

    expect(useChatStore.getState().messages).toHaveLength(1);
    expect(useChatStore.getState().messages[0]).toEqual(message);
  });
});
```

### 4. 非同步操作測試

```typescript
// src/lib/matrix/client.test.ts
import { describe, it, expect, vi } from 'vitest';
import { waitFor } from '@testing-library/react';
import { MatrixClientManager } from './client';
import { mockMatrixClient } from '@/test/mocks/matrix';

describe('MatrixClientManager', () => {
  it('應該處理登入錯誤', async () => {
    mockMatrixClient.login.mockRejectedValue(
      new Error('Invalid credentials')
    );

    const manager = new MatrixClientManager();

    await expect(
      manager.login('user', 'wrong', 'https://matrix.org')
    ).rejects.toThrow('Invalid credentials');
  });

  it('應該監聽時間軸事件', async () => {
    const eventCallback = vi.fn();
    mockMatrixClient.on.mockImplementation((event, callback) => {
      if (event === 'Room.timeline') {
        callback(); // 觸發事件
      }
    });

    const manager = new MatrixClientManager();
    manager.on('Room.timeline', eventCallback);

    await waitFor(() => {
      expect(eventCallback).toHaveBeenCalled();
    });
  });
});
```

### 5. 使用者互動測試

```typescript
// src/components/auth/LoginForm.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/utils/testUtils';
import userEvent from '@testing-library/user-event';
import LoginForm from './LoginForm';

describe('LoginForm', () => {
  it('應該提交登入表單', async () => {
    const user = userEvent.setup();
    const mockLogin = vi.fn();

    render(<LoginForm onLogin={mockLogin} />);

    // 填寫表單
    await user.type(screen.getByLabelText('使用者名稱'), 'testuser');
    await user.type(screen.getByLabelText('密碼'), 'password123');
    await user.type(
      screen.getByLabelText('伺服器'),
      'https://matrix.org'
    );

    // 提交
    await user.click(screen.getByRole('button', { name: '登入' }));

    expect(mockLogin).toHaveBeenCalledWith({
      username: 'testuser',
      password: 'password123',
      homeserver: 'https://matrix.org',
    });
  });

  it('應該顯示驗證錯誤', async () => {
    const user = userEvent.setup();

    render(<LoginForm onLogin={vi.fn()} />);

    // 不填寫就提交
    await user.click(screen.getByRole('button', { name: '登入' }));

    expect(screen.getByText('請輸入使用者名稱')).toBeInTheDocument();
  });
});
```

---

## 常見問題

### Q: 如何測試包含 Tauri API 的元件?

使用 `src/test/mocks/tauri.ts` 提供的 mock:

```typescript
import { mockTauriStore } from '@/test/mocks/tauri';

it('測試案例', async () => {
  mockTauriStore.get.mockResolvedValue({ theme: 'dark' });
  // ... 測試邏輯
});
```

### Q: 如何測試 Zustand store?

直接測試 store 的 actions:

```typescript
import { useMyStore } from '@/stores/myStore';

it('應該更新狀態', () => {
  const { myAction } = useMyStore.getState();

  myAction('value');

  expect(useMyStore.getState().myState).toBe('value');
});
```

### Q: 如何測試需要 Router 的元件?

使用 `testUtils.tsx` 提供的 `render` 函式,已包含 `BrowserRouter`:

```typescript
import { render } from '@/test/utils/testUtils';

it('測試案例', () => {
  render(<MyComponent />);
  // Router 已自動包含
});
```

### Q: 如何測試非同步資料載入?

使用 `waitFor` 等待非同步操作完成:

```typescript
import { waitFor } from '@testing-library/react';

it('應該載入資料', async () => {
  render(<MyComponent />);

  await waitFor(() => {
    expect(screen.getByText('資料已載入')).toBeInTheDocument();
  });
});
```

### Q: 如何測試錯誤處理?

Mock API 回傳錯誤:

```typescript
it('應該顯示錯誤訊息', async () => {
  mockApiCall.mockRejectedValue(new Error('API Error'));

  render(<MyComponent />);

  await waitFor(() => {
    expect(screen.getByText('發生錯誤')).toBeInTheDocument();
  });
});
```

---

## 最佳實務

### 1. 測試重點

- 測試使用者行為,而非實作細節
- 優先測試關鍵功能路徑
- 測試邊界條件和錯誤處理
- 保持測試簡單且易讀

### 2. 避免事項

- 不要測試第三方函式庫
- 不要測試實作細節 (如 state 變數名稱)
- 不要過度 mock (保持測試真實性)
- 不要寫過於複雜的測試

### 3. 效能考量

- 使用 `beforeEach` 和 `afterEach` 清理狀態
- 避免不必要的渲染
- 適當使用 `waitFor` 的 timeout 設定
- 善用 `vi.clearAllMocks()` 清理 mock

### 4. 可維護性

- 測試檔案與原始碼放在同目錄
- 共用的 mock 放在 `src/test/mocks/`
- 使用 testUtils 統一測試設定
- 保持測試案例獨立性

---

## 參考資源

- [Vitest 文件](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library 最佳實務](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
