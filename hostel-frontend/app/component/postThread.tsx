"use client";

import { useState, useEffect } from "react";
import { gql } from "@apollo/client";
import type { TypedDocumentNode } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";

interface Comment {
  id: string;
  content: string;
  authorDisplayId: string;
  createdAt: string;
}

interface CommentsData {
  comments: Comment[];
}

interface CommentsVars {
  postId: string;
}

interface CreateCommentData {
  createComment: Comment;
}

interface CreateCommentVars {
  postId: string;
  content: string;
}

const GET_COMMENTS: TypedDocumentNode<CommentsData, CommentsVars> = gql`
  query GetComments($postId: String!) {
    comments(postId: $postId) {
      id
      content
      authorDisplayId
      createdAt
    }
  }
`;

const CREATE_COMMENT: TypedDocumentNode<CreateCommentData, CreateCommentVars> = gql`
  mutation CreateComment($postId: String!, $content: String!) {
    createComment(postId: $postId, content: $content) {
      id
      content
      authorDisplayId
      createdAt
    }
  }
`;

interface PostThreadProps {
  id: string;
  content: string;
  authorDisplayId: string;
  createdAt: string;
  rotation: number;
}

export function PostThread({
  id,
  content,
  authorDisplayId,
  createdAt,
  rotation,
}: PostThreadProps) {
  const [expanded, setExpanded] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const timeAgo = formatTimeAgo(createdAt);

  const { data, loading, refetch } = useQuery(GET_COMMENTS, {
    variables: { postId: id },
    skip: !expanded,
    pollInterval: expanded ? 5000 : 0,
  });

  useEffect(() => {
    if (data) {
      setHasLoadedOnce(true);
    }
  }, [data]);

  const [createComment, { loading: replying, error: replyError, reset }] =
    useMutation(CREATE_COMMENT);

  async function handleReply(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!replyText.trim()) return;

    await createComment({ variables: { postId: id, content: replyText } });
    setReplyText("");
    refetch();
  }

  const commentCount = data?.comments.length ?? 0;

  return (
    <div style={{ transform: `rotate(${rotation}deg)` }}>
      <div className="relative rounded-sm bg-[var(--color-index-card)] p-5 shadow-lg">
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

      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="mt-1 ml-4 text-xs text-[var(--color-whisper-grey)] hover:text-[var(--color-index-card)]"
      >
        {expanded
          ? "Hide replies"
          : commentCount > 0
          ? `${commentCount} ${commentCount === 1 ? "reply" : "replies"}`
          : "Reply"}
      </button>

      {expanded && (
        <div className="mt-2 ml-6 space-y-2 border-l-2 border-[var(--color-board-cork)] pl-4">
          {loading && !hasLoadedOnce && (
            <p className="text-xs text-[var(--color-whisper-grey)]">
              Loading replies...
            </p>
          )}

          {data?.comments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-sm bg-[var(--color-board-cork)] p-3"
            >
              <p className="mb-1 whitespace-pre-wrap text-sm">
                {comment.content}
              </p>
              <span className="font-mono-id text-xs text-[var(--color-whisper-grey)]">
                #{comment.authorDisplayId}
              </span>
            </div>
          ))}

          <form onSubmit={handleReply} className="pt-1">
            <textarea
              value={replyText}
              onChange={(e) => {
                setReplyText(e.target.value);
                if (replyError) reset();
              }}
              placeholder="Reply anonymously..."
              maxLength={1000}
              rows={2}
              className="mb-2 w-full resize-none rounded border border-[var(--color-whisper-grey)] bg-transparent p-2 text-sm text-[var(--color-index-card)] placeholder:text-[var(--color-whisper-grey)]"
            />

            {replyError && (
              <p className="mb-2 text-xs text-[var(--color-pin-red)]">
                {replyError.message}
              </p>
            )}

            <button
              type="submit"
              disabled={replying}
              className="rounded bg-[var(--color-lamp-amber)] px-3 py-1 text-sm font-medium text-[var(--color-cork-shadow)] disabled:opacity-50"
            >
              {replying ? "Replying..." : "Reply"}
            </button>
          </form>
        </div>
      )}
    </div>
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