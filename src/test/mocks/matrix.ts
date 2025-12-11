import { vi } from 'vitest';

/**
 * Matrix Client Mock
 * 用於測試中模擬 Matrix JS SDK
 */

export interface MockMatrixEvent {
  event_id?: string;
  type: string;
  content: {
    body?: string;
    msgtype?: string;
    [key: string]: unknown;
  };
  sender: string;
  origin_server_ts?: number;
  unsigned?: {
    age?: number;
    [key: string]: unknown;
  };
}

export interface MockRoom {
  roomId: string;
  name: string;
  timeline: MockMatrixEvent[];
  members: Map<string, { userId: string; displayName: string }>;
}

class MockMatrixClient {
  private rooms: Map<string, MockRoom> = new Map();
  private userId = '@test:matrix.org';
  private accessToken = 'test_token';
  private listeners = new Map<string, Set<(...args: unknown[]) => void>>();

  // 基本連線方法
  async startClient(): Promise<void> {
    this.emit('sync', 'PREPARED');
  }

  async stopClient(): Promise<void> {
    this.listeners.clear();
  }

  async login(
    _loginType: string,
    _data: { user: string; password: string }
  ): Promise<{
    access_token: string;
    user_id: string;
  }> {
    return {
      access_token: this.accessToken,
      user_id: this.userId,
    };
  }

  async logout(): Promise<void> {
    this.accessToken = '';
  }

  // 房間相關方法
  getRooms(): MockRoom[] {
    return Array.from(this.rooms.values());
  }

  getRoom(roomId: string): MockRoom | null {
    return this.rooms.get(roomId) ?? null;
  }

  async joinRoom(roomId: string): Promise<MockRoom> {
    let room = this.rooms.get(roomId);
    if (!room) {
      room = {
        roomId,
        name: `Room ${roomId}`,
        timeline: [],
        members: new Map(),
      };
      this.rooms.set(roomId, room);
    }
    return room;
  }

  async createRoom(options: {
    name: string;
    visibility?: string;
  }): Promise<{ room_id: string }> {
    const roomId = `!${Math.random().toString(36).substring(7)}:matrix.org`;
    const room: MockRoom = {
      roomId,
      name: options.name,
      timeline: [],
      members: new Map(),
    };
    this.rooms.set(roomId, room);
    return { room_id: roomId };
  }

  // 訊息相關方法
  async sendMessage(
    roomId: string,
    content: { body: string; msgtype: string }
  ): Promise<{ event_id: string }> {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error(`Room ${roomId} not found`);
    }

    const event: MockMatrixEvent = {
      event_id: `$${Math.random().toString(36).substring(7)}`,
      type: 'm.room.message',
      content,
      sender: this.userId,
      origin_server_ts: Date.now(),
    };

    room.timeline.push(event);
    this.emit('Room.timeline', event, room);

    return { event_id: event.event_id! };
  }

  // 事件監聽
  on(event: string, listener: (...args: unknown[]) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
  }

  off(event: string, listener: (...args: unknown[]) => void): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  emit(event: string, ...args: unknown[]): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach((listener) => listener(...args));
    }
  }

  // 使用者資訊
  getUserId(): string {
    return this.userId;
  }

  getAccessToken(): string {
    return this.accessToken;
  }

  // 測試用的輔助方法
  __reset(): void {
    this.rooms.clear();
    this.listeners.clear();
  }

  __setUserId(userId: string): void {
    this.userId = userId;
  }

  __addRoom(room: MockRoom): void {
    this.rooms.set(room.roomId, room);
  }
}

// 建立單例
const mockClientInstance = new MockMatrixClient();

/**
 * 模擬 matrix-js-sdk 的 createClient
 */
export const mockMatrixClient = {
  createClient: vi.fn(() => mockClientInstance),
};

/**
 * 取得 Mock Matrix Client 實例
 */
export function getMockMatrixClient(): MockMatrixClient {
  return mockClientInstance;
}

/**
 * 重置 Mock Matrix Client 狀態
 */
export function resetMockMatrixClient(): void {
  mockClientInstance.__reset();
}

/**
 * 建立測試用的 Matrix 事件
 */
export function createMockMatrixEvent(
  overrides: Partial<MockMatrixEvent> = {}
): MockMatrixEvent {
  return {
    event_id: `$${Math.random().toString(36).substring(7)}`,
    type: 'm.room.message',
    content: {
      body: 'Test message',
      msgtype: 'm.text',
    },
    sender: '@test:matrix.org',
    origin_server_ts: Date.now(),
    ...overrides,
  };
}

/**
 * 建立測試用的房間
 */
export function createMockRoom(overrides: Partial<MockRoom> = {}): MockRoom {
  return {
    roomId: `!${Math.random().toString(36).substring(7)}:matrix.org`,
    name: 'Test Room',
    timeline: [],
    members: new Map(),
    ...overrides,
  };
}
