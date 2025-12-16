import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('應該合併多個 class names', () => {
    const result = cn('text-red-500', 'bg-blue-500');
    expect(result).toBe('text-red-500 bg-blue-500');
  });

  it('應該處理條件式 class', () => {
    const isActive = true;
    const isDisabled = false;
    const result = cn(
      'base-class',
      isActive && 'active',
      isDisabled && 'disabled'
    );
    expect(result).toBe('base-class active');
  });

  it('應該處理 undefined 和 null', () => {
    const result = cn('base-class', undefined, null);
    expect(result).toBe('base-class');
  });

  it('應該合併 Tailwind CSS 衝突的 class (使用 twMerge)', () => {
    // twMerge 會自動處理 Tailwind 的衝突,保留後面的值
    const result = cn('px-2 py-1', 'px-4');
    expect(result).toBe('py-1 px-4');
  });

  it('應該處理物件形式的 class', () => {
    const result = cn({
      'text-red-500': true,
      'bg-blue-500': false,
      border: true,
    });
    expect(result).toBe('text-red-500 border');
  });

  it('應該處理陣列形式的 class', () => {
    const result = cn(['text-red-500', 'bg-blue-500']);
    expect(result).toBe('text-red-500 bg-blue-500');
  });

  it('應該處理混合格式', () => {
    const isConditional = true;
    const result = cn(
      'base-class',
      ['array-class'],
      { 'object-class': true },
      isConditional && 'conditional-class'
    );
    expect(result).toBe(
      'base-class array-class object-class conditional-class'
    );
  });

  it('應該處理空輸入', () => {
    const result = cn();
    expect(result).toBe('');
  });
});
