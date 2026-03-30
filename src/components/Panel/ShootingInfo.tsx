import type { PhotoZone } from '../../types/photozone';

const TIME_LABELS: Record<string, string> = {
  morning: '오전',
  afternoon: '오후',
  blue_hour: '블루아워',
  night: '야경',
};

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: '쉬움',
  medium: '보통',
  hard: '어려움',
};

function CrowdDots({ level }: { level: number }) {
  return (
    <span className="tracking-wide">
      {'●'.repeat(level)}{'○'.repeat(5 - level)}
    </span>
  );
}

export function ShootingInfo({ zone }: { zone: PhotoZone }) {
  const { meta, camera, landmark } = zone;

  return (
    <div className="px-4 space-y-3">
      {/* 촬영 팁 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <p className="text-xs font-semibold text-yellow-800 mb-1">💡 촬영 팁</p>
        <p className="text-sm text-gray-700">{meta.shootingTip}</p>
      </div>

      {/* 정보 그리드 */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="bg-gray-50 rounded-lg p-2">
          <p className="text-xs text-gray-500 mb-0.5">📐 촬영 방향</p>
          <p className="font-medium">{camera.heading}°</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <p className="text-xs text-gray-500 mb-0.5">📏 타워까지</p>
          <p className="font-medium">{landmark.distance}m</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <p className="text-xs text-gray-500 mb-0.5">👥 혼잡도</p>
          <p className="font-medium text-orange-500">
            <CrowdDots level={meta.crowdLevel} />
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <p className="text-xs text-gray-500 mb-0.5">📊 난이도</p>
          <p className="font-medium">{DIFFICULTY_LABELS[meta.difficulty]}</p>
        </div>
      </div>

      {/* 추천 시간 */}
      <div className="bg-gray-50 rounded-lg p-2">
        <p className="text-xs text-gray-500 mb-1.5">🕐 추천 시간</p>
        <div className="flex gap-1.5 flex-wrap">
          {meta.bestTime.map((t) => (
            <span
              key={t}
              className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
            >
              {TIME_LABELS[t] ?? t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
