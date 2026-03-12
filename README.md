# Sylla – A Strava for Studying

A social studying app that lets you track study sessions and share them with friends. Built with React Native, Expo, and Supabase.

## Tech Stack

- **React Native** with Expo
- **TypeScript**
- **Supabase** (auth + database)
- **React Navigation** (stack + tabs)
- **Zustand** (state management)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the schema in `supabase/schema.sql` in the SQL Editor
3. Get your project URL and anon key from Project Settings → API

### 3. Configure environment

Create a `.env` file in the project root:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run the app

```bash
npm start
```

Then press `i` for iOS simulator or `a` for Android emulator.

## Project Structure

```
src/
  components/     # Reusable UI components
  screens/        # Screen components
  navigation/     # React Navigation setup
  services/       # Supabase client, API calls
  hooks/          # Custom hooks (useFeed, useUserStats)
  store/          # Zustand stores (authStore)
  types/          # TypeScript types
  utils/          # Helpers (env)
```

## Features

- **Auth**: Email/password signup and login with persistent session
- **Study sessions**: Start/stop timer, input subject & location, save to Supabase
- **Feed**: View study sessions from all users
- **Profile**: Username, total study hours, sessions this week

## Database Schema

- `users`: id, username, school, created_at
- `study_sessions`: id, user_id, subject, duration_minutes, location, created_at

Run `supabase/schema.sql` in your Supabase project to create tables and RLS policies.
