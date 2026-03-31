import type { PhotoZoneUpdate } from '../../lib/api';

const BEST_TIME_OPTIONS = [
  { key: 'morning', label: '☀ 오전' },
  { key: 'afternoon', label: '🌤 오후' },
  { key: 'blue_hour', label: '🌅 블루아워' },
  { key: 'night', label: '🌙 야경' },
];

const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: '쉬움' },
  { value: 'medium', label: '보통' },
  { value: 'hard', label: '어려움' },
];

const CATEGORY_OPTIONS = [
  { value: 'classic', label: '클래식' },
  { value: 'hidden', label: '히든' },
  { value: 'seasonal', label: '시즌' },
];

interface Props {
  data: Partial<PhotoZoneUpdate>;
  heading: number;
  isSaving: boolean;
  error: string | null;
  onUpdateField: <K extends keyof PhotoZoneUpdate>(key: K, value: PhotoZoneUpdate[K]) => void;
  onSaveDraft: () => void;
  onSavePublished: () => void;
}

export default function EditPanel({
  data,
  heading,
  isSaving,
  error,
  onUpdateField,
  onSaveDraft,
  onSavePublished,
}: Props) {
  const bestTime: string[] = (data.best_time as string[]) ?? [];

  function toggleBestTime(key: string) {
    const next = bestTime.includes(key)
      ? bestTime.filter(t => t !== key)
      : [...bestTime, key];
    onUpdateField('best_time', next);
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {error && (
        <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
          {error}
        </div>
      )}

      {/* 계산된 heading 표시 */}
      <div className="text-xs text-gray-500 bg-gray-50 rounded p-2">
        📐 Heading: <strong>{Math.round(heading)}°</strong>
        &nbsp;| Pitch: <strong>{data.pitch ?? 0}°</strong>
        &nbsp;| FOV: <strong>{data.fov ?? 60}°</strong>
      </div>

      {/* 이름 */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-600">이름 (KO)</label>
        <input
          type="text"
          value={data.name_ko ?? ''}
          onChange={e => onUpdateField('name_ko', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-400"
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-600">이름 (EN)</label>
        <input
          type="text"
          value={data.name_en ?? ''}
          onChange={e => onUpdateField('name_en', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-400"
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-600">이름 (JA)</label>
        <input
          type="text"
          value={data.name_ja ?? ''}
          onChange={e => onUpdateField('name_ja', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-400"
        />
      </div>

      {/* 설명 */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-600">설명</label>
        <textarea
          value={data.description ?? ''}
          onChange={e => onUpdateField('description', e.target.value)}
          rows={2}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-400 resize-none"
        />
      </div>

      {/* 촬영 팁 */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-600">촬영 팁</label>
        <textarea
          value={data.shooting_tip ?? ''}
          onChange={e => onUpdateField('shooting_tip', e.target.value)}
          rows={2}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-400 resize-none"
        />
      </div>

      {/* Pitch 슬라이더 */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-600">
          Pitch: <span className="font-bold">{data.pitch ?? 0}°</span>
        </label>
        <input
          type="range"
          min={-30}
          max={30}
          step={1}
          value={data.pitch ?? 0}
          onChange={e => onUpdateField('pitch', Number(e.target.value))}
          className="w-full"
        />
      </div>

      {/* FOV 슬라이더 */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-600">
          FOV: <span className="font-bold">{data.fov ?? 60}°</span>
        </label>
        <input
          type="range"
          min={20}
          max={120}
          step={1}
          value={data.fov ?? 60}
          onChange={e => onUpdateField('fov', Number(e.target.value))}
          className="w-full"
        />
      </div>

      {/* 혼잡도 */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-600">
          혼잡도: <span className="font-bold">{data.crowd_level ?? 3}</span>
        </label>
        <input
          type="range"
          min={1}
          max={5}
          step={1}
          value={data.crowd_level ?? 3}
          onChange={e => onUpdateField('crowd_level', Number(e.target.value))}
          className="w-full"
        />
      </div>

      {/* 난이도 */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-600">난이도</label>
        <select
          value={data.difficulty ?? 'medium'}
          onChange={e => onUpdateField('difficulty', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-400"
        >
          {DIFFICULTY_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* 추천 시간 */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-600">추천 시간</label>
        <div className="flex flex-wrap gap-1">
          {BEST_TIME_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => toggleBestTime(key)}
              className={`px-2 py-1 text-xs rounded border ${
                bestTime.includes(key)
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 카테고리 */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-600">카테고리</label>
        <select
          value={data.category ?? 'classic'}
          onChange={e => onUpdateField('category', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-400"
        >
          {CATEGORY_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* 아이콘 */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-600">아이콘 (이모지)</label>
        <input
          type="text"
          value={data.icon ?? '📸'}
          onChange={e => onUpdateField('icon', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-400"
        />
      </div>

      {/* 저장 버튼 */}
      <div className="flex flex-col gap-2 pt-2 border-t border-gray-200">
        <button
          onClick={onSaveDraft}
          disabled={isSaving}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
        >
          {isSaving ? '저장 중...' : '💾 저장 (draft)'}
        </button>
        <button
          onClick={onSavePublished}
          disabled={isSaving}
          className="w-full px-3 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {isSaving ? '저장 중...' : '✅ Published로 저장'}
        </button>
      </div>
    </div>
  );
}
