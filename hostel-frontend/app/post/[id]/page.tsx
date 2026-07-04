"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { gql } from "@apollo/client";
import type { TypedDocumentNode } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";

interface Post {
    id: string;
    content: string;
    authorDisplayId: string;
    createdAt: string;
}

interface Comment {
    id: string;
    content: string;
    authorDisplayId: string;
    createdAt: string;
}

interface PostData {
    post: Post;
}

interface PostVars {
    id: string;
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

const GET_POST: TypedDocumentNode<PostData, PostVars> = gql`
  query GetPost($id: ID!) {
    post(id: $id) {
      id
      content
      authorDisplayId
      createdAt
    }
  }
`;

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

export default function PostDetailPage() {
    const params = useParams<{ id: string }>();
    const postId = params.id;

    const [replyText, setReplyText] = useState("");

    const { data: postData, loading: postLoading } = useQuery(GET_POST, {
        variables: { id: postId },
        pollInterval: 5000,
    });

    const {
        data: commentsData,
        loading: commentsLoading,
        refetch: refetchComments,
    } = useQuery(GET_COMMENTS, {
        variables: { postId },
        pollInterval: 5000,
    });

    const [createComment, { loading: replying, error: replyError, reset }] =
        useMutation(CREATE_COMMENT);

    async function handleReply(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!replyText.trim()) return;

        await createComment({ variables: { postId, content: replyText } });
        setReplyText("");
        refetchComments();
    }

    if (postLoading) {
        return (
            <main className="mx-auto max-w-2xl px-4 py-10">
                <p className="text-[var(--color-whisper-grey)]">Loading...</p>
            </main>
        );
    }

    return (
        <main className="mx-auto max-w-2xl px-4 py-10">
            {postData && (
                <div className="mb-8 rounded-sm bg-[var(--color-index-card)] p-6">
                    <p className="mb-4 whitespace-pre-wrap text-[var(--color-cork-shadow)]">
                        {postData.post.content}
                    </p>
                    <span className="font-mono-id text-xs text-[var(--color-board-cork)]">
                        #{postData.post.authorDisplayId}
                    </span>
                </div>
            )}

            <form
                onSubmit={handleReply}
                className="mb-8 rounded-lg bg-[var(--color-board-cork)] p-5"
            >
                <textarea
                    value={replyText}
                    onChange={(e) => {
                        setReplyText(e.target.value);
                        if (replyError) reset();
                    }}
                    placeholder="Reply anonymously..."
                    maxLength={1000}
                    rows={2}
                    className="mb-3 w-full resize-none rounded border border-[var(--color-whisper-grey)] bg-transparent p-3 text-[var(--color-index-card)] placeholder:text-[var(--color-whisper-grey)]"
                />

                {replyError && (
                    <p className="mb-3 text-sm text-[var(--color-pin-red)]">
                        {replyError.message}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={replying}
                    className="rounded bg-[var(--color-lamp-amber)] px-4 py-2 font-medium text-[var(--color-cork-shadow)] disabled:opacity-50"
                >
                    {replying ? "Replying..." : "Reply"}
                </button>
            </form>

            <div className="space-y-4">
                {commentsLoading && (
                    <p className="text-[var(--color-whisper-grey)]">Loading replies...</p>
                )}

                {commentsData && commentsData.comments.length === 0 && (
                    <p className="text-[var(--color-whisper-grey)]">
                        No replies yet. Be the first.
                    </p>
                )}

                {commentsData?.comments.map((comment) => (
                    <div
                        key={comment.id}
                        className="rounded border border-[var(--color-board-cork)] p-4"
                    >
                        <p className="mb-2 whitespace-pre-wrap">{comment.content}</p>
                        <span className="font-mono-id text-xs text-[var(--color-whisper-grey)]">
                            #{comment.authorDisplayId}
                        </span>
                    </div>
                ))}
            </div>
        </main>
    );
}