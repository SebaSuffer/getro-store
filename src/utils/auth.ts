const AUTH_STORAGE_KEY = 'gotra_auth';
const AUTH_SESSION_KEY = 'gotra_session_token';

// Usuarios permitidos (hardcodeado por ahora, se puede migrar a BD)
const ALLOWED_USERS: Record<string, string> = {
  'adminsgotra': '$Gotra23$',
};

// Generar token de sesión único
const generateSessionToken = (username: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return btoa(`${timestamp}-${random}-${username}`).replace(/[^a-zA-Z0-9]/g, '');
};

export interface AuthUser {
  username: string;
  isAuthenticated: boolean;
}

export const login = (username: string, password: string): boolean => {
  if (ALLOWED_USERS[username] && ALLOWED_USERS[username] === password) {
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
    return true;
  } else {
    // Manejar intentos fallidos
    const currentAuthData = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || '{}');
    currentAuthData.loginAttempts = (currentAuthData.loginAttempts || 0) + 1;
    currentAuthData.lastFailedAttempt = Date.now();
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentAuthData));
  }
  return false;
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
    
    // Verificar token de sesión
    if (auth.sessionToken !== sessionToken) {
      logout();
      return false;
    }
    
    // Verificar que no haya expirado (24 horas)
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    if (Date.now() - auth.timestamp > TWENTY_FOUR_HOURS) {
      logout();
      return false;
    }
    
    // Verificar intentos de acceso fallidos (protección básica)
    if (auth.loginAttempts && auth.loginAttempts > 5) {
      const lockoutTime = 15 * 60 * 1000; // 15 minutos
      if (Date.now() - auth.lastFailedAttempt < lockoutTime) {
        return false;
      }
    }
    
    return auth.isAuthenticated === true && ALLOWED_USERS[auth.username] !== undefined;
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

