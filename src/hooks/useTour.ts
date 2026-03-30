import { useState, useEffect, useCallback, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import type { PhotoZone } from '../types/photozone';
import { flyToPhotoZone } from '../utils/camera';

export function useTour(map: maplibregl.Map | null, zones: PhotoZone[]) {
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // stale closure 방지: 타이머 콜백에서 최신 상태 참조
  const currentIndexRef = useRef(0);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { mapRef.current = map; }, [map]);

  // 5초 간격 자동 이동 (활성 + 일시정지 아닐 때)
  useEffect(() => {
    if (!isActive || isPaused || !map) return;

    const timer = setTimeout(() => {
      const next = (currentIndexRef.current + 1) % zones.length;
      setCurrentIndex(next);
      if (mapRef.current) flyToPhotoZone(mapRef.current, zones[next], '2d');
    }, 5000);

    return () => clearTimeout(timer);
  }, [isActive, isPaused, currentIndex, map, zones]);

  const start = useCallback(() => {
    setCurrentIndex(0);
    currentIndexRef.current = 0;
    setIsActive(true);
    setIsPaused(false);
    if (mapRef.current) flyToPhotoZone(mapRef.current, zones[0], '2d');
  }, [zones]);

  const stop = useCallback(() => {
    setIsActive(false);
    setIsPaused(false);
  }, []);

  const pause = useCallback(() => setIsPaused(true), []);
  const resume = useCallback(() => setIsPaused(false), []);

  const skip = useCallback(() => {
    const next = (currentIndexRef.current + 1) % zones.length;
    setCurrentIndex(next);
    if (mapRef.current) flyToPhotoZone(mapRef.current, zones[next], '2d');
  }, [zones]);

  const skipTo = useCallback((index: number) => {
    setCurrentIndex(index);
    currentIndexRef.current = index;
    if (mapRef.current) flyToPhotoZone(mapRef.current, zones[index], '2d');
  }, [zones]);

  return { isActive, isPaused, currentIndex, start, stop, pause, resume, skip, skipTo };
}
