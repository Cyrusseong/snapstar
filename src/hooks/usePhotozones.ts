import { useState, useEffect } from 'react';
import type { PhotoZone } from '../types/photozone';
import { FALLBACK_PHOTOZONES } from '../data/photozones';

interface UsePhotozonesResult {
  photozones: PhotoZone[];
  isLoading: boolean;
  error: string | null;
}

export function usePhotozones(): UsePhotozonesResult {
  const [photozones, setPhotozones] = useState<PhotoZone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch('/data/photozones.json')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: PhotoZone[]) => {
        if (cancelled) return;
        // 빈 배열이면 폴백 사용
        if (Array.isArray(data) && data.length > 0) {
          setPhotozones(data);
        } else {
          console.warn('JSON fetch 실패, 폴백 데이터 사용');
          setPhotozones(FALLBACK_PHOTOZONES);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.warn('JSON fetch 실패, 폴백 데이터 사용', err);
        setPhotozones(FALLBACK_PHOTOZONES);
        setError(err.message);
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { photozones, isLoading, error };
}
