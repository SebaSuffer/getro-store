export interface Subscriber {
  id?: number;
  email: string;
  name?: string;
  subscribedAt?: string;
  isActive?: boolean;
}

// Suscribir email al newsletter
export const subscribe = async (email: string, name?: string): Promise<boolean> => {
  if (!email || !email.includes('@')) {
    return false;
  }

  try {
    const response = await fetch('/api/newsletter/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Error subscribing:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error subscribing:', error);
    return false;
  }
};

// Obtener todos los suscriptores
export const getSubscribers = async (): Promise<Subscriber[]> => {
  try {
    const response = await fetch('/api/newsletter/subscribers');
    if (!response.ok) {
      return [];
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    return [];
  }
};

// Exportar suscriptores como JSON
export const exportSubscribers = async (): Promise<string> => {
  const subscribers = await getSubscribers();
  return JSON.stringify(subscribers, null, 2);
};
