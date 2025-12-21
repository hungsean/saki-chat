/**
 * Theme Toggle Component
 * Dropdown menu for switching between system/light/dark themes
 */

import { Moon, Sun, Monitor, Sparkles } from 'lucide-react';
import { useThemeStore, type ThemeMode } from '@/lib/stores/zustand/themeStore';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

// Accent color options for preview
const accentColorOptions = [
  {
    name: 'Lighter Pink',
    description: 'Softer and subtle',
    color: '#F472B6',
    oklch: 'oklch(0.75 0.15 12)',
  },
  {
    name: 'Deeper Pink',
    description: 'Rich and bold',
    color: '#DB2777',
    oklch: 'oklch(0.55 0.25 12)',
  },
  {
    name: 'Purple Pink',
    description: 'Dreamy purple tone',
    color: '#E879F9',
    oklch: 'oklch(0.73 0.20 320)',
  },
  {
    name: 'Orange Pink',
    description: 'Warm and vibrant',
    color: '#FB7185',
    oklch: 'oklch(0.71 0.18 15)',
  },
];

export function ThemeToggle() {
  const { mode, setTheme } = useThemeStore();

  const handleThemeChange = (newMode: ThemeMode) => {
    setTheme(newMode);
  };

  const getCurrentIcon = () => {
    switch (mode) {
      case 'light':
        return <Sun className="h-4 w-4" />;
      case 'dark':
        return <Moon className="h-4 w-4" />;
      case 'saki':
        return <Sparkles className="h-4 w-4" />;
      case 'system':
        return <Monitor className="h-4 w-4" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
          {getCurrentIcon()}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuItem onClick={() => handleThemeChange('light')}>
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange('dark')}>
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange('saki')}>
          <Sparkles className="mr-2 h-4 w-4" />
          <span>Saki</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange('system')}>
          <Monitor className="mr-2 h-4 w-4" />
          <span>System</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          Accent Color Preview (Primary: Pink #EA4A5B)
        </DropdownMenuLabel>

        <div className="space-y-3 p-2">
          {accentColorOptions.map((option) => (
            <div key={option.name} className="space-y-1.5">
              <div className="text-[10px] font-medium text-muted-foreground">
                {option.name} - {option.description}
              </div>
              <div className="flex gap-2">
                {/* Primary Button */}
                <button
                  className="flex-1 rounded-md px-3 py-1.5 text-xs font-medium text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: '#EA4A5B' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('Selected accent color:', option.name, option.oklch);
                  }}
                >
                  Primary
                </button>
                {/* Outline Button with Accent hover */}
                <button
                  className="group flex-1 rounded-md border px-3 py-1.5 text-xs font-medium transition-all"
                  style={{
                    borderColor: option.color,
                    color: option.color,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = option.color;
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = option.color;
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('Selected accent color:', option.name, option.oklch);
                  }}
                >
                  Accent
                </button>
              </div>
            </div>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
