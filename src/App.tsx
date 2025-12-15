import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm } from '@/features/auth/LoginForm';
import { LoginSuccess } from '@/features/auth/LoginSuccess';
import { useAuthStore } from '@/lib/stores/zustand/authStore';
import { loadAuthData } from '@/lib/stores/tauri/authStorage';

function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setAuthData = useAuthStore((state) => state.setAuthData);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedAuth = await loadAuthData();
        if (storedAuth) {
          // Restore authentication state
          setAuthData(storedAuth);
        }
      } catch (error) {
        console.error('Failed to load stored auth:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, [setAuthData]);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-4xl mb-4">✨</div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/success" /> : <LoginForm />}
        />
        <Route
          path="/success"
          element={
            isAuthenticated ? <LoginSuccess /> : <Navigate to="/login" />
          }
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
