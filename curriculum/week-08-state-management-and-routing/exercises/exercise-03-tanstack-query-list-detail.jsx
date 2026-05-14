/*
 * Exercise 3 — TanStack Query: List and Detail
 *
 * Estimated time: 90–120 minutes.
 *
 * Goal:
 *   Complete the components below by filling in every `TODO`. The file
 *   exports a small two-component app — a list of posts and a detail
 *   view — wired to TanStack Query against the JSONPlaceholder API at
 *   https://jsonplaceholder.typicode.com.
 *
 * Prerequisites:
 *   - Lecture 3 read.
 *   - A Vite + React project with these installed:
 *
 *       npm install @tanstack/react-query @tanstack/react-query-devtools
 *
 *   - This file dropped in as src/PostsApp.jsx (or similar).
 *
 * How to verify:
 *   - Wrap your app in <QueryClientProvider client={queryClient}> at the
 *     root (see the bootstrap snippet at the bottom of this file).
 *   - npm run dev. The list should appear. Click a post. The detail should
 *     load. Click back. The list should still be there.
 *   - Open the React Query Devtools (the floating logo bottom-left in dev)
 *     and watch the cache populate.
 *
 *   When you finish, every TODO should be replaced with working code.
 *   The reference SOLUTIONS.md walks through every replacement.
 *
 * Doc references for each hook used here:
 *   - useQuery:    https://tanstack.com/query/latest/docs/framework/react/guides/queries
 *   - useMutation: https://tanstack.com/query/latest/docs/framework/react/guides/mutations
 *   - Invalidation: https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation
 */

"use strict";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const API = "https://jsonplaceholder.typicode.com";

/* ------------------------------------------------------------------ *
 * Helpers — plain fetch wrappers                                     *
 *                                                                    *
 * Note: in production you would centralize errors, parse JSON only   *
 * for JSON responses, attach auth headers, etc. For this exercise    *
 * the wrappers are small on purpose.                                 *
 * ------------------------------------------------------------------ */

async function fetchPosts({ signal }) {
  const r = await fetch(`${API}/posts?_limit=10`, { signal });
  if (!r.ok) throw new Error("Failed to load posts");
  return r.json();
}

async function fetchPost({ signal }, id) {
  const r = await fetch(`${API}/posts/${id}`, { signal });
  if (!r.ok) throw new Error("Failed to load post");
  return r.json();
}

