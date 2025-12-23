const NEWSLETTER_STORAGE_KEY = 'gotra_newsletter_subscribers';

export interface Subscriber {
  email: string;
  subscribedAt: string;
}

export const subscribe = (email: string): boolean => {
  if (typeof window === 'undefined') return false;
  
  if (!email || !email.includes('@')) {
    return false;
  }

  const subscribers = getSubscribers();
  
  // Verificar si ya está suscrito
  if (subscribers.some(s => s.email.toLowerCase() === email.toLowerCase())) {
    return false; // Ya está suscrito
  }

  // Agregar nuevo suscriptor
  subscribers.push({
    email: email.toLowerCase().trim(),
    subscribedAt: new Date().toISOString(),
  });

  localStorage.setItem(NEWSLETTER_STORAGE_KEY, JSON.stringify(subscribers));
  return true;
};

export const getSubscribers = (): Subscriber[] => {
  if (typeof window === 'undefined') return [];
  
  const data = localStorage.getItem(NEWSLETTER_STORAGE_KEY);
  if (!data) return [];
  
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
};

export const exportSubscribers = (): string => {
  const subscribers = getSubscribers();
  return JSON.stringify(subscribers, null, 2);
};



