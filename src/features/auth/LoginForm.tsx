import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import {
  verifyHomeserver,
  extractHomeserverDomain,
} from '@/lib/matrix/homeserver';
import { loginToMatrix } from '@/lib/matrix/client';
import { useAuthStore } from '@/lib/stores/zustand/authStore';
import { saveAuthData } from '@/lib/stores/tauri/authStorage';
import { sanitizeText } from '@/lib/utils/sanitize';

type LoginStep = 'homeserver' | 'credentials';

export function LoginForm() {
  const navigate = useNavigate();
  const setAuthData = useAuthStore((state) => state.setAuthData);

  const [step, setStep] = useState<LoginStep>('homeserver');
  const [homeserver, setHomeserver] = useState('matrix.org');
  const [baseUrl, setBaseUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState('');

  // Clear password on component unmount for security
  useEffect(() => {
    return () => {
      setPassword('');
    };
  }, []);

  // Helper: Handle error display
  const displayError = (err: unknown, defaultMessage: string) => {
    setError(err instanceof Error ? err.message : defaultMessage);
  };

  const handleVerifyHomeserver = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsVerifying(true);

    try {
      const result = await verifyHomeserver(homeserver);

      if (result.isValid && result.baseUrl) {
        setBaseUrl(result.baseUrl);
        setStep('credentials');
      } else {
        setError(
          result.error || 'Verification failed. Please check the homeserver URL'
        );
      }
    } catch (err) {
      displayError(err, 'Verification failed. Please check the homeserver URL');
    } finally {
      setIsVerifying(false);
    }
  };

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
      displayError(err, 'Login failed. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleBack = () => {
    setStep('homeserver');
    setUsername('');
    setPassword('');
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Saki Chat</h1>
            <p className="text-muted-foreground">
              Sign in to your Matrix account
            </p>
          </div>

          <div className="space-y-4">
            <form
              onSubmit={
                step === 'homeserver' ? handleVerifyHomeserver : handleLogin
              }
              className="space-y-4"
            >
              <div className="space-y-2">
                <label
                  htmlFor="homeserver"
                  className={`text-sm font-medium transition-all ${
                    step === 'credentials'
                      ? 'text-xs text-muted-foreground'
                      : ''
                  }`}
                >
                  Homeserver
                </label>
                <Input
                  id="homeserver"
                  type="text"
                  placeholder="matrix.org"
                  value={homeserver}
                  onChange={(e) => setHomeserver(e.target.value)}
                  disabled={step === 'credentials'}
                  required
                  aria-invalid={!!error && step === 'homeserver'}
                  aria-describedby={
                    error && step === 'homeserver'
                      ? 'homeserver-error'
                      : undefined
                  }
                  className={`transition-all ${
                    step === 'credentials' ? 'opacity-60' : ''
                  }`}
                />
              </div>

              <div
                className={`space-y-4 transition-all duration-300 ${
                  step === 'credentials'
                    ? 'opacity-100 max-h-96'
                    : 'opacity-0 max-h-0 overflow-hidden'
                }`}
              >
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
                    disabled={step === 'homeserver'}
                    required={step === 'credentials'}
                    aria-invalid={!!error && step === 'credentials'}
                    aria-describedby={
                      error && step === 'credentials'
                        ? 'credentials-error'
                        : undefined
                    }
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
                    disabled={step === 'homeserver'}
                    required={step === 'credentials'}
                    aria-invalid={!!error && step === 'credentials'}
                    aria-describedby={
                      error && step === 'credentials'
                        ? 'credentials-error'
                        : undefined
                    }
                  />
                </div>
              </div>

              {error && (
                <div
                  id={
                    step === 'homeserver'
                      ? 'homeserver-error'
                      : 'credentials-error'
                  }
                  role="alert"
                  className="text-sm text-destructive bg-destructive/10 p-3 rounded-md"
                >
                  {/* XSS Protection: Sanitize error messages from server */}
                  {sanitizeText(error)}
                </div>
              )}

              {step === 'homeserver' ? (
                <Button type="submit" className="w-full" disabled={isVerifying}>
                  {isVerifying ? 'Verifying...' : 'Next'}
                </Button>
              ) : (
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
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isLoggingIn}
                  >
                    {isLoggingIn ? 'Logging in...' : 'Login'}
                  </Button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
