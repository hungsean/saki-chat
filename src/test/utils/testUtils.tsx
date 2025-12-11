import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { AllTheProviders } from './TestProviders';

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// 重新匯出常用的測試工具
export { customRender as render };
export { screen, waitFor, fireEvent, within } from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
