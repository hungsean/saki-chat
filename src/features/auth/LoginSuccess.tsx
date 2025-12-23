/**
 * Login Success Page
 * Temporary page to display successful login
 */

import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/lib/stores/zustand/authStore';
import { clearAuthData } from '@/lib/stores/tauri/authStorage';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import {
  sanitizeText,
  isValidMatrixUserId,
  isValidHomeserverDomain,
} from '@/lib/utils/sanitize';

export function LoginSuccess() {
  const navigate = useNavigate();
  const { userId, homeServer, clearAuth } = useAuthStore();

  // Sanitize user data for display (XSS protection)
  const safeUserId = sanitizeText(userId || '');
  const safeHomeServer = sanitizeText(homeServer || '');

  // Validate format (log warning if invalid, but don't break the UI)
  if (userId && !isValidMatrixUserId(userId)) {
    console.warn('[LoginSuccess] Invalid Matrix User ID format:', userId);
  }
  if (homeServer && !isValidHomeserverDomain(homeServer)) {
    console.warn(
      '[LoginSuccess] Invalid homeserver domain format:',
      homeServer
    );
  }

  const handleLogout = async () => {
    try {
      // Clear auth data from Tauri Store
      await clearAuthData();
      // Clear auth state from memory
      clearAuth();
      // Navigate to login page
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Theme Toggle - Top Right */}
      <div className="fixed top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <div className="space-y-6 text-center">
          <div className="space-y-2">
            <div className="text-6xl mb-4">✨</div>
            <h1 className="text-3xl font-bold">Congratulations!</h1>
            <p className="text-lg text-muted-foreground">
              You have successfully logged in
            </p>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-left">
            <div>
              <span className="text-sm text-muted-foreground">User ID:</span>
              {/* XSS Protection: Display sanitized user ID */}
              <p className="font-mono text-sm break-all">{safeUserId}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">
                Home Server:
              </span>
              {/* XSS Protection: Display sanitized homeserver */}
              <p className="font-mono text-sm break-all">{safeHomeServer}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Button
                className="w-full relative overflow-hidden"
                size="lg"
                disabled
              >
                <span className="relative z-10">Continue to Chat</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 animate-pulse" />
              </Button>
              <p className="text-xs text-muted-foreground mt-2 animate-pulse">
                🚧 Coming soon...
              </p>
            </div>

            <Button
              variant="outline"
              className="w-full"
              size="lg"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
