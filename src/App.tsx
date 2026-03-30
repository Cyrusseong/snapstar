import MapView from './components/Map/MapView';
import { photozones } from './data/photozones';

export default function App() {
  return (
    <div className="h-screen flex flex-col">
      {/* 헤더 (56px) */}
      <header className="h-14 flex items-center justify-between px-4 bg-white border-b border-gray-200 shrink-0">
        <div className="text-lg font-semibold">📸 SnapStar</div>
        <div className="flex items-center gap-2">
          {/* TODO: Phase 2에서 전체보기/투어/언어 버튼 구현 */}
          <button className="px-3 py-1 text-sm border border-gray-300 rounded">🗼 전체보기</button>
          <button className="px-3 py-1 text-sm border border-gray-300 rounded">▶ 투어</button>
          <button className="px-3 py-1 text-sm border border-gray-300 rounded">KR</button>
        </div>
      </header>

      {/* 메인 영역 — 지도가 전체 채움 */}
      <main className="flex-1 relative">
        <MapView />
      </main>

      {/* 하단 네비바 (64px) */}
      <nav className="h-16 flex items-center gap-1 px-4 bg-white border-t border-gray-200 shrink-0 overflow-x-auto">
        {/* TODO: Phase 2에서 PhotoZoneNav 컴포넌트로 교체 */}
        {photozones.map((zone) => (
          <button
            key={zone.id}
            className="flex flex-col items-center justify-center px-3 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded shrink-0"
          >
            <span className="text-base">{zone.meta.icon}</span>
            <span className="whitespace-nowrap">{zone.name.ko}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
