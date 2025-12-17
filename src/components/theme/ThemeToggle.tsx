/**
 * Theme Toggle Component
 * Simple theme switcher with three buttons for system/light/dark modes
 */

import { Moon, Sun, Monitor } from 'lucide-react';
import { useThemeStore, type ThemeMode } from '@/lib/stores/zustand/themeStore';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { mode, setTheme } = useThemeStore();

  const handleThemeChange = (newMode: ThemeMode) => {
    setTheme(newMode);
  };

  return (
    <div className="flex items-center gap-1 rounded-lg border p-1">
      <Button
        variant={mode === 'light' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => handleThemeChange('light')}
        aria-label="Light theme"
        className="h-8 w-8 p-0"
      >
        <Sun className="h-4 w-4" />
      </Button>

      <Button
        variant={mode === 'dark' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => handleThemeChange('dark')}
        aria-label="Dark theme"
        className="h-8 w-8 p-0"
      >
        <Moon className="h-4 w-4" />
      </Button>

      <Button
        variant={mode === 'system' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => handleThemeChange('system')}
        aria-label="System theme"
        className="h-8 w-8 p-0"
      >
        <Monitor className="h-4 w-4" />
      </Button>
    </div>
  );
}
