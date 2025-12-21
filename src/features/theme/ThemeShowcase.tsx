/**
 * Theme Showcase Page
 * Display all UI components and theme colors for testing
 */

import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useThemeStore } from '@/lib/stores/zustand/themeStore';

export function ThemeShowcase() {
  const { mode, resolvedTheme } = useThemeStore();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Theme Showcase
            </h1>
            <p className="text-muted-foreground">
              Current: <span className="font-semibold">{mode}</span> (resolved:{' '}
              <span className="font-semibold">{resolvedTheme}</span>)
            </p>
          </div>
          <ThemeToggle />
        </div>

        {/* Color Palette */}
        <Card>
          <CardHeader>
            <CardTitle>Color Palette</CardTitle>
            <CardDescription>All theme colors and their usage</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="h-20 rounded-lg bg-background border border-border flex items-center justify-center">
                <span className="text-sm font-medium text-foreground">
                  Background
                </span>
              </div>
              <p className="text-xs text-muted-foreground">background</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-sm font-medium text-primary-foreground">
                  Primary
                </span>
              </div>
              <p className="text-xs text-muted-foreground">primary</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 rounded-lg bg-secondary flex items-center justify-center">
                <span className="text-sm font-medium text-secondary-foreground">
                  Secondary
                </span>
              </div>
              <p className="text-xs text-muted-foreground">secondary</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 rounded-lg bg-accent flex items-center justify-center">
                <span className="text-sm font-medium text-accent-foreground">
                  Accent
                </span>
              </div>
              <p className="text-xs text-muted-foreground">accent</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 rounded-lg bg-muted flex items-center justify-center">
                <span className="text-sm font-medium text-muted-foreground">
                  Muted
                </span>
              </div>
              <p className="text-xs text-muted-foreground">muted</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 rounded-lg bg-card border border-border flex items-center justify-center">
                <span className="text-sm font-medium text-card-foreground">
                  Card
                </span>
              </div>
              <p className="text-xs text-muted-foreground">card</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 rounded-lg bg-destructive flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  Destructive
                </span>
              </div>
              <p className="text-xs text-muted-foreground">destructive</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 rounded-lg border-2 border-border bg-background flex items-center justify-center">
                <span className="text-sm font-medium text-foreground">
                  Border
                </span>
              </div>
              <p className="text-xs text-muted-foreground">border</p>
            </div>
          </CardContent>
        </Card>

        {/* Saki Color Palette */}
        <Card>
          <CardHeader>
            <CardTitle>Saki Color Palette</CardTitle>
            <CardDescription>
              Custom pink-themed color palette for Saki theme
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Pink Variants */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  Pink Variants
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <div
                      className="h-20 rounded-lg shadow-sm border border-border flex items-center justify-center"
                      style={{ backgroundColor: 'var(--color-saki-pink)' }}
                    >
                      <span className="text-sm font-medium text-white">
                        Core Pink
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      --color-saki-pink
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div
                      className="h-20 rounded-lg shadow-sm border border-border flex items-center justify-center"
                      style={{
                        backgroundColor: 'var(--color-saki-pink-light)',
                      }}
                    >
                      <span className="text-sm font-medium text-white">
                        Light Pink
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      --color-saki-pink-light
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div
                      className="h-20 rounded-lg shadow-sm border border-border flex items-center justify-center"
                      style={{
                        backgroundColor: 'var(--color-saki-pink-lighter)',
                      }}
                    >
                      <span className="text-sm font-medium text-white">
                        Lighter Pink
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      --color-saki-pink-lighter
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div
                      className="h-20 rounded-lg shadow-sm border border-border flex items-center justify-center"
                      style={{
                        backgroundColor: 'var(--color-saki-pink-subtle)',
                      }}
                    >
                      <span className="text-sm font-medium text-foreground">
                        Subtle Pink
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      --color-saki-pink-subtle
                    </p>
                  </div>
                </div>
              </div>

              {/* Background Variants */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  Background & Surface
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <div
                      className="h-20 rounded-lg shadow-sm border border-border flex items-center justify-center"
                      style={{ backgroundColor: 'var(--color-saki-bg-deep)' }}
                    >
                      <span className="text-sm font-medium text-white">
                        Deep BG
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      --color-saki-bg-deep
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div
                      className="h-20 rounded-lg shadow-sm border border-border flex items-center justify-center"
                      style={{
                        backgroundColor: 'var(--color-saki-bg-surface)',
                      }}
                    >
                      <span className="text-sm font-medium text-white">
                        Surface
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      --color-saki-bg-surface
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div
                      className="h-20 rounded-lg shadow-sm border border-border flex items-center justify-center"
                      style={{ backgroundColor: 'var(--color-saki-bg-muted)' }}
                    >
                      <span className="text-sm font-medium text-white">
                        Muted BG
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      --color-saki-bg-muted
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div
                      className="h-20 rounded-lg shadow-sm border border-border flex items-center justify-center"
                      style={{
                        backgroundColor: 'var(--color-saki-pink-soft)',
                      }}
                    >
                      <span className="text-sm font-medium text-foreground">
                        Soft Pink
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      --color-saki-pink-soft
                    </p>
                  </div>
                </div>
              </div>

              {/* Border */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  Border
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div
                      className="h-20 rounded-lg shadow-sm bg-background flex items-center justify-center"
                      style={{
                        border: '2px solid var(--color-saki-border)',
                      }}
                    >
                      <span className="text-sm font-medium text-foreground">
                        Saki Border
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      --color-saki-border
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
            <CardDescription>All button variants and sizes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button variant="default">Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button disabled>Disabled</Button>
              <Button variant="outline" disabled>
                Disabled Outline
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Form Elements */}
        <Card>
          <CardHeader>
            <CardTitle>Form Elements</CardTitle>
            <CardDescription>Input fields and form controls</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Normal Input
                </label>
                <Input type="text" placeholder="Enter text..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Disabled Input
                </label>
                <Input type="text" placeholder="Disabled..." disabled />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Password Input
                </label>
                <Input type="password" placeholder="Enter password..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Email Input
                </label>
                <Input type="email" placeholder="email@example.com" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Card Title</CardTitle>
              <CardDescription>Card description goes here</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground">
                This is a standard card component with header and content.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Another Card</CardTitle>
              <CardDescription>With some content</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground">
                Cards are great for grouping related content.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Third Card</CardTitle>
              <CardDescription>More examples</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground">
                This demonstrates how cards look side by side.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Typography */}
        <Card>
          <CardHeader>
            <CardTitle>Typography</CardTitle>
            <CardDescription>Text styles and hierarchy</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h1 className="text-4xl font-bold text-foreground">Heading 1</h1>
              <h2 className="text-3xl font-bold text-foreground">Heading 2</h2>
              <h3 className="text-2xl font-bold text-foreground">Heading 3</h3>
              <h4 className="text-xl font-bold text-foreground">Heading 4</h4>
            </div>
            <div className="space-y-2">
              <p className="text-foreground">
                This is normal body text. It should be easily readable with good
                contrast.
              </p>
              <p className="text-muted-foreground">
                This is muted text, used for less important information.
              </p>
              <p className="text-sm text-muted-foreground">
                This is small text, often used for captions or footnotes.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Theme Info */}
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle className="text-primary">
              Current Theme Information
            </CardTitle>
            <CardDescription>Active theme settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="font-medium text-foreground">Mode:</span>
              <span className="text-muted-foreground">{mode}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="font-medium text-foreground">
                Resolved Theme:
              </span>
              <span className="text-muted-foreground">{resolvedTheme}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="font-medium text-foreground">Theme Class:</span>
              <code className="text-sm bg-muted px-2 py-1 rounded text-muted-foreground">
                .{resolvedTheme}
              </code>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
