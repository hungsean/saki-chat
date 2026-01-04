import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { verifyHomeserver } from '@/lib/matrix/homeserver';
import { sanitizeText } from '@/lib/utils/sanitize';
import { useAuthStore } from '@/lib/stores/zustand/authStore';

export function HomeserverForm() {
  const navigate = useNavigate();
  const setPendingAuth = useAuthStore((state) => state.setPendingAuth);

  const [homeserver, setHomeserver] = useState('matrix.org');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  const handleVerifyHomeserver = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsVerifying(true);

    try {
      const result = await verifyHomeserver(homeserver);

      if (result.isValid && result.baseUrl) {
        // Store pending auth data in Zustand store
        setPendingAuth({
          homeserver,
          baseUrl: result.baseUrl,
        });

        // Navigate to credentials page
        navigate('/login/credentials');
      } else {
        setError(
          result.error || 'Verification failed. Please check the homeserver URL'
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Verification failed. Please check the homeserver URL'
      );
    } finally {
      setIsVerifying(false);
    }
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

          <form onSubmit={handleVerifyHomeserver} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="homeserver" className="text-sm font-medium">
                Homeserver
              </label>
              <Input
                id="homeserver"
                type="text"
                placeholder="matrix.org"
                value={homeserver}
                onChange={(e) => setHomeserver(e.target.value)}
                required
                aria-invalid={!!error}
                aria-describedby={error ? 'homeserver-error' : undefined}
              />
            </div>

            {error && (
              <div
                id="homeserver-error"
                role="alert"
                className="text-sm text-destructive bg-destructive/10 p-3 rounded-md"
              >
                {/* XSS Protection: Sanitize error messages from server */}
                {sanitizeText(error)}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isVerifying}>
              {isVerifying ? 'Verifying...' : 'Next'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
