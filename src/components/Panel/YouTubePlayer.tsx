export function YouTubePlayer({ videoId }: { videoId: string }) {
  const isPlaceholder = videoId.startsWith('YOUTUBE_VIDEO_ID');

  if (isPlaceholder) {
    return (
      <div className="mx-4 bg-gray-100 rounded-xl flex flex-col items-center justify-center aspect-video gap-2 text-gray-400">
        <span className="text-3xl">🎬</span>
        <p className="text-sm">유튜브 영상이 여기에 표시됩니다</p>
      </div>
    );
  }

  return (
    <div className="mx-4">
      <div className="aspect-video rounded-xl overflow-hidden">
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="YouTube video"
        />
      </div>
    </div>
  );
}
