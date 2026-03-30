import { photozones } from '../../data/photozones';
import type { PhotoZone } from '../../types/photozone';

interface PhotoZoneNavProps {
  selectedZone: PhotoZone | null;
  onSelect: (zone: PhotoZone) => void;
  onClearSelection: () => void;
}

// 하단 네비게이션 바 — 전체보기 + 7개 포토존 선택
export default function PhotoZoneNav({ selectedZone, onSelect, onClearSelection }: PhotoZoneNavProps) {
  return (
    <nav className="h-16 flex items-center gap-1 px-4 bg-white border-t border-gray-200 shrink-0 overflow-x-auto">
      {/* 전체보기 버튼 */}
      <button
        onClick={onClearSelection}
        className={`flex flex-col items-center justify-center px-3 py-1 text-xs rounded shrink-0 transition-colors ${
          !selectedZone
            ? 'bg-blue-50 text-blue-600 border border-blue-200'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        <span className="text-base">🗼</span>
        <span className="whitespace-nowrap">전체보기</span>
      </button>

      {/* 7개 포토존 */}
      {photozones.map((zone) => (
        <button
          key={zone.id}
          onClick={() => onSelect(zone)}
          className={`flex flex-col items-center justify-center px-3 py-1 text-xs rounded shrink-0 transition-colors ${
            selectedZone?.id === zone.id
              ? 'bg-blue-50 text-blue-600 border border-blue-200'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <span className="text-base">{zone.meta.icon}</span>
          <span className="whitespace-nowrap">{zone.name.ko}</span>
        </button>
      ))}
    </nav>
  );
}
