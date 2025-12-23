import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const Toast = ({ message, isVisible, onClose, duration = 3000 }: ToastProps) => {
  const [shouldRender, setShouldRender] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setTimeout(onClose, 300); // Esperar a que termine la animación
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed top-20 right-6 z-50 flex items-center gap-3 bg-black text-white px-6 py-4 shadow-lg transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
      }`}
      style={{ minWidth: '280px' }}
    >
      <span className="material-symbols-outlined text-white" style={{ fontSize: '20px', fontWeight: 300 }}>
        check_circle
      </span>
      <span className="text-sm font-normal text-white">{message}</span>
    </div>
  );
};

export default Toast;

