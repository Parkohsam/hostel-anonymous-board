import Link from "next/link";

interface PostCardProps {
  id: string;
  content: string;
  authorDisplayId: string;
  createdAt: string;
  rotation: number;
}

export function PostCard({
  id,
  content,
  authorDisplayId,
  createdAt,
  rotation,
}: PostCardProps) {
  const timeAgo = formatTimeAgo(createdAt);

  return (
    <Link href={`/post/${id}`} className="block">
      <div
        className="relative rounded-sm bg-[var(--color-index-card)] p-5 shadow-lg transition-transform hover:scale-[1.02]"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <div className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-[var(--color-pin-red)] shadow-md" />

        <p className="mb-4 whitespace-pre-wrap text-[var(--color-cork-shadow)]">
          {content}
        </p>

        <div className="flex items-center justify-between text-xs">
          <span className="font-mono-id text-[var(--color-board-cork)]">
            #{authorDisplayId}
          </span>
          <span className="text-[var(--color-whisper-grey)]">{timeAgo}</span>
        </div>
      </div>
    </Link>
  );
}

function formatTimeAgo(isoDate: string): string {
  const seconds = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}