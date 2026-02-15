import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomeserverForm } from '@/features/auth/HomeserverForm';
import { CredentialsForm } from '@/features/auth/CredentialsForm';
import { LoginSuccess } from '@/features/auth/LoginSuccess';
import { useAuthStore } from '@/lib/stores/zustand/authStore';
import { loadAuthData } from '@/lib/stores/tauri/authStorage';
import { ThemeProvider } from '@/components/providers/ThemeProvider';

function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const pendingAuth = useAuthStore((state) => state.pendingAuth);
  const setAuthData = useAuthStore((state) => state.setAuthData);
  const setPendingAuth = useAuthStore((state) => state.setPendingAuth);

  useEffect(() => {
    let cancelled = false;

    const initializeAuth = async () => {
      try {
        const storedAuth = await loadAuthData();
        if (!cancelled && storedAuth) {
          // Restore authentication state
          setAuthData(storedAuth);
        }

        // Restore pending auth from sessionStorage (for page refresh)
        if (!cancelled) {
          const storedPending = sessionStorage.getItem('pendingAuth');
          if (storedPending) {
            try {
              const parsed = JSON.parse(storedPending);
              setPendingAuth(parsed);
            } catch (err) {
              if (import.meta.env.DEV) {
                console.error('Failed to parse stored pendingAuth:', err);
              }
              sessionStorage.removeItem('pendingAuth');
            }
          }
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to load stored auth:', error);
        }
      } finally {
        if (!cancelled) {
          setIsInitializing(false);
        }
      }
    };

    initializeAuth();

    return () => {
      cancelled = true;
    };
  }, [setAuthData, setPendingAuth]);

  if (isInitializing) {
    return (
      <ThemeProvider>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="text-4xl mb-4">✨</div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              isAuthenticated ? <Navigate to="/success" /> : <HomeserverForm />
            }
          />
          <Route
            path="/login/credentials"
            element={
              isAuthenticated ? (
                <Navigate to="/success" />
              ) : pendingAuth ? (
                <CredentialsForm />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/success"
            element={
              isAuthenticated ? <LoginSuccess /> : <Navigate to="/login" />
            }
          />
          <Route
            path="*"
            element={<Navigate to={isAuthenticated ? '/success' : '/login'} />}
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
