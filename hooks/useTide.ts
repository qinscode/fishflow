import { useEffect, useMemo, useState } from 'react';
import { getTodayTideSummary, TideSummary } from '@/lib/tide';

export interface UseTideOptions {
  smoothWindow?: number;
  stepMinutes?: number;
  now?: Date;
}

export function useTide(lat: number | undefined, lon: number | undefined, opts?: UseTideOptions) {
  const [data, setData] = useState<TideSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const params = useMemo(() => ({ lat, lon, opts }), [lat, lon, opts?.smoothWindow, opts?.stepMinutes, opts?.now?.getTime?.()]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (typeof params.lat !== 'number' || typeof params.lon !== 'number') return;
      setLoading(true);
      setError(null);
      try {
        const res = await getTodayTideSummary(params.lat, params.lon, params.opts);
        if (!cancelled) setData(res);
      } catch (e) {
        if (!cancelled) setError(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [params]);

  return { data, loading, error };
}

export default useTide;

