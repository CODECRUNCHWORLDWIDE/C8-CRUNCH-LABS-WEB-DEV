# Week 8 — Homework

> Six practice problems. Each is meant to take 20–45 minutes. Write your answers in your own words; the act of writing the answer is the learning. Cite specs and documentation where the lectures asked you to.

---

## Problem 1 — The state-audit table

Pick a real application you use (Gmail, Twitter/X, Linear, GitHub, your bank, any). Pick **one screen** in it (e.g. the GitHub issues list, the Gmail inbox, your bank's transactions list).

In a markdown table, list **at least eight** pieces of state on that screen. For each, fill three columns:

| Data | Layer | Specific tool you would use in React |
|------|-------|--------------------------------------|

The "Layer" column is one of: **Server**, **URL**, **Local UI**, **Derived**. The "Specific tool" column is one of: **TanStack Query** (with the suggested query key), **URL searchParams**, **`useState`**, **Zustand**, **derived from another piece of state** (and which one).

Then write a short paragraph: of the eight pieces of state, which one is the **least obvious** assignment? Why might a junior developer pick the wrong layer for it?

Reference: Lecture 1 §2 and §7.

---

## Problem 2 — The page-number refactor

Find or write a React component that uses `useState` for a page number and calls `fetch` inside `useEffect`. Refactor it to:

- Put the page number in the URL via `useSearchParams`.
- Replace the `useEffect`/`fetch` with `useQuery` from TanStack Query.

Submit both versions side by side in your notes. In two sentences each, answer:

- What does the refactor improve from the user's perspective?
- What does the refactor improve from the developer's perspective?
- What is a case in which the refactor is *not* worth it?

Reference: Lecture 1 §8, Lecture 3 §3.

---

## Problem 3 — A loader that prefetches

Take your Exercise 2 router. Add TanStack Query to the project (`npm install @tanstack/react-query`). Wire `QueryClientProvider` at the root.

Convert the `userLoader` to use `queryClient.fetchQuery` instead of a raw `fetch`. The `UserDetail` component should then read from the cache via `useQuery` with the same key.

Verify by:

1. Navigating to `/users/3`. The detail loads (the loader prefetched).
2. Navigating away (`/users`) and back. The detail loads **instantly** because the cache still has the entry.
3. Opening the React Query Devtools and confirming the `["user", "3"]` entry is in the cache.

Submit your `router.jsx` and `UserDetail.jsx` along with a screenshot (or description) of the devtools cache state.

Reference: <https://tanstack.com/query/latest/docs/framework/react/guides/react-router-integration>.

---

## Problem 4 — Where does each piece live?

Read the following functional spec (invented). For each numbered piece of state, write one line: **layer (server / URL / local / derived)** and **the specific React tool**.

> **Spec.** A "Crunch Library" app. The home page (`/`) shows the user a list of recommended books (filtered by the books the user has not yet rated). The books page (`/books`) lists all books, filterable by genre (multi-select) and sortable by title, author, or year (single-select). The book detail page (`/books/:id`) shows the book and the user's rating (a 1-to-5 star input). The user's rating is saved on-blur of the input. The user can toggle a global theme (light/dark) from the header; the theme persists across reloads. Sign-in is required to rate a book; the sign-in button in the header opens a modal.

Pieces of state to classify:

1. The recommended-books list on the home page.
2. Whether the user is signed in.
3. The currently-selected genre filters on `/books`.
4. The currently-selected sort order on `/books`.
5. The full books list (all books, all genres).
6. The current book being viewed on `/books/:id`.
7. The user's rating of the current book.
8. The "draft" rating the user is hovering over before clicking (a 1-to-5 star UI).
9. The current theme (light / dark).
10. Whether the sign-in modal is open.

Reference: Lecture 1.

---

## Problem 5 — A nested-route diagram

Sketch (on paper, or in markdown ASCII art) the route tree for a hypothetical "course platform" with these URLs:

- `/` — home
- `/courses` — list of courses
- `/courses/:courseId` — course detail (with three tabs)
- `/courses/:courseId/lessons` — the lessons tab (default for the course)
- `/courses/:courseId/discussion` — the discussion tab
- `/courses/:courseId/syllabus` — the syllabus tab
- `/courses/:courseId/lessons/:lessonId` — a specific lesson
- `/profile` — the current user's profile (protected; redirects to /login if not signed in)
- `/login` — login form

Your sketch must include:

- Which routes share a layout (use indentation).
- Which routes have an index (`/courses/:courseId` has `/courses/:courseId/lessons` as its default).
- Which routes are lazy-loaded (decide which ones; explain why).
- Which routes have loaders (decide which ones).

Then write the `createBrowserRouter([...])` array literal (just the config; no need to write the component files). Verify it compiles by dropping into a Vite project.

Reference: Lecture 2 §3.

---

## Problem 6 — A Zustand store from scratch

Write a Zustand store for a small "saved articles" feature. The store holds:

- `articles` — an array of article IDs the user has saved.
- `save(id)` — adds an ID to the array (no duplicates).
- `unsave(id)` — removes an ID from the array.
- `clear()` — empties the array.
- `isSaved(id)` — returns boolean.

The store should **persist to localStorage** so the saved articles survive a refresh. Use the `persist` middleware.

Reference: <https://docs.pmnd.rs/zustand/integrations/persisting-store-data>.

Write a small component that uses the store: shows the count of saved articles and a button to clear them. Drop it into a Vite project and verify the persistence (refresh the page; the saved articles should still be there).

Then answer:

- Why is the saved-articles list in Zustand and not in TanStack Query?
- Why is it in Zustand and not in `useState`?
- If the saved articles were synced to a server (so the same list appears on every device the user signs in to), how would the architecture change?

---

## Stretch problems (optional, but recommended)

### Problem 7 — Trace a real React Router app

Pick an open-source React Router v6 app on GitHub. Suggestions:

- The React Router examples repo: <https://github.com/remix-run/react-router/tree/main/examples>
- Cal.com: <https://github.com/calcom/cal.com>
- Any small open-source app from <https://github.com/topics/react-router>

In the project, find a file where `createBrowserRouter` (or `<BrowserRouter>` in older v6 code) is configured. Identify:

- How many top-level routes the app has.
- Whether nested routes are used.
- Whether any routes are lazy-loaded.
- Whether any routes have loaders.
- How auth-gating is handled (if at all).

Write 200 words on what you found.

### Problem 8 — Read TkDodo's "Effective React Query Keys"

Read <https://tkdodo.eu/blog/effective-react-query-keys>. Then refactor your Exercise 3 query keys to follow the "key factory" pattern:

```js
export const todoKeys = {
  all: ["todos"],
  lists: () => [...todoKeys.all, "list"],
  list: (filters) => [...todoKeys.lists(), filters],
  details: () => [...todoKeys.all, "detail"],
  detail: (id) => [...todoKeys.details(), id],
};
```

Why does the article recommend this pattern? When would you reach for it (versus inline string-array keys)?

---

## How to submit

Save your answers as `homework.md` in your portfolio repo (or in a private notes folder). The act of writing in your own words is the work; do not paste AI-generated text. The exercises and homework are graded by you, against your understanding three months from now when you reach for one of these tools at work.

---

## Rubric

A passing answer:

- **Cites doc URLs** for non-obvious claims. (URL state? Cite Lecture 1 §2 or the React Router `useSearchParams` doc.)
- **Distinguishes the three layers** without hand-waving. If you find yourself writing "this could be in either layer," pick one and defend the choice.
- **Names specific React tools** (`useState`, `useQuery`, `useSearchParams`, Zustand) rather than vague terms ("state," "store," "the cache").
- **Includes a working code sample** for problems 2, 3, 5, and 6.
- **Explains the trade-off** when one is asked for, not just the choice.

A failing answer:

- Treats every state question as "use Zustand" or "use Context."
- Skips the doc citations.
- Pastes AI-generated prose without engaging with the spec.
- Submits code that does not run.

The work is the writing. Three months from now, the words you wrote are the words you reach for in a code review.
