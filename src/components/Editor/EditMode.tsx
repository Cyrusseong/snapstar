/**
 * 에디트 모드 메인 컨테이너 (?mode=edit)
 * 뷰 모드와 완전히 분리된 독립 컴포넌트
 */
import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { useEditMode } from '../../hooks/useEditMode';
import EditPhotoZoneList from './EditPhotoZoneList';
import DraggablePin from './DraggablePin';
import EditPanel from './EditPanel';

export default function EditMode() {
  const edit = useEditMode();
  const editMapRef = useRef<maplibregl.Map | null>(null);
  const [exportMsg, setExportMsg] = useState<string | null>(null);

  // 마운트 시 포토존 목록 로드
  useEffect(() => {
    edit.loadPhotozones();
  }, []);

  // 존 선택 시 맵 중심 이동
  function handleSelectZone(zone: Parameters<typeof edit.selectZone>[0]) {
    edit.selectZone(zone);
    if (editMapRef.current) {
      editMapRef.current.flyTo({
        center: [zone.lng, zone.lat],
        zoom: 17,
        duration: 800,
      });
    }
  }

  // 저장 (draft)
  async function handleSaveDraft() {
    await edit.save(false);
  }

  // 저장 (published)
  async function handleSavePublished() {
    await edit.save(true);
    if (!edit.error) {
      setExportMsg('✅ Published로 저장 및 Export 완료');
      setTimeout(() => setExportMsg(null), 3000);
    }
  }

  // 전체 Export
  async function handleExportAll() {
    const count = await edit.exportAll();
    if (count !== null) {
      setExportMsg(`✅ Export 완료 (${count}건)`);
      setTimeout(() => setExportMsg(null), 3000);
    }
  }

  // 뷰 모드 복귀
  function handleBackToView() {
    const url = new URL(window.location.href);
    url.searchParams.delete('mode');
    window.location.href = url.toString();
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* 에디터 헤더 */}
      <header className="h-12 flex items-center justify-between px-4 bg-white border-b border-gray-200 shrink-0 z-10">
        <div className="text-sm font-semibold text-gray-800">📸 SnapStar Editor</div>
        <div className="flex items-center gap-2">
          {exportMsg && (
            <span className="text-xs text-green-600 font-medium">{exportMsg}</span>
          )}
          {edit.error && (
            <span className="text-xs text-red-600 truncate max-w-64">{edit.error}</span>
          )}
          <button
            onClick={handleExportAll}
            className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
          >
            💾 전체 Export
          </button>
          <button
            onClick={handleBackToView}
            className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
          >
            🔙 뷰
          </button>
        </div>
      </header>

      {/* 메인 레이아웃: 목록 | 맵 | 에디트 패널 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 좌측: 포토존 목록 (250px) */}
        <div className="w-[250px] shrink-0 border-r border-gray-200 bg-white flex flex-col overflow-hidden">
          <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
            포토존 목록 ({edit.photozones.length})
          </div>
          <div className="flex-1 overflow-hidden">
            <EditPhotoZoneList
              photozones={edit.photozones}
              selectedId={edit.selectedZone?.id ?? null}
              statusFilter={edit.statusFilter}
              onFilterChange={edit.setStatusFilter}
              onSelect={handleSelectZone}
              isLoading={edit.isLoading}
              error={edit.isLoading ? null : (edit.error && !edit.selectedZone ? edit.error : null)}
            />
          </div>
        </div>

        {/* 중앙: 맵 */}
        <div className="flex-1 relative min-w-0">
          {edit.selectedZone ? (
            <DraggablePin
              shooterLat={edit.shooterPosition.lat}
              shooterLng={edit.shooterPosition.lng}
              targetLat={edit.targetPosition.lat}
              targetLng={edit.targetPosition.lng}
              heading={edit.computedHeading}
              fov={Number(edit.editingData.fov ?? edit.selectedZone.fov ?? 60)}
              pitch={Number(edit.editingData.pitch ?? edit.selectedZone.pitch ?? 0)}
              onShooterDragEnd={edit.onShooterDragEnd}
              onTargetDragEnd={edit.onTargetDragEnd}
              onMapReady={(map) => { editMapRef.current = map; }}
            />
          ) : (
            <EmptyMapPlaceholder />
          )}

          {/* 핀 범례 */}
          {edit.selectedZone && (
            <div className="absolute bottom-4 left-4 bg-white rounded shadow-md px-3 py-2 text-xs space-y-1 z-10">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span>
                <span>📍 촬영자 위치 (드래그)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
                <span>🎯 촬영 방향 (드래그)</span>
              </div>
            </div>
          )}
        </div>

        {/* 우측: 에디트 패널 (300px) */}
        {edit.selectedZone && (
          <div className="w-[300px] shrink-0 border-l border-gray-200 bg-white flex flex-col overflow-hidden">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100 shrink-0">
              {edit.selectedZone.icon} {edit.selectedZone.name_ko || edit.selectedZone.id}
            </div>
            <div className="flex-1 overflow-hidden">
              <EditPanel
                data={edit.editingData}
                heading={edit.computedHeading}
                isSaving={edit.isSaving}
                error={edit.isSaving || edit.selectedZone ? edit.error : null}
                onUpdateField={edit.updateField}
                onSaveDraft={handleSaveDraft}
                onSavePublished={handleSavePublished}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyMapPlaceholder() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400">
      <div className="text-4xl mb-3">🗺️</div>
      <div className="text-sm">좌측 목록에서 포토존을 선택하세요</div>
    </div>
  );
}
