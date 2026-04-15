# Supabase Setup Instructions

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in or create an account
3. Create a new project
4. Copy the project URL and anon key

## Step 2: Configure Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Important**: Never commit `.env.local` to git. Add it to `.gitignore`.

## Step 3: Set Up Database Schema

1. In the Supabase dashboard, go to the SQL Editor
2. Create a new query
3. Copy the entire contents of `SUPABASE_SCHEMA.sql`
4. Paste into the editor and run

This will create:
- `profiles` table (user plans and monthly usage)
- `sessions` table (analysis records)
- Row-level security policies
- Performance indexes

## Step 4: Configure Auth

1. Go to Authentication > Providers
2. Enable Email/Password provider
3. Go to Authentication > URL Configuration
4. Set your redirect URL to `http://localhost:3000/auth/callback` (for local development)
5. For production, add your domain

## Step 5: Set Up Storage Bucket

1. Go to Storage in the Supabase dashboard
2. Create a new bucket called `session-audio`
3. Make it **Private** (not public)
4. Go to the bucket's Policies tab
5. Create a policy:
   - Name: "Authenticated users can upload to their folder"
   - Allowed operations: SELECT, INSERT, UPDATE, DELETE
   - For authenticated role only
   - Set target: `bucket_id = 'session-audio'`

## Step 6: Test the Connection

Run the development server:

```bash
npm run dev
```

Navigate to `http://localhost:3000` and verify that:
1. The upload interface loads
2. No console errors about missing Supabase config
3. The mock report displays correctly

## Troubleshooting

- **"Cannot find module @supabase/ssr"**: Run `npm install`
- **CORS errors**: Check that redirect URLs are configured correctly
- **"No rows" error on profile query**: Create a user first via Auth signup
- **Audio not storing**: Verify bucket name matches `process.env.SUPABASE_AUDIO_BUCKET` (defaults to `session-audio`)

## Monthly Quota Reset

The `analyses_this_month` counter needs to be reset monthly. Set up a scheduled job (via Supabase cron or external service) to run:

```sql
UPDATE profiles SET analyses_this_month = 0;
```

This should run on the first of each month.
