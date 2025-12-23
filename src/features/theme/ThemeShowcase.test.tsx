import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeShowcase } from './ThemeShowcase';

// Mock ThemeToggle component
vi.mock('@/components/theme/ThemeToggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle">Theme Toggle</div>,
}));

// Mock themeStore
const mockThemeStore: {
  mode: 'light' | 'dark' | 'system';
  resolvedTheme: 'light' | 'dark';
} = {
  mode: 'system',
  resolvedTheme: 'light',
};

vi.mock('@/lib/stores/zustand/themeStore', () => ({
  useThemeStore: vi.fn(() => mockThemeStore),
}));

describe('ThemeShowcase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockThemeStore.mode = 'system';
    mockThemeStore.resolvedTheme = 'light';
  });

  describe('基本渲染', () => {
    it('應該成功渲染主標題', () => {
      render(<ThemeShowcase />);

      expect(screen.getByText('Theme Showcase')).toBeInTheDocument();
    });

    it('應該顯示當前主題資訊', () => {
      render(<ThemeShowcase />);

      // 檢查 mode 和 resolvedTheme 是否顯示
      const currentInfo = screen.getByText(/Current:/);
      expect(currentInfo).toBeInTheDocument();
      expect(screen.getAllByText('system').length).toBeGreaterThan(0);
      expect(screen.getAllByText('light').length).toBeGreaterThan(0);
    });

    it('應該渲染 ThemeToggle 元件', () => {
      render(<ThemeShowcase />);

      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
    });
  });

  describe('Color Palette 區塊', () => {
    it('應該顯示 Color Palette 標題', () => {
      render(<ThemeShowcase />);

      expect(screen.getByText('Color Palette')).toBeInTheDocument();
      expect(
        screen.getByText('All theme colors and their usage')
      ).toBeInTheDocument();
    });

    it('應該顯示所有基本顏色', () => {
      render(<ThemeShowcase />);

      // 使用 getAllByText 來處理多個同名元素
      expect(screen.getAllByText('Background').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Primary').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Secondary').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Accent').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Muted').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Card').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Destructive').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Border').length).toBeGreaterThan(0);
    });
  });

  describe('Saki Color Palette 區塊', () => {
    it('應該顯示 Saki Color Palette 標題', () => {
      render(<ThemeShowcase />);

      expect(screen.getByText('Saki Color Palette')).toBeInTheDocument();
      expect(
        screen.getByText('Custom pink-themed color palette for Saki theme')
      ).toBeInTheDocument();
    });

    it('應該顯示 Pink Variants', () => {
      render(<ThemeShowcase />);

      expect(screen.getByText('Pink Variants')).toBeInTheDocument();
      expect(screen.getByText('Core Pink')).toBeInTheDocument();
      expect(screen.getByText('Light Pink')).toBeInTheDocument();
      expect(screen.getByText('Lighter Pink')).toBeInTheDocument();
      expect(screen.getByText('Subtle Pink')).toBeInTheDocument();
    });

    it('應該顯示 Background & Surface 顏色', () => {
      render(<ThemeShowcase />);

      expect(screen.getByText('Background & Surface')).toBeInTheDocument();
      expect(screen.getByText('Deep BG')).toBeInTheDocument();
      expect(screen.getByText('Surface')).toBeInTheDocument();
      expect(screen.getByText('Muted BG')).toBeInTheDocument();
      expect(screen.getByText('Soft Pink')).toBeInTheDocument();
    });
  });

  describe('Buttons 區塊', () => {
    it('應該顯示 Buttons 標題', () => {
      render(<ThemeShowcase />);

      expect(screen.getByText('Buttons')).toBeInTheDocument();
      expect(
        screen.getByText('All button variants and sizes')
      ).toBeInTheDocument();
    });

    it('應該顯示所有按鈕變體', () => {
      render(<ThemeShowcase />);

      // 使用 getAllByRole 來處理多個同名按鈕
      const defaultButtons = screen.getAllByRole('button', {
        name: /^Default$/,
      });
      expect(defaultButtons.length).toBeGreaterThan(0);

      expect(
        screen.getByRole('button', { name: /^Secondary$/ })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /^Outline$/ })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /^Ghost$/ })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /^Link$/ })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /^Destructive$/ })
      ).toBeInTheDocument();
    });

    it('應該顯示不同尺寸的按鈕', () => {
      render(<ThemeShowcase />);

      expect(screen.getByRole('button', { name: 'Small' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Large' })).toBeInTheDocument();
    });

    it('應該顯示禁用狀態的按鈕', () => {
      render(<ThemeShowcase />);

      const disabledButtons = screen.getAllByRole('button', {
        name: /Disabled/,
      });
      expect(disabledButtons.length).toBeGreaterThan(0);
      disabledButtons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });
  });

  describe('Form Elements 區塊', () => {
    it('應該顯示 Form Elements 標題', () => {
      render(<ThemeShowcase />);

      expect(screen.getByText('Form Elements')).toBeInTheDocument();
      expect(
        screen.getByText('Input fields and form controls')
      ).toBeInTheDocument();
    });

    it('應該顯示各種輸入框', () => {
      render(<ThemeShowcase />);

      expect(screen.getByPlaceholderText('Enter text...')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Disabled...')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('Enter password...')
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('email@example.com')
      ).toBeInTheDocument();
    });

    it('應該有禁用的輸入框', () => {
      render(<ThemeShowcase />);

      const disabledInput = screen.getByPlaceholderText('Disabled...');
      expect(disabledInput).toBeDisabled();
    });
  });

  describe('Typography 區塊', () => {
    it('應該顯示 Typography 標題', () => {
      render(<ThemeShowcase />);

      expect(screen.getByText('Typography')).toBeInTheDocument();
      expect(screen.getByText('Text styles and hierarchy')).toBeInTheDocument();
    });

    it('應該顯示不同級別的標題', () => {
      render(<ThemeShowcase />);

      expect(screen.getByText('Heading 1')).toBeInTheDocument();
      expect(screen.getByText('Heading 2')).toBeInTheDocument();
      expect(screen.getByText('Heading 3')).toBeInTheDocument();
      expect(screen.getByText('Heading 4')).toBeInTheDocument();
    });
  });

  describe('Theme Info 區塊', () => {
    it('應該顯示當前主題資訊', () => {
      render(<ThemeShowcase />);

      expect(screen.getByText('Current Theme Information')).toBeInTheDocument();
      expect(screen.getByText('Mode:')).toBeInTheDocument();
      expect(screen.getByText('Resolved Theme:')).toBeInTheDocument();
      expect(screen.getByText('Theme Class:')).toBeInTheDocument();
    });

    it('應該根據不同主題模式顯示正確的資訊', () => {
      mockThemeStore.mode = 'dark';
      mockThemeStore.resolvedTheme = 'dark';

      render(<ThemeShowcase />);

      expect(screen.getAllByText('dark').length).toBeGreaterThan(0);
    });
  });

  describe('響應不同的主題狀態', () => {
    it('應該在 system 模式下顯示正確資訊', () => {
      mockThemeStore.mode = 'system';
      mockThemeStore.resolvedTheme = 'light';

      render(<ThemeShowcase />);

      expect(screen.getAllByText('system').length).toBeGreaterThan(0);
      expect(screen.getAllByText('light').length).toBeGreaterThan(0);
    });

    it('應該在 light 模式下顯示正確資訊', () => {
      mockThemeStore.mode = 'light';
      mockThemeStore.resolvedTheme = 'light';

      render(<ThemeShowcase />);

      expect(screen.getAllByText('light').length).toBeGreaterThan(0);
    });

    it('應該在 dark 模式下顯示正確資訊', () => {
      mockThemeStore.mode = 'dark';
      mockThemeStore.resolvedTheme = 'dark';

      render(<ThemeShowcase />);

      expect(screen.getAllByText('dark').length).toBeGreaterThan(0);
    });
  });
});
