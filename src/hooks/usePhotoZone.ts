import { useState } from 'react';
import type { PhotoZone } from '../types/photozone';

export function usePhotoZone() {
  const [selectedZone, setSelectedZone] = useState<PhotoZone | null>(null);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');

  function clearSelection() {
    setSelectedZone(null);
  }

  return { selectedZone, setSelectedZone, clearSelection, viewMode, setViewMode };
}
