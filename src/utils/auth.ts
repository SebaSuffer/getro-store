const AUTH_STORAGE_KEY = 'gotra_auth';
const AUTH_SESSION_KEY = 'gotra_session_token';

const generateSessionToken = (username: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return btoa(`${timestamp}-${random}-${username}`).replace(/[^a-zA-Z0-9]/g, '');
};

const registerFailedAttempt = (): void => {
  const currentAuthData = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || '{}');
  currentAuthData.loginAttempts = (currentAuthData.loginAttempts || 0) + 1;
  currentAuthData.lastFailedAttempt = Date.now();
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentAuthData));
};

const createSession = (username: string): void => {
  const sessionToken = generateSessionToken(username);
  const authData = {
    username,
    isAuthenticated: true,
    timestamp: Date.now(),
    sessionToken,
    loginAttempts: 0,
  };
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
  localStorage.setItem(AUTH_SESSION_KEY, sessionToken);
};

export interface AuthUser {
  username: string;
  isAuthenticated: boolean;
}

/** Login contra el servidor (Turso + bcrypt). */
export const login = async (username: string, password: string): Promise<boolean> => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.trim(), password }),
    });

    if (!response.ok) {
      registerFailedAttempt();
      return false;
    }

    const data = await response.json();
    if (!data.success || !data.username) {
      registerFailedAttempt();
      return false;
    }

    createSession(data.username);
    return true;
  } catch (error) {
    console.error('Error during login:', error);
    registerFailedAttempt();
    return false;
  }
};

export const changePassword = async (
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
): Promise<{ success: boolean; error?: string }> => {
  const user = getCurrentUser();
  if (!user) {
    return { success: false, error: 'Debes iniciar sesión para cambiar la contraseña' };
  }

  try {
    const response = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: user.username,
        currentPassword,
        newPassword,
        confirmPassword,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'No se pudo cambiar la contraseña',
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Error changing password:', error);
    return { success: false, error: 'Error de conexión al cambiar la contraseña' };
  }
};

export const logout = (): void => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(AUTH_SESSION_KEY);
};

export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;

  const authData = localStorage.getItem(AUTH_STORAGE_KEY);
  const sessionToken = localStorage.getItem(AUTH_SESSION_KEY);

  if (!authData || !sessionToken) return false;

  try {
    const auth = JSON.parse(authData);

    if (auth.sessionToken !== sessionToken) {
      logout();
      return false;
    }

    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    if (Date.now() - auth.timestamp > TWENTY_FOUR_HOURS) {
      logout();
      return false;
    }

    if (auth.loginAttempts && auth.loginAttempts > 5) {
      const lockoutTime = 15 * 60 * 1000;
      if (Date.now() - auth.lastFailedAttempt < lockoutTime) {
        return false;
      }
    }

    return auth.isAuthenticated === true && Boolean(auth.username);
  } catch {
    return false;
  }
};

export const getCurrentUser = (): AuthUser | null => {
  if (!isAuthenticated()) return null;

  const authData = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!authData) return null;

  try {
    const auth = JSON.parse(authData);
    return {
      username: auth.username,
      isAuthenticated: true,
    };
  } catch {
    return null;
  }
};
