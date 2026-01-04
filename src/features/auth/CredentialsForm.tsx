import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { extractHomeserverDomain } from '@/lib/matrix/homeserver';
import { loginToMatrix } from '@/lib/matrix/client';
import { useAuthStore } from '@/lib/stores/zustand/authStore';
import { saveAuthData } from '@/lib/stores/tauri/authStorage';
import { sanitizeText } from '@/lib/utils/sanitize';
import { AuthLayout } from './AuthLayout';

export function CredentialsForm() {
  const navigate = useNavigate();
  const setAuthData = useAuthStore((state) => state.setAuthData);
  const pendingAuth = useAuthStore((state) => state.pendingAuth);
  const setPendingAuth = useAuthStore((state) => state.setPendingAuth);

  // Get homeserver data from pending auth
  const homeserver = pendingAuth?.homeserver;
  const baseUrl = pendingAuth?.baseUrl;

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

      // Clear pending auth data after successful login
      setPendingAuth(null);

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
    <AuthLayout>
      <form onSubmit={handleLogin} className="space-y-4">
        {/* Display homeserver (read-only) */}
        <div className="space-y-2">
          <label htmlFor="homeserver" className="text-xs text-muted-foreground">
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
    </AuthLayout>
  );
}
