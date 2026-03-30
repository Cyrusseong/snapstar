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

export function InstagramEmbed({ postId }: { postId: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isPlaceholder = postId.startsWith('INSTAGRAM_POST_ID');

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

  if (isPlaceholder) {
    return (
      <div className="mx-4 bg-gray-100 rounded-xl flex flex-col items-center justify-center h-48 gap-2 text-gray-400">
        <span className="text-3xl">📷</span>
        <p className="text-sm">인스타 사진이 여기에 표시됩니다</p>
      </div>
    );
  }

  return <div ref={containerRef} className="px-4" />;
}
