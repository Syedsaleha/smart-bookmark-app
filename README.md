# Smart Bookmark Manager 🚀

A real-time, private bookmarking application built with **Next.js 15**, **Supabase**, and **Tailwind CSS**. This project was developed as part of a technical assessment to demonstrate full-stack capabilities, real-time data synchronization, and secure authentication.

## 🌟 Features

- **Google OAuth:** Secure authentication using Google (no passwords required).
- **Private Bookmarks:** Row Level Security (RLS) ensures users only see their own data.
- **Real-time Sync:** Changes in one tab (Add/Delete) reflect instantly in all other open tabs.
- **Optimistic UI:** Instant feedback when adding or deleting bookmarks for a "zero-latency" feel.
- **Auto-Formatting:** Automatically detects and fixes URLs missing the `https://` protocol.
- **Glassmorphism UI:** A modern, responsive design built with Tailwind CSS.

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Database & Auth:** Supabase (PostgreSQL + GoTrue)
- **Real-time:** Supabase Realtime (Postgres Changes)
- **Styling:** Tailwind CSS

---

## 🧠 Challenges & Solutions

During the development of this project, I encountered and resolved several technical hurdles:

### 1. Next.js 15 Asynchronous Cookies
**Problem:** The standard Supabase Auth callback examples often use synchronous cookie handling, which causes errors in Next.js 15 because `cookies()` is now asynchronous.
**Solution:** I refactored the `auth/callback/route.ts` to `await cookies()` before initializing the Supabase client, ensuring the session is correctly exchanged and stored without runtime errors.

### 2. Eliminating UI Latency (Optimistic Updates)
**Problem:** Waiting for a database round-trip (Supabase) before updating the UI created a small but noticeable delay (approx. 200ms) when adding or deleting.
**Solution:** I implemented **Optimistic UI**. When a user adds/deletes a bookmark, the local React state updates immediately. The app then makes the background API call. If the call fails, the state is automatically reverted and an error is shown. This makes the app feel significantly faster.

### 3. Handling Relative vs. Absolute URLs
**Problem:** Users often type `google.com` instead of `https://google.com`. Browser behavior treats the former as a relative path, leading to a 404 (e.g., `your-app.com/google.com`).
**Solution:** I created a `formatUrl` utility function that checks the string prefix. If `http` is missing, it automatically prepends `https://`, ensuring all external links function correctly.

---

## 🚀 Getting Started Locally

1. **Clone the repo:**
   ```bash
   git clone [https://github.com/Syedsaleha/smart-bookmark-app.git](https://github.com/Syedsaleha/smart-bookmark-app.git)
   cd smart-bookmark-app
   ```

2. **Install dependencies:** 
    ```bash
    npm install
    ```
3. **Set up Environment Variables:**
Create a .env.local file in the root and add your Supabase credentials:

    ```bash
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```
4. **Run the development server:**
    ```bash
    npm run dev
    ```

Open http://localhost:3000 to view it.