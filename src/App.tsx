import { useRef, useState, useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import MapView from './components/Map/MapView';
import ViewToggle from './components/UI/ViewToggle';
import PhotoZoneNav from './components/Navigation/PhotoZoneNav';
import { TourMode } from './components/Navigation/TourMode';
import { PhotoZonePanel } from './components/Panel/PhotoZonePanel';
import { BottomSheet } from './components/Panel/BottomSheet';
import { usePhotoZone } from './hooks/usePhotoZone';
import { useMap } from './hooks/useMap';
import { useTour } from './hooks/useTour';
import { usePhotozones } from './hooks/usePhotozones';
import { flyToPhotoZone, flyToOverview, toggle3DDirection, setMapLanguage, type MapLang } from './utils/camera';
import type { PhotoZone } from './types/photozone';

export default function App() {
  const mapRef = useMap();
  const { photozones, isLoading: photozonesLoading } = usePhotozones();
  const { selectedZone, setSelectedZone, clearSelection, viewMode, setViewMode } = usePhotoZone();
  const viewModeRef = useRef<'2d' | '3d'>('2d');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [lang, setLang] = useState<MapLang>('ko');
  const LANG_CYCLE: MapLang[] = ['ko', 'en', 'ja'];
  const LANG_LABEL: Record<MapLang, string> = { ko: 'KR', en: 'EN', ja: 'JP' };

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

  const tour = useTour(mapLoaded ? mapRef.current : null, photozones);

  // 투어 활성 중 currentIndex 변경 → 해당 포토존 패널 자동 표시
  useEffect(() => {
    if (tour.isActive) {
      setSelectedZone(photozones[tour.currentIndex]);
    }
  }, [tour.isActive, tour.currentIndex, setSelectedZone]);

  function handleZoneSelect(zone: PhotoZone) {
    // 투어 중 수동 클릭 → 투어 종료 후 해당 포토존 선택
    if (tour.isActive) {
      tour.stop();
    }
    setSelectedZone(zone);
    if (mapRef.current) {
      flyToPhotoZone(mapRef.current, zone, viewModeRef.current);
    }
  }

  function handleClearSelection() {
    if (tour.isActive) {
      tour.stop();
    }
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
    setMapLoaded(true);
  }

  // 언어 변경 → 지도 표기 즉시 갱신
  useEffect(() => {
    if (mapLoaded && mapRef.current) {
      setMapLanguage(mapRef.current, lang);
    }
  }, [lang, mapLoaded]);

  function handleLangToggle() {
    const next = LANG_CYCLE[(LANG_CYCLE.indexOf(lang) + 1) % LANG_CYCLE.length];
    setLang(next);
  }

  function handleTourStart() {
    clearSelection();
    setViewMode('2d');
    viewModeRef.current = '2d';
    tour.start();
  }

  return (
    <div className="h-screen flex flex-col">
      {/* 헤더 — 모바일에서 48px으로 축소 */}
      <header className="h-12 md:h-14 flex items-center justify-between px-4 bg-white border-b border-gray-200 shrink-0">
        <div className="text-base md:text-lg font-semibold">📸 SnapStar</div>
        {/* 모바일: 햄버거 + 투어 버튼 */}
        <div className="flex md:hidden items-center gap-2">
          {!tour.isActive && (
            <button
              onClick={handleTourStart}
              className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
            >
              ▶ 투어
            </button>
          )}
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
          {!tour.isActive && (
            <button
              onClick={handleTourStart}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
            >
              ▶ 투어
            </button>
          )}
          <button
            onClick={handleLangToggle}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 font-medium"
          >
            {LANG_LABEL[lang]}
          </button>
        </div>
      </header>

      {/* 투어 진행바 (투어 활성 시에만) */}
      {tour.isActive && (
        <TourMode
          zones={photozones}
          currentIndex={tour.currentIndex}
          isPaused={tour.isPaused}
          onPause={tour.pause}
          onResume={tour.resume}
          onSkip={tour.skip}
          onStop={tour.stop}
          onSkipTo={tour.skipTo}
        />
      )}

      {/* 메인 영역 */}
      <main className="flex-1 flex overflow-hidden">
        {/* 지도 + 플로팅 버튼 + 로딩 인디케이터 + 바텀시트(모바일) */}
        <div className="flex-1 relative min-w-0">
          <MapView
            zones={photozones}
            selectedZone={selectedZone}
            viewMode={viewMode}
            onZoneSelect={handleZoneSelect}
            onMapReady={handleMapReady}
          />

          {/* 맵 로딩 인디케이터 (맵 또는 포토존 데이터 로딩 중) */}
          {(!mapLoaded || photozonesLoading) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 z-10">
              <div
                className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full mb-3"
                style={{ animation: 'spin 1s linear infinite' }}
              />
              <span className="text-sm text-gray-600">🗺️ 지도 로딩 중...</span>
            </div>
          )}

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
        zones={photozones}
        selectedZone={selectedZone}
        onSelect={handleZoneSelect}
        onClearSelection={handleClearSelection}
      />
    </div>
  );
}
