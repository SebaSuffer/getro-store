// Utilidad para logging mejorado en consola

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const isDevelopment = import.meta.env.DEV;

export const logger = {
  info: (message: string, ...args: any[]) => {
    if (isDevelopment || typeof window !== 'undefined') {
      console.log(`[INFO] ${message}`, ...args);
    }
  },
  
  warn: (message: string, ...args: any[]) => {
    if (isDevelopment || typeof window !== 'undefined') {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },
  
  error: (message: string, error?: any, ...args: any[]) => {
    const errorDetails = error instanceof Error 
      ? { message: error.message, stack: error.stack }
      : error;
    
    console.error(`[ERROR] ${message}`, errorDetails, ...args);
    
    // En producción, podrías enviar esto a un servicio de logging
    if (!isDevelopment && typeof window !== 'undefined') {
      // Aquí podrías enviar a Sentry, LogRocket, etc.
    }
  },
  
  debug: (message: string, ...args: any[]) => {
    if (isDevelopment || typeof window !== 'undefined') {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  },
  
  api: (endpoint: string, method: string, status?: number, data?: any) => {
    const prefix = typeof window === 'undefined' ? '[API-SERVER]' : '[API-CLIENT]';
    if (status) {
      const statusEmoji = status >= 200 && status < 300 ? '✅' : '❌';
      console.log(`${prefix} ${method} ${endpoint} ${statusEmoji} ${status}`, data);
    } else {
      console.log(`${prefix} ${method} ${endpoint}`, data);
    }
  },
  
  turso: (message: string, ...args: any[]) => {
    const prefix = typeof window === 'undefined' ? '[TURSO-SERVER]' : '[TURSO-CLIENT]';
    console.log(`${prefix} ${message}`, ...args);
  },
};




