import { useState, useCallback } from 'react';
import { fetchPhotozones, updatePhotozone, triggerExport, type ApiPhotoZone, type PhotoZoneUpdate } from '../lib/api';
import { calculateHeading } from '../utils/geo';
import { destinationPoint } from '../utils/geo';

export type StatusFilter = 'all' | 'draft' | 'published';

interface PinPosition {
  lat: number;
  lng: number;
}

export interface EditModeState {
  photozones: ApiPhotoZone[];
  selectedZone: ApiPhotoZone | null;
  editingData: Partial<PhotoZoneUpdate>;
  statusFilter: StatusFilter;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  shooterPosition: PinPosition;
  targetPosition: PinPosition;
  computedHeading: number;
}

const DEFAULT_TARGET_DISTANCE = 200; // m

function computeTargetPosition(zone: ApiPhotoZone): PinPosition {
  const heading = zone.heading ?? 0;
  const [tLng, tLat] = destinationPoint(zone.lat, zone.lng, DEFAULT_TARGET_DISTANCE, heading);
  return { lat: tLat, lng: tLng };
}

export function useEditMode() {
  const [photozones, setPhotozones] = useState<ApiPhotoZone[]>([]);
  const [selectedZone, setSelectedZone] = useState<ApiPhotoZone | null>(null);
  const [editingData, setEditingData] = useState<Partial<PhotoZoneUpdate>>({});
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [shooterPosition, setShooterPosition] = useState<PinPosition>({ lat: 35.6586, lng: 139.7454 });
  const [targetPosition, setTargetPosition] = useState<PinPosition>({ lat: 35.659, lng: 139.745 });
  const [computedHeading, setComputedHeading] = useState(0);

  /** API에서 포토존 목록 fetch */
  const loadPhotozones = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchPhotozones();
      setPhotozones(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : '불러오기 실패');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /** 편집할 포토존 선택 → 2핀 초기화 */
  const selectZone = useCallback((zone: ApiPhotoZone) => {
    setSelectedZone(zone);
    setEditingData({
      name_ko: zone.name_ko,
      name_en: zone.name_en,
      name_ja: zone.name_ja,
      description: zone.description,
      shooting_tip: zone.shooting_tip,
      pitch: zone.pitch ?? 0,
      fov: zone.fov ?? 60,
      crowd_level: zone.crowd_level,
      difficulty: zone.difficulty,
      best_time: zone.best_time,
      icon: zone.icon,
      category: zone.category,
    });

    const shooter: PinPosition = { lat: zone.lat, lng: zone.lng };
    const target = computeTargetPosition(zone);
    const heading = calculateHeading(shooter.lat, shooter.lng, target.lat, target.lng);

    setShooterPosition(shooter);
    setTargetPosition(target);
    setComputedHeading(heading);
  }, []);

  /** editingData 필드 업데이트 */
  const updateField = useCallback(<K extends keyof PhotoZoneUpdate>(key: K, value: PhotoZoneUpdate[K]) => {
    setEditingData(prev => ({ ...prev, [key]: value }));
  }, []);

  /** 촬영자 핀 드래그 종료 */
  const onShooterDragEnd = useCallback((lat: number, lng: number) => {
    setShooterPosition({ lat, lng });
    const heading = calculateHeading(lat, lng, targetPosition.lat, targetPosition.lng);
    setComputedHeading(heading);
  }, [targetPosition]);

  /** 타겟 핀 드래그 종료 */
  const onTargetDragEnd = useCallback((lat: number, lng: number) => {
    setTargetPosition({ lat, lng });
    const heading = calculateHeading(shooterPosition.lat, shooterPosition.lng, lat, lng);
    setComputedHeading(heading);
  }, [shooterPosition]);

  /** 저장 */
  const save = useCallback(async (asPublished: boolean) => {
    if (!selectedZone) return;
    setIsSaving(true);
    setError(null);

    const payload: PhotoZoneUpdate = {
      ...editingData,
      lat: shooterPosition.lat,
      lng: shooterPosition.lng,
      target_lat: targetPosition.lat,
      target_lng: targetPosition.lng,
      status: asPublished ? 'published' : 'draft',
    };

    try {
      await updatePhotozone(selectedZone.id, payload);
      if (asPublished) {
        await triggerExport();
      }
      // 목록 갱신
      await loadPhotozones();
      // 선택된 존 업데이트
      setSelectedZone(prev => prev ? {
        ...prev,
        ...payload,
        heading: computedHeading,
      } : null);
    } catch (e) {
      setError(e instanceof Error ? e.message : '저장 실패');
    } finally {
      setIsSaving(false);
    }
  }, [selectedZone, editingData, shooterPosition, targetPosition, computedHeading, loadPhotozones]);

  /** 전체 Export */
  const exportAll = useCallback(async (): Promise<number | null> => {
    setError(null);
    try {
      return await triggerExport();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Export 실패');
      return null;
    }
  }, []);

  return {
    photozones,
    selectedZone,
    editingData,
    statusFilter,
    setStatusFilter,
    isLoading,
    isSaving,
    error,
    setError,
    shooterPosition,
    targetPosition,
    computedHeading,
    loadPhotozones,
    selectZone,
    updateField,
    onShooterDragEnd,
    onTargetDragEnd,
    save,
    exportAll,
  };
}
