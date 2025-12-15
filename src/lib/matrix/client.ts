/**
 * Matrix Client Management
 * Handles Matrix SDK client initialization and authentication
 */

import * as sdk from 'matrix-js-sdk';

export interface LoginCredentials {
  baseUrl: string; // Use the actual base URL from .well-known verification
  username: string;
  password: string;
}

export interface LoginResult {
  success: boolean;
  accessToken?: string;
  userId?: string;
  deviceId?: string;
  homeServer?: string;
  error?: string;
}

/**
 * Login to Matrix homeserver
 * @param credentials - Login credentials with verified baseUrl
 */
export async function loginToMatrix(
  credentials: LoginCredentials
): Promise<LoginResult> {
  try {
    // Create a temporary client for login using the verified base URL
    const client = sdk.createClient({
      baseUrl: credentials.baseUrl,
    });

    // Perform login
    const response = await client.login('m.login.password', {
      user: credentials.username,
      password: credentials.password,
    });

    return {
      success: true,
      accessToken: response.access_token,
      userId: response.user_id,
      deviceId: response.device_id,
      homeServer: response.home_server,
    };
  } catch (error) {
    console.error('Login failed:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Login failed. Please check your credentials.',
    };
  }
}

/**
 * Create and initialize Matrix client with stored credentials
 */
export async function createMatrixClient(
  baseUrl: string,
  accessToken: string,
  userId: string
): Promise<sdk.MatrixClient> {
  const client = sdk.createClient({
    baseUrl,
    accessToken,
    userId,
  });

  // Start the client
  await client.startClient({ initialSyncLimit: 10 });

  return client;
}

/**
 * Logout from Matrix
 */
export async function logoutFromMatrix(
  client: sdk.MatrixClient
): Promise<void> {
  try {
    await client.logout();
    client.stopClient();
  } catch (error) {
    console.error('Logout failed:', error);
    // Even if logout fails, stop the client
    client.stopClient();
  }
}
