import { API_BASE_URL } from '@/lib/api';

export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export const getContactMessages = async (): Promise<ContactMessage[]> => {
  const response = await fetch(`${API_BASE_URL}/api/contact`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('gc_token')}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch messages');
  }

  return response.json();
};

export const markMessageAsRead = async (id: string): Promise<ContactMessage> => {
  const response = await fetch(`${API_BASE_URL}/api/contact/${id}/read`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('gc_token')}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to update message');
  }

  return response.json();
};

export const deleteMessage = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/contact/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('gc_token')}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to delete message');
  }
};
