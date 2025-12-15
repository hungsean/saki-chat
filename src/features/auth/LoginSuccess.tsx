/**
 * Login Success Page
 * Temporary page to display successful login
 */

import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';

export function LoginSuccess() {
  const { userId, homeServer } = useAuthStore();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
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
              <p className="font-mono text-sm break-all">{userId}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">
                Home Server:
              </span>
              <p className="font-mono text-sm break-all">{homeServer}</p>
            </div>
          </div>

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
        </div>
      </div>
    </div>
  );
}
