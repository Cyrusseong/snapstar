import type { PhotoZone } from '../../types/photozone';

interface ViewToggleProps {
  selectedZone: PhotoZone | null;
  viewMode: '2d' | '3d';
  onToggle: () => void;
}

// 포토존 선택 시만 표시되는 2D/3D 전환 플로팅 버튼 (좌하단)
export default function ViewToggle({ selectedZone, viewMode, onToggle }: ViewToggleProps) {
  if (!selectedZone) return null;

  return (
    <div className="absolute bottom-4 left-4 z-10">
      <button
        onClick={onToggle}
        className="px-4 py-2 bg-white rounded-lg shadow-lg border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors"
      >
        {viewMode === '2d' ? '🏔️ 3D 디렉션 보기' : '🗺️ 2D로 돌아가기'}
      </button>
    </div>
  );
}
