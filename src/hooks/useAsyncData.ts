import { useEffect, useState } from 'react';

interface UseAsyncDataOptions<T> {
  data: T;
  delay?: number;
  enabled?: boolean;
}

interface UseAsyncDataResult<T> {
  data: T;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useAsyncData<T>({
  data,
  delay = 1000,
  enabled = true,
}: UseAsyncDataOptions<T>): UseAsyncDataResult<T> {
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const timer = window.setTimeout(() => {
      setLoading(false);
    }, delay);

    return () => window.clearTimeout(timer);
  }, [delay, enabled, reloadKey]);

  const reload = () => setReloadKey((prev) => prev + 1);

  return { data, loading, error, reload };
}
