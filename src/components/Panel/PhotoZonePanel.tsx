import type { PhotoZone } from '../../types/photozone';
import { InstagramEmbed } from './InstagramEmbed';
import { YouTubePlayer } from './YouTubePlayer';
import { ShootingInfo } from './ShootingInfo';

const CATEGORY_LABELS: Record<string, string> = {
  classic: '클래식',
  hidden: '히든스팟',
  seasonal: '시즌한정',
};

interface Props {
  zone: PhotoZone | null;
  onClose: () => void;
}

export function PhotoZonePanel({ zone, onClose }: Props) {
  return (
    <div
      className="shrink-0 bg-white border-l border-gray-200 flex flex-col overflow-hidden"
      style={{
        width: zone ? 400 : 0,
        transition: 'width 0.3s ease-in-out',
        opacity: zone ? 1 : 0,
      }}
    >
      {zone && (
        <>
          {/* 패널 헤더 */}
          <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-2xl shrink-0">{zone.meta.icon}</span>
              <div className="min-w-0">
                <h2 className="font-semibold text-gray-900 truncate">{zone.name.ko}</h2>
                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                  {CATEGORY_LABELS[zone.meta.category] ?? zone.meta.category}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 ml-2"
              aria-label="패널 닫기"
            >
              ✕
            </button>
          </div>

          {/* 스크롤 가능한 콘텐츠 영역 */}
          <div className="flex-1 overflow-y-auto">
            <div className="py-4 space-y-4">
              <InstagramEmbed postId={zone.content.instagramPostId} thumbnailUrl={zone.content.thumbnailUrl} />
              <ShootingInfo zone={zone} />
              <YouTubePlayer videoId={zone.content.youtubeVideoId} />

              {/* 액션 버튼 */}
              <div className="px-4 flex gap-2 pb-2">
                <button
                  onClick={() => alert('길찾기 기능은 준비 중입니다')}
                  className="flex-1 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 active:bg-gray-100"
                >
                  🗺️ 길찾기 열기
                </button>
                <button
                  onClick={() => alert('공유 기능은 준비 중입니다')}
                  className="flex-1 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 active:bg-gray-100"
                >
                  📤 공유하기
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
