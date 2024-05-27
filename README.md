# Post-Notification

This project sends notifications for Twitch and YouTube streams/videos.

## Prerequisites

- Node.js
- npm
- Discord bot token
- Twitch API credentials
- YouTube API credentials

## Requirements

- Twitch: [Twitch Developer Console](https://dev.twitch.tv/console)
- Youtube: [YouTube Data API](https://console.cloud.google.com/apis/api/youtube.googleapis.com)

```env
TOKEN                   = # DISCORD BOT TOKEN
TWITCH_CLIENT_ID        = # TWITCH CLIENT ID
TWITCH_CLIENT_SECRET    = # TWITCH TOKEN
TWITCH_USERNAME         = # TWITCH USERNAME
STREAM_ANNOUNCE_ID      = # CHANNEL ON WHERE YOU WANT TO ANNOUCE IT

YOUTUBE_API_KEY         = # YOUTUBE API KEY
YOUTUBE_CHANNEL_ID      = # CHANNEL ID 
DISCORD_CHANNEL_ID      = # CHANNEL ON WHERE YOU WANT TO ANNOUCE IT
```


## Credits

- The Twitch was rewritten and cleaned up by me, You can find the original code [DiscordJS14-TwitchNotify](https://github.com/nicola-morganti/DiscordJS14-TwitchNotify/blob/main/classes/twitch-api.js).
