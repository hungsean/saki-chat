import { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';

// 未來可加入 Zustand store providers
export const AllTheProviders = ({ children }: { children: ReactNode }) => {
  return <BrowserRouter>{children}</BrowserRouter>;
};
