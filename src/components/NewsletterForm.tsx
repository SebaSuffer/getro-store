import { useState } from 'react';
import { subscribe } from '../utils/newsletter';

const NewsletterForm = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    const success = subscribe(email);
    
    if (success) {
      setMessage('¡Gracias por suscribirte!');
      setEmail('');
    } else {
      if (email && !email.includes('@')) {
        setMessage('Por favor ingresa un correo válido');
      } else {
        setMessage('Este correo ya está suscrito o hubo un error');
      }
    }
    
    setIsSubmitting(false);
    
    // Limpiar mensaje después de 3 segundos
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <input
        type="email"
        placeholder="Correo electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1 bg-black border border-white/20 px-4 py-3 text-white placeholder-white/40 text-sm font-light focus:outline-none focus:border-white/40 transition-colors"
        required
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-white px-8 py-3 text-black text-xs font-light uppercase tracking-[0.2em] hover:bg-white/90 transition-colors disabled:opacity-50"
      >
        {isSubmitting ? 'Suscribiendo...' : 'Suscribirse'}
      </button>
      {message && (
        <p className={`text-xs font-light ${message.includes('Gracias') ? 'text-green-400' : 'text-red-400'}`}>
          {message}
        </p>
      )}
    </form>
  );
};

export default NewsletterForm;





