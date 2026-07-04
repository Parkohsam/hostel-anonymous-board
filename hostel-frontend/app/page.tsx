"use client";

import { useState } from "react";
import { gql } from "@apollo/client";
import type { TypedDocumentNode } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";
import { PostCard } from "@/app/component/postcard";

interface Post {
  id: string;
  content: string;
  authorDisplayId: string;
  createdAt: string;
}

interface PostsData {
  posts: Post[];
}

interface CreatePostData {
  createPost: Post;
}

interface CreatePostVars {
  content: string;
}

const GET_POSTS: TypedDocumentNode<PostsData> = gql`
  query GetPosts {
    posts {
      id
      content
      authorDisplayId
      createdAt
    }
  }
`;

const CREATE_POST: TypedDocumentNode<CreatePostData, CreatePostVars> = gql`
  mutation CreatePost($content: String!) {
    createPost(content: $content) {
      id
      content
      authorDisplayId
      createdAt
    }
  }
`;

function getRotation(id: string): number {
  const hash = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return (hash % 7) - 3;
}

export default function FeedPage() {
  const [content, setContent] = useState("");
  const { data, loading, error, refetch } = useQuery(GET_POSTS, {
    pollInterval: 5000,
  });
  const [createPost, { loading: posting, error: postError, reset }] =
    useMutation(CREATE_POST);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!content.trim()) return;

    await createPost({ variables: { content } });
    setContent("");
    refetch();
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-1 text-3xl">The Board</h1>
      <p className="mb-8 text-[var(--color-whisper-grey)]">
        Anonymous. For residents only.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mb-10 rounded-lg bg-[var(--color-board-cork)] p-5"
      >
        <textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            if (postError) reset();
          }}
          placeholder="Pin something to the board..."
          maxLength={2000}
          rows={3}
          className="mb-3 w-full resize-none rounded border border-[var(--color-whisper-grey)] bg-transparent p-3 text-[var(--color-index-card)] placeholder:text-[var(--color-whisper-grey)]"
        />

        {postError && (
          <p className="mb-3 text-sm text-[var(--color-pin-red)]">
            {postError.message}
          </p>
        )}

        <button
          type="submit"
          disabled={posting}
          className="rounded bg-[var(--color-lamp-amber)] px-4 py-2 font-medium text-[var(--color-cork-shadow)] disabled:opacity-50"
        >
          {posting ? "Pinning..." : "Pin to board"}
        </button>
      </form>

      {loading && (
        <p className="text-[var(--color-whisper-grey)]">Loading the board...</p>
      )}

      {error && (
        <p className="text-[var(--color-pin-red)]">
          Couldn&apos;t load posts: {error.message}
        </p>
      )}

      {data && data.posts.length === 0 && (
        <p className="text-[var(--color-whisper-grey)]">
          Nothing pinned yet. Be the first.
        </p>
      )}

      <div className="grid gap-8 sm:grid-cols-2">
        {data?.posts.map((post) => (
          <PostCard
            key={post.id}
            id={post.id}
            content={post.content}
            authorDisplayId={post.authorDisplayId}
            createdAt={post.createdAt}
            rotation={getRotation(post.id)}
          />
        ))}
      </div>
    </main>
  );
}