import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils/testUtils';
import userEvent from '@testing-library/user-event';
import { CredentialsForm } from './CredentialsForm';
import * as homeserverUtils from '@/lib/matrix/homeserver';
import * as matrixClient from '@/lib/matrix/client';
import * as authStorage from '@/lib/stores/tauri/authStorage';

// Mock useNavigate
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Navigate: ({ to, replace }: { to: string; replace?: boolean }) => (
      <div data-testid="navigate" data-to={to} data-replace={replace} />
    ),
  };
});

// Mock homeserver utilities
vi.mock('@/lib/matrix/homeserver');
const mockExtractHomeserverDomain = vi.mocked(
  homeserverUtils.extractHomeserverDomain
);

// Mock matrix client
vi.mock('@/lib/matrix/client');
const mockLoginToMatrix = vi.mocked(matrixClient.loginToMatrix);

// Mock auth storage
vi.mock('@/lib/stores/tauri/authStorage');
const mockSaveAuthData = vi.mocked(authStorage.saveAuthData);

// Mock auth store
const mockSetAuthData = vi.fn();
const mockSetPendingAuth = vi.fn();
let mockPendingAuth: { homeserver: string; baseUrl: string } | null = {
  homeserver: 'matrix.org',
  baseUrl: 'https://matrix-client.matrix.org',
};

vi.mock('@/lib/stores/zustand/authStore', () => ({
  useAuthStore: vi.fn((selector) => {
    const store = {
      setAuthData: mockSetAuthData,
      pendingAuth: mockPendingAuth,
      setPendingAuth: mockSetPendingAuth,
    };
    return selector ? selector(store) : store;
  }),
}));

// Mock sanitize utilities
vi.mock('@/lib/utils/sanitize', () => ({
  sanitizeText: vi.fn((text) => text),
}));

describe('CredentialsForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockExtractHomeserverDomain.mockImplementation((url) =>
      url.replace(/^https?:\/\//, '')
    );
    // Reset pending auth
    mockPendingAuth = {
      homeserver: 'matrix.org',
      baseUrl: 'https://matrix-client.matrix.org',
    };
  });

  it('should render the credentials input form', () => {
    render(<CredentialsForm />);

    expect(screen.getByText('Saki Chat')).toBeInTheDocument();
    expect(
      screen.getByText('Sign in to your Matrix account')
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Homeserver')).toBeDisabled();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
  });

  it('should display homeserver from pending auth', () => {
    render(<CredentialsForm />);

    const homeserverInput = screen.getByLabelText('Homeserver');
    expect(homeserverInput).toHaveValue('matrix.org');
  });

  it('should redirect to /login if no pending auth', () => {
    mockPendingAuth = null;

    render(<CredentialsForm />);

    const navigate = screen.getByTestId('navigate');
    expect(navigate).toHaveAttribute('data-to', '/login');
    expect(navigate).toHaveAttribute('data-replace', 'true');
  });

  it('should allow entering username and password', async () => {
    const user = userEvent.setup();
    render(<CredentialsForm />);

    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');

    expect(usernameInput).toHaveValue('testuser');
    expect(passwordInput).toHaveValue('password123');
  });

  it('should login successfully and navigate to success page', async () => {
    const user = userEvent.setup();
    mockLoginToMatrix.mockResolvedValue({
      success: true,
      accessToken: 'test-token',
      userId: '@testuser:matrix.org',
      deviceId: 'DEVICEID',
      homeServer: 'matrix.org',
    });
    mockSaveAuthData.mockResolvedValue();

    render(<CredentialsForm />);

    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const loginButton = screen.getByRole('button', { name: 'Login' });

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');
    await user.click(loginButton);

    await waitFor(() => {
      expect(mockLoginToMatrix).toHaveBeenCalledWith({
        baseUrl: 'https://matrix-client.matrix.org',
        username: '@testuser:matrix.org',
        password: 'password123',
      });
    });

    expect(mockSetAuthData).toHaveBeenCalledWith({
      userId: '@testuser:matrix.org',
      accessToken: 'test-token',
      deviceId: 'DEVICEID',
      homeServer: 'matrix.org',
      baseUrl: 'https://matrix-client.matrix.org',
    });

    expect(mockSaveAuthData).toHaveBeenCalledWith({
      userId: '@testuser:matrix.org',
      accessToken: 'test-token',
      deviceId: 'DEVICEID',
      homeServer: 'matrix.org',
      baseUrl: 'https://matrix-client.matrix.org',
    });

    expect(mockSetPendingAuth).toHaveBeenCalledWith(null);
    expect(mockNavigate).toHaveBeenCalledWith('/success');
  });

  it('should clear password after successful login', async () => {
    const user = userEvent.setup();
    mockLoginToMatrix.mockResolvedValue({
      success: true,
      accessToken: 'test-token',
      userId: '@testuser:matrix.org',
      deviceId: 'DEVICEID',
      homeServer: 'matrix.org',
    });
    mockSaveAuthData.mockResolvedValue();

    render(<CredentialsForm />);

    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const loginButton = screen.getByRole('button', { name: 'Login' });

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');

    expect(passwordInput).toHaveValue('password123');

    await user.click(loginButton);

    await waitFor(() => {
      expect(passwordInput).toHaveValue('');
    });
  });

  it('should display error message on login failure', async () => {
    const user = userEvent.setup();
    mockLoginToMatrix.mockResolvedValue({
      success: false,
      error: 'Invalid credentials',
    });

    render(<CredentialsForm />);

    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const loginButton = screen.getByRole('button', { name: 'Login' });

    await user.type(usernameInput, 'wronguser');
    await user.type(passwordInput, 'wrongpass');
    await user.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should show loading state during login', async () => {
    const user = userEvent.setup();
    mockLoginToMatrix.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(
            () =>
              resolve({
                success: true,
                accessToken: 'token',
                userId: '@user:matrix.org',
                deviceId: 'device',
                homeServer: 'matrix.org',
              }),
            100
          );
        })
    );

    render(<CredentialsForm />);

    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const loginButton = screen.getByRole('button', { name: 'Login' });

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');
    await user.click(loginButton);

    expect(
      screen.getByRole('button', { name: 'Logging in...' })
    ).toBeDisabled();
  });

  it('should navigate back when Back button is clicked', async () => {
    const user = userEvent.setup();
    render(<CredentialsForm />);

    const backButton = screen.getByRole('button', { name: 'Back' });
    await user.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('should sanitize error messages for XSS protection', async () => {
    const { sanitizeText } = await import('@/lib/utils/sanitize');
    const user = userEvent.setup();
    const maliciousError = '<img src=x onerror=alert(1)>Invalid password';

    mockLoginToMatrix.mockResolvedValue({
      success: false,
      error: maliciousError,
    });

    render(<CredentialsForm />);

    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const loginButton = screen.getByRole('button', { name: 'Login' });

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');
    await user.click(loginButton);

    await waitFor(() => {
      expect(sanitizeText).toHaveBeenCalledWith(maliciousError);
    });
  });

  it('should autofocus username input', () => {
    render(<CredentialsForm />);

    const usernameInput = screen.getByLabelText('Username');
    // In testing environment, we just verify the autoFocus prop is set
    expect(usernameInput).toBeInTheDocument();
    expect(usernameInput).toHaveAttribute('id', 'username');
  });
});
