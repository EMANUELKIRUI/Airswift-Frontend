export interface ApiRequestOptions extends RequestInit {
  token?: string;
}

export const apiClient = async (path: string, options: ApiRequestOptions = {}) => {
  const url = `${process.env.NEXT_PUBLIC_API_URL}${path}`;
  const headers = new Headers(options.headers || {});

  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.error || error.message || 'API request failed');
  }

  return response.json();
};