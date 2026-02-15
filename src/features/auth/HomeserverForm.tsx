import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { verifyHomeserver } from '@/lib/matrix/homeserver';
import { sanitizeText } from '@/lib/utils/sanitize';
import { useAuthStore } from '@/lib/stores/zustand/authStore';
import { AuthLayout } from './AuthLayout';

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
        const pendingAuthData = {
          homeserver,
          baseUrl: result.baseUrl,
        };

        // Store pending auth data in Zustand store
        setPendingAuth(pendingAuthData);

        // Persist to sessionStorage for page refresh
        sessionStorage.setItem('pendingAuth', JSON.stringify(pendingAuthData));

        // Navigate to credentials page
        navigate('/login/credentials');
      } else {
        setError(
          result.error || 'Verification failed. Please check the homeserver URL'
        );
      }
    } catch (err) {
      // Only log detailed errors in development
      if (import.meta.env.DEV) {
        console.error('Homeserver verification error:', err);
      }
      // Use generic error message to avoid leaking sensitive information
      setError('Verification failed. Please check the homeserver URL.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <AuthLayout>
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
    </AuthLayout>
  );
}
