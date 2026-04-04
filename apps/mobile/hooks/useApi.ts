import { useCallback, useState } from 'react';
import { API_URL } from '../constants/api';

interface RequestOptions {
  method?: string;
  body?: unknown;
}

function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(
    async <T = unknown>(path: string, options: RequestOptions = {}): Promise<T | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_URL}${path}`, {
          method: options.method || 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          body: options.body ? JSON.stringify(options.body) : undefined,
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData?.error?.message || `HTTP ${response.status}`);
        }

        const data = await response.json();
        return data.data as T;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const registerDevice = useCallback(
    (deviceId: string, publicKey: string) => {
      return request('/api/v1/auth/register', {
        method: 'POST',
        body: { deviceId, publicKey },
      });
    },
    [request]
  );

  const listCaptures = useCallback(
    (limit = 20, offset = 0) => {
      return request(`/api/v1/captures?limit=${limit}&offset=${offset}`);
    },
    [request]
  );

  return { request, registerDevice, listCaptures, loading, error };
}

export default useApi;
