# Heartbeat: Keep Supabase Active

Create a free cron job to ping your Supabase API every 3 days.

## Option 1: cron-job.org (Recommended — free, no account needed)

1. Go to [cron-job.org](https://cron-job.org)
2. Sign up (free)
3. Click **Create**
4. Settings:
   - **Title**: GRME Heartbeat
   - **URL**: `https://ecmbnxjilkwajflixhtt.supabase.co/rest/v1/assessment_data?select=id&limit=1`
   - **Schedule**: Every 3 days
   - **Request method**: GET
5. Click **Save**

## Option 2: UptimeRobot (free, 50 monitors)

1. Go to [uptimerobot.com](https://uptimerobot.com)
2. Sign up (free)
3. Click **Add New Monitor**
4. Settings:
   - **Monitor Type**: HTTP(s)
   - **URL**: `https://ecmbnxjilkwajflixhtt.supabase.co/rest/v1/assessment_data?select=id&limit=1`
   - **Monitoring Interval**: 72 hours (3 days)
5. Click **Create Monitor**

## Option 3: GitHub Actions (free for public repos)

Create `.github/workflows/heartbeat.yml` in your repo:

```yaml
name: Keep Supabase Active
on:
  schedule:
    - cron: '0 0 */3 * *'  # Every 3 days
jobs:
  heartbeat:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Supabase
        run: |
          curl -s "https://ecmbnxjilkwajflixhtt.supabase.co/rest/v1/assessment_data?select=id&limit=1" \
            -H "apikey: YOUR_ANON_KEY" > /dev/null
```

Any of these will keep your Supabase project alive indefinitely for free.
