import { useState, useRef, useEffect, useCallback } from 'react';
import type { PhotoZone } from '../../types/photozone';
import { InstagramEmbed } from './InstagramEmbed';
import { YouTubePlayer } from './YouTubePlayer';
import { ShootingInfo } from './ShootingInfo';

type SnapState = 'collapsed' | 'middle' | 'expanded';

// 헤더 56px + 네비바 64px = 120px 제외
const SNAP_HEIGHTS: Record<SnapState, string> = {
  collapsed: '120px',
  middle: '55vh',
  expanded: 'calc(100vh - 120px)',
};

interface Props {
  zone: PhotoZone | null;
  onClose: () => void;
}

export function BottomSheet({ zone, onClose }: Props) {
  const [snap, setSnap] = useState<SnapState>('middle');
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number | null>(null);
  const dragStartHeight = useRef<number>(0);
  const isDragging = useRef(false);

  // zone이 바뀌면 middle로 리셋
  useEffect(() => {
    if (zone) setSnap('middle');
  }, [zone?.id]);

  const getSnapFromHeight = useCallback((h: number): SnapState => {
    const vh = window.innerHeight;
    if (h < 90) return 'collapsed'; // onClose 처리는 아래서
    if (h < vh * 0.35) return 'collapsed';
    if (h < vh * 0.75) return 'middle';
    return 'expanded';
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
    dragStartHeight.current = sheetRef.current?.getBoundingClientRect().height ?? 0;
    isDragging.current = true;
    if (sheetRef.current) {
      // 드래그 중에는 트랜지션 비활성화
      sheetRef.current.style.transition = 'none';
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || dragStartY.current === null || !sheetRef.current) return;
    const delta = dragStartY.current - e.touches[0].clientY; // 위로 드래그 = 양수
    const newH = Math.max(60, Math.min(window.innerHeight - 120, dragStartHeight.current + delta));
    sheetRef.current.style.height = `${newH}px`;
  };

  const handleTouchEnd = () => {
    if (!isDragging.current || !sheetRef.current) return;
    isDragging.current = false;

    const currentH = sheetRef.current.getBoundingClientRect().height;

    // 트랜지션 다시 활성화 후 인라인 height 초기화 (CSS 스냅)
    sheetRef.current.style.transition = '';
    sheetRef.current.style.height = '';

    if (currentH < 90) {
      onClose();
      return;
    }

    const newSnap = getSnapFromHeight(currentH);
    setSnap(newSnap);
    dragStartY.current = null;
  };

  // 핸들 클릭으로 상태 순환 (Desktop 테스트 용이)
  const handleClick = () => {
    if (isDragging.current) return;
    const order: SnapState[] = ['collapsed', 'middle', 'expanded'];
    const next = order[(order.indexOf(snap) + 1) % order.length];
    setSnap(next);
  };

  if (!zone) return null;

  return (
    <div
      ref={sheetRef}
      className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl flex flex-col z-20"
      style={{
        height: SNAP_HEIGHTS[snap],
        transition: 'height 0.3s ease-in-out',
        overflow: 'hidden',
      }}
    >
      {/* 드래그 핸들 */}
      <div
        className="shrink-0 flex flex-col items-center pt-2.5 pb-1.5 cursor-grab active:cursor-grabbing select-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
      >
        <div className="w-10 h-1 bg-gray-300 rounded-full" />
      </div>

      {/* 포토존 제목 (항상 표시) */}
      <div className="shrink-0 px-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl shrink-0">{zone.meta.icon}</span>
          <div className="min-w-0">
            <h2 className="font-semibold text-gray-900 text-sm truncate">{zone.name.ko}</h2>
            <p className="text-xs text-gray-500 truncate">{zone.meta.description}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 ml-2"
          aria-label="닫기"
        >
          ✕
        </button>
      </div>

      {/* 스크롤 콘텐츠 */}
      <div className="flex-1 overflow-y-auto">
        <div className="py-2 space-y-4 pb-4">
          <InstagramEmbed postId={zone.content.instagramPostId} thumbnailUrl={zone.content.thumbnailUrl} />
          <ShootingInfo zone={zone} />
          <YouTubePlayer videoId={zone.content.youtubeVideoId} />

          {/* 액션 버튼 */}
          <div className="px-4 flex gap-2">
            <button
              onClick={() => alert('길찾기 기능은 준비 중입니다')}
              className="flex-1 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
            >
              🗺️ 길찾기 열기
            </button>
            <button
              onClick={() => alert('공유 기능은 준비 중입니다')}
              className="flex-1 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
            >
              📤 공유하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
