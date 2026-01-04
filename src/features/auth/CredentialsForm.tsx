import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { extractHomeserverDomain } from '@/lib/matrix/homeserver';
import { loginToMatrix } from '@/lib/matrix/client';
import { useAuthStore } from '@/lib/stores/zustand/authStore';
import { saveAuthData } from '@/lib/stores/tauri/authStorage';
import { sanitizeText } from '@/lib/utils/sanitize';

interface LocationState {
  homeserver: string;
  baseUrl: string;
}

export function CredentialsForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuthData = useAuthStore((state) => state.setAuthData);

  // Get homeserver data from navigation state
  const state = location.state as LocationState | null;
  const homeserver = state?.homeserver;
  const baseUrl = state?.baseUrl;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState('');

  // Clear password on component unmount for security
  useEffect(() => {
    return () => {
      setPassword('');
    };
  }, []);

  // Redirect to homeserver page if no state
  if (!homeserver || !baseUrl) {
    return <Navigate to="/login" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);

    try {
      const domain = extractHomeserverDomain(homeserver);
      const fullUsername = `@${username}:${domain}`;

      const result = await loginToMatrix({
        baseUrl,
        username: fullUsername,
        password,
      });

      if (
        !result.success ||
        !result.accessToken ||
        !result.userId ||
        !result.deviceId ||
        !result.homeServer
      ) {
        setError(
          result.error || 'Login failed. Please check your credentials.'
        );
        return;
      }

      const authData = {
        userId: result.userId,
        accessToken: result.accessToken,
        deviceId: result.deviceId,
        homeServer: result.homeServer,
        baseUrl,
      };

      // Store authentication data in memory
      setAuthData(authData);

      // Save to Tauri Store for persistence
      await saveAuthData(authData);

      // Clear password immediately after successful login for security
      setPassword('');

      // Navigate to success page
      navigate('/success');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Login failed. Please try again.'
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleBack = () => {
    // Use browser's back navigation
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Theme Toggle - Top Right */}
      <div className="fixed top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Saki Chat</h1>
            <p className="text-muted-foreground">
              Sign in to your Matrix account
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Display homeserver (read-only) */}
            <div className="space-y-2">
              <label
                htmlFor="homeserver"
                className="text-xs text-muted-foreground"
              >
                Homeserver
              </label>
              <Input
                id="homeserver"
                type="text"
                value={homeserver}
                disabled
                className="opacity-60"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Username
              </label>
              <Input
                id="username"
                type="text"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                aria-invalid={!!error}
                aria-describedby={error ? 'credentials-error' : undefined}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <PasswordInput
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                aria-invalid={!!error}
                aria-describedby={error ? 'credentials-error' : undefined}
              />
            </div>

            {error && (
              <div
                id="credentials-error"
                role="alert"
                className="text-sm text-destructive bg-destructive/10 p-3 rounded-md"
              >
                {/* XSS Protection: Sanitize error messages from server */}
                {sanitizeText(error)}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="flex-1"
                disabled={isLoggingIn}
              >
                Back
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoggingIn}>
                {isLoggingIn ? 'Logging in...' : 'Login'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
