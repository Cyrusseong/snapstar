import type { PhotoZone } from '../../types/photozone';

interface TourModeProps {
  zones: PhotoZone[];
  currentIndex: number;
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onSkip: () => void;
  onStop: () => void;
  onSkipTo: (index: number) => void;
}

export function TourMode({
  zones,
  currentIndex,
  isPaused,
  onPause,
  onResume,
  onSkip,
  onStop,
  onSkipTo,
}: TourModeProps) {
  const progressPercent = ((currentIndex + 1) / zones.length) * 100;

  return (
    <div
      className="shrink-0 border-b border-gray-200"
      style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)' }}
    >
      {/* 스텝 목록 + 컨트롤 버튼 */}
      <div className="flex items-center gap-2 px-3 py-2 overflow-x-auto">
        {/* 스텝 아이콘 */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {zones.map((zone, i) => (
            <div key={zone.id} className="flex items-center">
              <button
                onClick={() => onSkipTo(i)}
                className={`flex flex-col items-center justify-center w-8 h-8 rounded-full text-sm transition-all ${
                  i === currentIndex
                    ? 'bg-blue-600 text-white scale-110 shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={zone.name.ko}
              >
                <span className="text-xs leading-none">{zone.meta.icon}</span>
              </button>
              {i < zones.length - 1 && (
                <div
                  className={`w-4 h-0.5 mx-0.5 ${i < currentIndex ? 'bg-blue-500' : 'bg-gray-300'}`}
                />
              )}
            </div>
          ))}
        </div>

        {/* 현재 포토존 이름 */}
        <div className="flex-shrink-0 text-xs text-gray-600 font-medium min-w-0 hidden sm:block">
          {zones[currentIndex].name.ko}
        </div>

        {/* 컨트롤 버튼 (우측 정렬) */}
        <div className="ml-auto flex items-center gap-1 flex-shrink-0">
          <button
            onClick={isPaused ? onResume : onPause}
            className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 whitespace-nowrap"
            title={isPaused ? '재개' : '일시정지'}
          >
            {isPaused ? '▶ 재개' : '⏸ 일시정지'}
          </button>
          <button
            onClick={onSkip}
            className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
            title="건너뛰기"
          >
            ⏭ 건너뛰기
          </button>
          <button
            onClick={onStop}
            className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 text-gray-500"
            title="투어 종료"
          >
            ✕ 종료
          </button>
        </div>
      </div>

      {/* 진행 프로그레스 바 */}
      <div className="h-1 bg-gray-200">
        <div
          className="h-1 bg-blue-500 transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
