import { useState, useEffect } from 'react';
import { login, isAuthenticated } from '../utils/auth';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      window.location.href = '/admin';
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(username, password);

      if (success) {
        window.location.href = '/admin';
        return;
      }

      setError('Usuario o contraseña incorrectos');
    } catch {
      setError('Error al iniciar sesión. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="username" className="block text-xs font-light uppercase tracking-[0.2em] text-black mb-2">
          Usuario
        </label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full bg-white border border-black/20 px-4 py-3 text-black text-sm font-light focus:outline-none focus:border-black/40 transition-colors"
          required
          autoComplete="username"
          aria-label="Usuario"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-xs font-light uppercase tracking-[0.2em] text-black mb-2">
          Contraseña
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-white border border-black/20 px-4 py-3 text-black text-sm font-light focus:outline-none focus:border-black/40 transition-colors"
          required
          autoComplete="current-password"
          aria-label="Contraseña"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-sm font-light" role="alert">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 bg-black text-white text-xs font-light uppercase tracking-[0.2em] hover:bg-black/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Iniciar sesión"
      >
        {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
      </button>
    </form>
  );
};

export default LoginForm;
