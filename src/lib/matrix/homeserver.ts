/**
 * Homeserver utility functions
 */

export interface HomeserverVerificationResult {
  isValid: boolean;
  baseUrl?: string;
  normalizedUrl: string;
  error?: string;
}

/**
 * Normalize homeserver URL
 * Adds https:// prefix if no protocol is specified
 */
export function normalizeHomeserverUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

/**
 * Verify homeserver by checking .well-known/matrix/client endpoint
 */
export async function verifyHomeserver(
  homeserverUrl: string
): Promise<HomeserverVerificationResult> {
  const normalizedUrl = normalizeHomeserverUrl(homeserverUrl);

  try {
    const response = await fetch(`${normalizedUrl}/.well-known/matrix/client`);

    if (!response.ok) {
      return {
        isValid: false,
        normalizedUrl,
        error: 'Cannot connect to homeserver',
      };
    }

    const data = await response.json();
    const baseUrl = data['m.homeserver']?.base_url;

    if (!baseUrl) {
      return {
        isValid: false,
        normalizedUrl,
        error: 'Invalid homeserver response',
      };
    }

    return {
      isValid: true,
      baseUrl,
      normalizedUrl,
    };
  } catch (err) {
    let errorMessage = 'Verification failed';

    if (err instanceof Error) {
      if (
        err.message.includes('fetch') ||
        err.message.includes('network') ||
        err.message.includes('Failed to fetch')
      ) {
        errorMessage =
          'Cannot connect to homeserver. Please check your internet connection.';
      } else {
        errorMessage = err.message;
      }
    }

    return {
      isValid: false,
      normalizedUrl,
      error: errorMessage,
    };
  }
}

/**
 * Extract domain from homeserver URL for username formatting
 * e.g., "https://matrix.org" -> "matrix.org"
 */
export function extractHomeserverDomain(homeserverUrl: string): string {
  return homeserverUrl.replace(/^https?:\/\//, '');
}
