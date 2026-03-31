import { useEffect, useRef } from 'react';

// Instagram embed.js 글로벌 타입 선언
declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process(): void;
      };
    };
  }
}

interface Props {
  postId: string;
  thumbnailUrl?: string;
}

export function InstagramEmbed({ postId, thumbnailUrl }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isPlaceholder = !postId || postId.startsWith('INSTAGRAM_POST_ID');

  useEffect(() => {
    if (isPlaceholder || !containerRef.current) return;

    containerRef.current.innerHTML = `
      <blockquote class="instagram-media"
        data-instgrm-permalink="https://www.instagram.com/p/${postId}/"
        data-instgrm-version="14"
        style="max-width:100%; min-width:240px;">
      </blockquote>`;

    // embed.js가 이미 로드된 경우 즉시 처리
    if (window.instgrm) {
      window.instgrm.Embeds.process();
    }
  }, [postId, isPlaceholder]);

  // placeholder + thumbnailUrl 있음: 이미지로 표시
  if (isPlaceholder && thumbnailUrl) {
    return (
      <div className="mx-4 relative rounded-xl overflow-hidden shadow-md aspect-square">
        <img src={thumbnailUrl} alt="포토존 썸네일" className="w-full h-full object-cover" />
        <div className="absolute inset-0 flex items-end justify-center pb-4 bg-gradient-to-t from-black/50 to-transparent">
          <span className="text-white text-sm font-medium">📷 Instagram에서 보기</span>
        </div>
      </div>
    );
  }

  // placeholder + thumbnailUrl 없음: 기존 회색 박스
  if (isPlaceholder) {
    return (
      <div className="mx-4 bg-gray-100 rounded-xl flex flex-col items-center justify-center h-48 gap-2 text-gray-400">
        <span className="text-3xl">📷</span>
        <p className="text-sm">인스타 사진이 여기에 표시됩니다</p>
      </div>
    );
  }

  // 실제 postId: 썸네일(로딩 미리보기 + 링크) + embed
  return (
    <div className="px-4 space-y-3">
      {thumbnailUrl && (
        <a
          href={`https://www.instagram.com/p/${postId}/`}
          target="_blank"
          rel="noopener noreferrer"
          className="block relative rounded-xl overflow-hidden shadow-md aspect-square"
        >
          <img src={thumbnailUrl} alt="포토존 썸네일" className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex items-end justify-center pb-4 bg-gradient-to-t from-black/50 to-transparent">
            <span className="text-white text-sm font-medium">📷 Instagram에서 보기</span>
          </div>
        </a>
      )}
      <div ref={containerRef} />
    </div>
  );
}
