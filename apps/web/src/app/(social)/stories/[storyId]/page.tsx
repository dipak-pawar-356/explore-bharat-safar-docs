export default function StoryViewerPage({ params }: { params: { storyId: string } }) {
  return (
    <div className="max-w-md mx-auto aspect-[9/16] bg-black text-white rounded-3xl p-6 flex flex-col justify-between shadow-2xl">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-slate-400">Story ID: {params.storyId}</span>
        <span className="text-xs font-bold text-bharat-saffron-400">24h Ephemeral</span>
      </div>
      <div className="text-center text-xs text-slate-400">
        Full-screen ephemeral 24h story viewer &bull; Auto-advancing 15s progress bar &bull; Redis
        keyspace expiration.
      </div>
      <div className="h-1 bg-white/20 rounded-full overflow-hidden">
        <div className="h-full bg-bharat-saffron-500 w-1/3" />
      </div>
    </div>
  );
}
