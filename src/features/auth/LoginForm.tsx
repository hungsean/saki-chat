import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';

type LoginStep = 'homeserver' | 'credentials';

export function LoginForm() {
  const [step, setStep] = useState<LoginStep>('homeserver');
  const [homeserver, setHomeserver] = useState('matrix.org');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  const normalizeHomeserver = (input: string): string => {
    let normalized = input.trim();
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
      normalized = `https://${normalized}`;
    }
    return normalized;
  };

  const verifyHomeserver = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsVerifying(true);

    try {
      const normalizedUrl = normalizeHomeserver(homeserver);
      const response = await fetch(`${normalizedUrl}/.well-known/matrix/client`);

      if (response.ok) {
        const data = await response.json();
        if (data['m.homeserver']?.base_url) {
          setHomeserver(normalizedUrl);
          setStep('credentials');
        } else {
          throw new Error('Invalid homeserver response');
        }
      } else {
        throw new Error('Cannot connect to homeserver');
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Verification failed. Please check the homeserver URL',
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const fullUsername = `@${username}:${homeserver.replace(/^https?:\/\//, '')}`;
    console.log('Login:', { homeserver, username: fullUsername, password });
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
            <p className="text-muted-foreground">Sign in to your Matrix account</p>
          </div>

          <div className="space-y-4">
            <form
              onSubmit={step === 'homeserver' ? verifyHomeserver : handleLogin}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label
                  htmlFor="homeserver"
                  className={`text-sm font-medium transition-all ${
                    step === 'credentials' ? 'text-xs text-muted-foreground' : ''
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
                  />
                </div>
              </div>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  {error}
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
                  >
                    Back
                  </Button>
                  <Button type="submit" className="flex-1">
                    Login
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
