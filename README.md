# AyAnime 🌌

A modern, full-stack anime tracking and discovery application built with Next.js, React, Tailwind CSS, and Supabase. AyAnime allows users to explore anime, manage their watchlists with a fluid drag-and-drop interface, and interact with the community.

## 🚀 Features

- **Anime Discovery**: Browse and discover new anime seamlessly.
- **Interactive Watchlist**: A Kanban-style watchlist board with drag-and-drop support to move anime between Planned, Watching, Completed, and Dropped statuses.
- **User Authentication**: Secure user login, signup, and session management powered by Supabase.
- **Favorites**: Mark your favorite animes to keep track of them easily.
- **Community Engagement**: Read and write comments on anime pages.
- **Responsive Design**: A sleek, premium dark-mode aesthetic that works perfectly across all device sizes.
- **Smooth Animations**: High-quality UI transitions and micro-interactions powered by Framer Motion.

## 🛠️ Tech Stack

- **Frontend Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) & [React Query](https://tanstack.com/query/latest) (@tanstack/react-query)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Components**: [Radix UI](https://www.radix-ui.com/)
- **Backend as a Service**: [Supabase](https://supabase.com/)

## 💻 Getting Started

### Prerequisites

- Node.js (v20 or higher recommended)
- npm, yarn, or pnpm
- A Supabase account and project

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ayoub-elhaddadi/AyAnime.git
   cd AyAnime
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the root directory and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🗄️ Database Schema Setup
You will need to set up the corresponding Supabase tables:
- `animes`
- `watchlist`
- `favorites`
- `comments`
- `profiles`

(Ensure your `supabase.ts` types match your actual Supabase database schema).

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.
