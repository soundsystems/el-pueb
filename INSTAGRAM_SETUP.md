# Instagram Feed Setup Guide

This guide will help you set up the Instagram feed integration for the El Pueblito website.

## Overview

The Instagram feed component displays the last 3 Instagram posts in circular frames and updates once a week. It uses the Instagram Basic Display API to fetch posts from your Instagram account.

## Setup Steps

### 1. Create a Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "Create App"
3. Select "Consumer" as the app type
4. Fill in the app details:
   - App Name: "El Pueblito Instagram Feed"
   - Contact Email: Your email
   - Business Account: (Optional)

### 2. Add Instagram Basic Display

1. In your Facebook app dashboard, click "Add Product"
2. Find and add "Instagram Basic Display"
3. Click "Set Up" on Instagram Basic Display

### 3. Configure Instagram Basic Display

1. Go to "Instagram Basic Display" in your app dashboard
2. Add your Instagram account:
   - Click "Add Instagram Account"
   - Follow the authorization process
   - Grant the necessary permissions

### 4. Generate Access Token

1. In the Instagram Basic Display settings, go to "Basic Display" → "User Token Generator"
2. Click "Generate Token"
3. Authorize the app with your Instagram account
4. Copy the generated access token

### 5. Set Environment Variables

Add the following environment variable to your `.env.local` file:

```env
INSTAGRAM_ACCESS_TOKEN=your_access_token_here
```

### 6. Deploy

1. Add the environment variable to your production environment (Vercel, Netlify, etc.)
2. Deploy your application

## Features

- **Circular Design**: Posts are displayed in circular frames with hover effects
- **Weekly Updates**: Data is cached for 7 days to reduce API calls
- **Fallback Support**: Shows placeholder images in development
- **Responsive**: Works on mobile and desktop
- **Loading States**: Shows loading spinner while fetching data
- **Error Handling**: Graceful error handling with fallback to cached data

## API Endpoints

- `GET /api/instagram-feed` - Fetches Instagram posts

## Customization

### Update Interval

You can change the update interval by modifying the `updateInterval` prop:

```tsx
<InstagramFeed maxPosts={3} updateInterval={24 * 60 * 60 * 1000} /> // 24 hours
```

### Number of Posts

Change the number of posts displayed:

```tsx
<InstagramFeed maxPosts={5} />
```

### Instagram Handle

Update the Instagram handle in the component:

```tsx
// In InstagramFeed.tsx, line ~150
href="https://instagram.com/your_handle"
```

## Troubleshooting

### Access Token Expired

Instagram access tokens expire. You'll need to:
1. Go back to your Facebook app
2. Generate a new access token
3. Update your environment variable

### API Rate Limits

The Instagram Basic Display API has rate limits. The component includes caching to minimize API calls.

### Development Mode

In development, the component shows placeholder images if the API fails. This allows you to test the UI without a valid access token.

## Security Notes

- Never commit your access token to version control
- Use environment variables for sensitive data
- Regularly rotate your access tokens
- Monitor API usage to stay within rate limits 