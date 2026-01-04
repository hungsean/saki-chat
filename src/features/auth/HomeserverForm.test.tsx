import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils/testUtils';
import userEvent from '@testing-library/user-event';
import { HomeserverForm } from './HomeserverForm';
import * as homeserverUtils from '@/lib/matrix/homeserver';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock homeserver utilities
vi.mock('@/lib/matrix/homeserver');
const mockVerifyHomeserver = vi.mocked(homeserverUtils.verifyHomeserver);

// Mock sanitize utilities
vi.mock('@/lib/utils/sanitize', () => ({
  sanitizeText: vi.fn((text) => text), // Default: pass through
}));

describe('HomeserverForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the homeserver input form', () => {
    render(<HomeserverForm />);

    expect(screen.getByText('Saki Chat')).toBeInTheDocument();
    expect(
      screen.getByText('Sign in to your Matrix account')
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Homeserver')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
  });

  it('should allow entering homeserver URL', async () => {
    const user = userEvent.setup();
    render(<HomeserverForm />);

    const homeserverInput = screen.getByLabelText('Homeserver');

    await user.clear(homeserverInput);
    await user.type(homeserverInput, 'example.com');

    expect(homeserverInput).toHaveValue('example.com');
  });

  it('should navigate to credentials page on successful verification', async () => {
    const user = userEvent.setup();
    mockVerifyHomeserver.mockResolvedValue({
      isValid: true,
      baseUrl: 'https://matrix-client.matrix.org',
      normalizedUrl: 'https://matrix.org',
    });

    render(<HomeserverForm />);

    const nextButton = screen.getByRole('button', { name: 'Next' });
    await user.click(nextButton);

    await waitFor(() => {
      expect(mockVerifyHomeserver).toHaveBeenCalledWith('matrix.org');
      expect(mockNavigate).toHaveBeenCalledWith('/login/credentials', {
        state: {
          homeserver: 'matrix.org',
          baseUrl: 'https://matrix-client.matrix.org',
        },
      });
    });
  });

  it('should display error message on verification failure', async () => {
    const user = userEvent.setup();
    mockVerifyHomeserver.mockResolvedValue({
      isValid: false,
      normalizedUrl: 'https://invalid.com',
      error: 'Cannot connect to homeserver',
    });

    render(<HomeserverForm />);

    const nextButton = screen.getByRole('button', { name: 'Next' });
    await user.click(nextButton);

    await waitFor(() => {
      expect(
        screen.getByText('Cannot connect to homeserver')
      ).toBeInTheDocument();
    });

    // Should still show Next button
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
  });

  it('should show loading state during verification', async () => {
    const user = userEvent.setup();
    mockVerifyHomeserver.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(
            () =>
              resolve({
                isValid: true,
                baseUrl: 'https://matrix.org',
                normalizedUrl: 'https://matrix.org',
              }),
            100
          );
        })
    );

    render(<HomeserverForm />);

    const nextButton = screen.getByRole('button', { name: 'Next' });
    await user.click(nextButton);

    // Should show Verifying...
    expect(screen.getByRole('button', { name: 'Verifying...' })).toBeDisabled();
  });

  it('should sanitize error messages for XSS protection', async () => {
    const { sanitizeText } = await import('@/lib/utils/sanitize');
    const user = userEvent.setup();
    const maliciousError = '<script>alert("XSS")</script>Cannot connect';

    mockVerifyHomeserver.mockResolvedValue({
      isValid: false,
      normalizedUrl: 'https://invalid.com',
      error: maliciousError,
    });

    render(<HomeserverForm />);

    const nextButton = screen.getByRole('button', { name: 'Next' });
    await user.click(nextButton);

    await waitFor(() => {
      expect(sanitizeText).toHaveBeenCalledWith(maliciousError);
    });
  });

  it('should handle empty error message with default message', async () => {
    const { sanitizeText } = await import('@/lib/utils/sanitize');
    const user = userEvent.setup();

    mockVerifyHomeserver.mockResolvedValue({
      isValid: false,
      normalizedUrl: 'https://invalid.com',
      error: '',
    });

    render(<HomeserverForm />);

    const nextButton = screen.getByRole('button', { name: 'Next' });
    await user.click(nextButton);

    await waitFor(() => {
      expect(sanitizeText).toHaveBeenCalledWith(
        'Verification failed. Please check the homeserver URL'
      );
    });

    expect(
      screen.getByText('Verification failed. Please check the homeserver URL')
    ).toBeInTheDocument();
  });
});
