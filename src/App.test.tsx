import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

// Mock Tauri API
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(() => Promise.resolve('Hello from Rust!')),
}));

describe('App', () => {
  it('應該正確渲染主頁面', () => {
    render(<App />);

    // 檢查標題是否存在
    expect(screen.getByText('Welcome to Tauri + React')).toBeInTheDocument();
  });

  it('應該顯示輸入框和按鈕', () => {
    render(<App />);

    // 檢查輸入框
    const input = screen.getByPlaceholderText('Enter a name...');
    expect(input).toBeInTheDocument();

    // 檢查按鈕
    const button = screen.getByRole('button', { name: 'Greet' });
    expect(button).toBeInTheDocument();
  });

  it('應該顯示 Tailwind CSS 測試元素', () => {
    render(<App />);

    // 檢查 Tailwind 測試區塊
    expect(screen.getByText('Hello Tailwind!')).toBeInTheDocument();
  });

  it('應該能夠在輸入框輸入文字', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByPlaceholderText('Enter a name...');

    // 模擬使用者輸入
    await user.type(input, 'Test User');

    expect(input).toHaveValue('Test User');
  });
});
