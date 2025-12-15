import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm } from '@/features/auth/LoginForm';
import { LoginSuccess } from '@/features/auth/LoginSuccess';
import { useAuthStore } from '@/stores/authStore';

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

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
