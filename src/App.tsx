import { useRef, useState, useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import MapView from './components/Map/MapView';
import ViewToggle from './components/UI/ViewToggle';
import PhotoZoneNav from './components/Navigation/PhotoZoneNav';
import { PhotoZonePanel } from './components/Panel/PhotoZonePanel';
import { BottomSheet } from './components/Panel/BottomSheet';
import { usePhotoZone } from './hooks/usePhotoZone';
import { useMap } from './hooks/useMap';
import { flyToPhotoZone, flyToOverview, toggle3DDirection } from './utils/camera';
import type { PhotoZone } from './types/photozone';

export default function App() {
  const mapRef = useMap();
  const { selectedZone, setSelectedZone, clearSelection, viewMode, setViewMode } = usePhotoZone();
  const viewModeRef = useRef<'2d' | '3d'>('2d');

  // 반응형 모바일/데스크탑 분기 (768px 기준)
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  function handleZoneSelect(zone: PhotoZone) {
    setSelectedZone(zone);
    if (mapRef.current) {
      flyToPhotoZone(mapRef.current, zone, viewModeRef.current);
    }
  }

  function handleClearSelection() {
    clearSelection();
    setViewMode('2d');
    viewModeRef.current = '2d';
    if (mapRef.current) {
      flyToOverview(mapRef.current);
    }
  }

  function handleToggleViewMode() {
    const newMode = viewMode === '2d' ? '3d' : '2d';
    setViewMode(newMode);
    viewModeRef.current = newMode;
    if (mapRef.current) {
      toggle3DDirection(mapRef.current, newMode === '3d');
    }
  }

  function handleMapReady(map: maplibregl.Map) {
    mapRef.current = map;
  }

  return (
    <div className="h-screen flex flex-col">
      {/* 헤더 — 모바일에서 48px으로 축소 */}
      <header className="h-12 md:h-14 flex items-center justify-between px-4 bg-white border-b border-gray-200 shrink-0">
        <div className="text-base md:text-lg font-semibold">📸 SnapStar</div>
        {/* 모바일: 햄버거만 표시 */}
        <div className="flex md:hidden items-center">
          <button className="w-8 h-8 flex items-center justify-center text-gray-600" aria-label="메뉴">
            ≡
          </button>
        </div>
        {/* 데스크탑: 전체 버튼 */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={handleClearSelection}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
          >
            🗼 전체보기
          </button>
          <button className="px-3 py-1 text-sm border border-gray-300 rounded">▶ 투어</button>
          <button className="px-3 py-1 text-sm border border-gray-300 rounded">KR</button>
        </div>
      </header>

      {/* 메인 영역 */}
      <main className="flex-1 flex overflow-hidden">
        {/* 지도 + 플로팅 버튼 + 바텀시트(모바일) */}
        <div className="flex-1 relative min-w-0">
          <MapView
            selectedZone={selectedZone}
            viewMode={viewMode}
            onZoneSelect={handleZoneSelect}
            onMapReady={handleMapReady}
          />
          <ViewToggle
            selectedZone={selectedZone}
            viewMode={viewMode}
            onToggle={handleToggleViewMode}
          />
          {/* 모바일 바텀시트 — 지도 위에 absolute */}
          {isMobile && (
            <BottomSheet zone={selectedZone} onClose={handleClearSelection} />
          )}
        </div>

        {/* 데스크탑 사이드 패널 */}
        {!isMobile && (
          <PhotoZonePanel zone={selectedZone} onClose={handleClearSelection} />
        )}
      </main>

      {/* 하단 네비바 */}
      <PhotoZoneNav
        selectedZone={selectedZone}
        onSelect={handleZoneSelect}
        onClearSelection={handleClearSelection}
      />
    </div>
  );
}
