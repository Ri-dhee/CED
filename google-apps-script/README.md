# Google Sheets Backend Setup

This connects the GRME Index to a Google Sheet as a shared database.

## Prerequisites
- A Google account
- A Google Sheet (create a new one, name it e.g. "GRME Index Data")

## Step 1: Open Apps Script

1. Open your Google Sheet
2. Go to **Extensions → Apps Script**
3. Delete any existing code in `Code.gs`
4. Paste the contents of `Code.gs` (from this folder)
5. Click **Save** (Ctrl+S)

## Step 2: Deploy as Web App

1. Click **Deploy → New deployment**
2. Click the gear icon → select **Web app**
3. Configure:
   - **Description**: `GRME Index API`
   - **Execute as**: `Me`
   - **Who has access**: `Anyone`
4. Click **Deploy**
5. Copy the **Web App URL** (looks like `https://script.google.com/macros/s/AKfycbx.../exec`)

## Step 3: Configure the Frontend

1. Open `website/.env.local`
2. Set the API URL:
   ```
   NEXT_PUBLIC_SHEETS_API_URL=https://script.google.com/macros/s/YOUR_URL_HERE/exec
   ```
3. Restart the dev server (`npm run dev`)
4. Redeploy to Vercel with the new env var

## How It Works

- On page load, the app fetches data from Google Sheets
- On every save, data is written to Google Sheets
- If the API is unavailable, the app falls back to localStorage
- All users share the same data in the Google Sheet

## Updating the Apps Script

If you update `Code.gs`:
1. Go back to Extensions → Apps Script
2. Paste the new code
3. Click **Deploy → Manage deployments**
4. Click the edit (pencil) icon
5. Select **New version**
6. Click **Deploy**
7. The URL stays the same

## Data Structure

The Google Sheet will have these tabs (created automatically):

| Tab | Purpose |
|-----|---------|
| `assessment_data` | Indicator values per city per year |
| `audit_log` | Change history |
| `framework` | Domain/subdomain/indicator definitions |
| `managed_users` | User accounts |
| `config` | App configuration |

## Troubleshooting

**"Failed to fetch" or CORS errors:**
- Make sure the Apps Script is deployed with access = "Anyone"
- Redeploy with a new version

**Data not appearing:**
- Check the Apps Script logs (Extensions → Apps Script → Executions)
- Verify the sheet has the correct tab names

**App works locally but not on Vercel:**
- Make sure `NEXT_PUBLIC_SHEETS_API_URL` is set in Vercel's environment variables
