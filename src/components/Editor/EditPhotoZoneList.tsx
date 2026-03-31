import type { ApiPhotoZone } from '../../lib/api';
import type { StatusFilter } from '../../hooks/useEditMode';

interface Props {
  photozones: ApiPhotoZone[];
  selectedId: string | null;
  statusFilter: StatusFilter;
  onFilterChange: (f: StatusFilter) => void;
  onSelect: (zone: ApiPhotoZone) => void;
  isLoading: boolean;
  error: string | null;
}

const STATUS_BADGE: Record<string, string> = {
  draft: 'bg-yellow-100 text-yellow-700',
  published: 'bg-green-100 text-green-700',
};

const FILTER_LABELS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'draft', label: 'Draft' },
  { key: 'published', label: 'Published' },
];

export default function EditPhotoZoneList({
  photozones,
  selectedId,
  statusFilter,
  onFilterChange,
  onSelect,
  isLoading,
  error,
}: Props) {
  const filtered = statusFilter === 'all'
    ? photozones
    : photozones.filter(z => z.status === statusFilter);

  return (
    <div className="flex flex-col h-full">
      {/* 필터 버튼 */}
      <div className="flex gap-1 p-2 border-b border-gray-200 shrink-0">
        {FILTER_LABELS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => onFilterChange(key)}
            className={`px-2 py-1 text-xs rounded border ${
              statusFilter === key
                ? 'bg-blue-500 text-white border-blue-500'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 목록 */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="p-4 text-sm text-gray-500 text-center">로딩 중...</div>
        )}
        {error && (
          <div className="p-3 m-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
            {error}
          </div>
        )}
        {!isLoading && filtered.length === 0 && !error && (
          <div className="p-4 text-sm text-gray-400 text-center">포토존 없음</div>
        )}
        {filtered.map(zone => (
          <div
            key={zone.id}
            className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
              selectedId === zone.id ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''
            }`}
            onClick={() => onSelect(zone)}
          >
            <div className="flex items-start justify-between gap-1">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {zone.icon} {zone.name_ko || zone.id}
                </div>
                <div className="text-xs text-gray-400 truncate mt-0.5">{zone.id}</div>
              </div>
              <span className={`shrink-0 text-xs px-1.5 py-0.5 rounded ${STATUS_BADGE[zone.status] ?? 'bg-gray-100 text-gray-600'}`}>
                {zone.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