async function createPost(post) {
  // JSONPlaceholder accepts POST but does not actually persist; it will
  // return a fake `id` of 101. That is fine for the exercise — the cache
  // invalidation still proves the wiring works.
  const r = await fetch(`${API}/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(post),
  });
  if (!r.ok) throw new Error("Failed to create post");
  return r.json();
}

/* ------------------------------------------------------------------ *
 * Component 1 — PostsList                                            *
 *                                                                    *
 * Reads ["posts"] from the cache. Renders the list. Clicking an item *
 * sets selectedId, which the parent <PostsApp> passes to PostDetail. *
 *                                                                    *
 * Props:                                                             *
 *   selectedId — number | null                                       *
 *   onSelect   — (id: number) => void                                *
 * ------------------------------------------------------------------ */

export function PostsList({ selectedId, onSelect }) {
  // TODO 1.1: Call useQuery with queryKey ["posts"] and queryFn fetchPosts.
  // The queryFn signature is ({ signal }) => Promise<Post[]>, so you can
  // pass `fetchPosts` directly (it has the right shape).
  //
  // Reference: https://tanstack.com/query/latest/docs/framework/react/guides/queries
  //
  // Example shape:
  //   const { data, error, isPending } = useQuery({
  //     queryKey: ["posts"],
  //     queryFn: fetchPosts,
  //   });

  const { data, error, isPending, isFetching } = {
    data: [],
    error: null,
    isPending: false,
    isFetching: false,
  }; // <-- replace with useQuery(...)

  if (isPending) return <p>Loading posts...</p>;
  if (error) return <p role="alert">Error: {error.message}</p>;

  return (
    <section aria-label="Posts">
      <h2>
        Posts {isFetching && <small aria-live="polite">(updating)</small>}
      </h2>
      <ul>
        {data.map((post) => (
          <li key={post.id}>
            <button
              type="button"
              onClick={() => onSelect(post.id)}
              aria-pressed={selectedId === post.id}
              style={{
                fontWeight: selectedId === post.id ? "bold" : "normal",
              }}
            >
              {post.title}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * Component 2 — PostDetail                                           *
 *                                                                    *
 * Reads ["post", id] from the cache. Renders title + body.           *
 *                                                                    *
 * Props:                                                             *
 *   id — number | null                                               *
 * ------------------------------------------------------------------ */

export function PostDetail({ id }) {
  // TODO 2.1: Call useQuery with queryKey ["post", id] and queryFn that
  // calls fetchPost. Note that fetchPost takes ({ signal }, id), so you
  // need an inline arrow function: ({ signal }) => fetchPost({ signal }, id).
  //
  // The query should only fire when id is truthy. Use the `enabled` option:
  //   enabled: id != null
  //
  // Reference: https://tanstack.com/query/latest/docs/framework/react/guides/dependent-queries

  const { data, error, isPending, isFetching } = {
    data: null,
    error: null,
    isPending: false,
    isFetching: false,
  }; // <-- replace with useQuery(...)

  if (id == null) return <p>Select a post on the left.</p>;
  if (isPending) return <p>Loading post {id}...</p>;
  if (error) return <p role="alert">Error: {error.message}</p>;

  return (
    <article aria-busy={isFetching}>
      <h2>{data.title}</h2>
      <p>{data.body}</p>
      <p>
        <small>Post ID: {data.id}</small>
      </p>
    </article>
  );
}

/* ------------------------------------------------------------------ *
 * Component 3 — NewPostForm                                          *
 *                                                                    *
 * A form that creates a new post via useMutation. On success, it     *
 * invalidates ["posts"] so the list refetches and shows the new      *
 * post at the top (JSONPlaceholder returns the fake post in the      *
 * response but does not persist; the invalidation still demonstrates *
 * the round-trip).                                                   *
 *                                                                    *
 * Props: none. Owns its own form state.                              *
 * ------------------------------------------------------------------ */

export function NewPostForm() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  // TODO 3.1: Call useMutation with mutationFn = createPost.
  // In onSuccess, call queryClient.invalidateQueries({ queryKey: ["posts"] })
  // to mark the list stale and trigger a background refetch.
  // Reset the form fields on success.
  //
  // Reference: https://tanstack.com/query/latest/docs/framework/react/guides/mutations

  const mutation = {
    mutate: (_p) => {},
    isPending: false,
    error: null,
  }; // <-- replace with useMutation(...)

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    mutation.mutate({ title, body, userId: 1 });
  };

  return (
    <section aria-label="New post">
      <h2>Create a post</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="new-post-title">Title</label>
          <br />
          <input
            id="new-post-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={mutation.isPending}
          />
        </div>
        <div>
          <label htmlFor="new-post-body">Body</label>
          <br />
          <textarea
            id="new-post-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            rows={3}
            disabled={mutation.isPending}
          />
        </div>
        <button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Creating..." : "Create post"}
        </button>
        {mutation.error && (
          <p role="alert">Error: {mutation.error.message}</p>
        )}
      </form>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * Parent — PostsApp                                                  *
 *                                                                    *
 * Composes the three components above. Owns one piece of local UI    *
 * state: selectedId. Everything else is server state in the cache.   *
 * ------------------------------------------------------------------ */

export default function PostsApp() {
  const [selectedId, setSelectedId] = useState(null);
  return (
    <main
      style={{
        display: "grid",
        gridTemplateColumns: "320px 1fr",
        gap: "1rem",
        padding: "1rem",
      }}
    >
      <div>
        <PostsList selectedId={selectedId} onSelect={setSelectedId} />
        <NewPostForm />
      </div>
      <div>
        <PostDetail id={selectedId} />
      </div>
    </main>
  );
}

/* ------------------------------------------------------------------ *
 * Bootstrap — what your src/main.jsx should look like                *
 *                                                                    *
 * import { StrictMode } from "react";                                *
 * import { createRoot } from "react-dom/client";                     *
 * import {                                                            *
 *   QueryClient,                                                      *
 *   QueryClientProvider,                                              *
 * } from "@tanstack/react-query";                                     *
 * import { ReactQueryDevtools } from "@tanstack/react-query-devtools";*
 * import PostsApp from "./PostsApp.jsx";                              *
 *                                                                    *
 * const queryClient = new QueryClient({                              *
 *   defaultOptions: { queries: { staleTime: 30_000 } },              *
 * });                                                                 *
 *                                                                    *
 * createRoot(document.getElementById("root")).render(                *
 *   <StrictMode>                                                      *
 *     <QueryClientProvider client={queryClient}>                     *
 *       <PostsApp />                                                  *
 *       <ReactQueryDevtools initialIsOpen={false} />                 *
 *     </QueryClientProvider>                                          *
 *   </StrictMode>,                                                    *
 * );                                                                  *
 * ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ *
 * Reflection questions                                               *
 *                                                                    *
 * Write your answers in notes. The SOLUTIONS.md has reference        *
 * answers; check yours against it after attempting.                  *
 *                                                                    *
 *   1. Why is selectedId in useState in PostsApp and not in the      *
 *      URL? Would you change your mind if this app had bookmarkable  *
 *      "permalinks" for each post?                                   *
 *                                                                    *
 *   2. Why does the useQuery in PostDetail need `enabled: id != null`?
 *      What would happen if you removed it?                          *
 *                                                                    *
 *   3. When you click a post you already viewed, the detail appears  *
 *      instantly. Why? Open the Devtools and watch the cache states. *
 *                                                                    *
 *   4. The mutation's onSuccess calls invalidateQueries with         *
 *      ["posts"]. Why not setQueryData (writing the new post into    *
 *      the cache directly)? What is the trade-off?                   *
 *                                                                    *
 *   5. JSONPlaceholder does not actually persist POSTs. Run the form *
 *      anyway, observe the refetch, and notice that the "new" post   *
 *      is NOT in the refetched list. What is happening, and what     *
 *      would a real backend do differently?                          *
 *                                                                    *
 *   6. Read the "Important Defaults" page at                         *
 *      https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults
 *      and identify the four numbers (staleTime, gcTime, retry,      *
 *      refetchOnWindowFocus). For each, in your own words, what is   *
 *      the default and when would you change it?                     *
 * ------------------------------------------------------------------ */
