const {
    Client,
    GatewayIntentBits,
    ActionRowBuilder
} = require('discord.js');
const TwitchNotifier = require('./classes/twitch');
const YouTubeNotifier = require('./classes/youtube');
require('dotenv').config();

let twitchToken = "";
let twitchUserId = "";
let online = false;
let pic = "";

const client = new Client({
    intents: [Object.keys(GatewayIntentBits)]
});

async function updateTwitchInfo() {
    try {
        twitchToken = await TwitchNotifier.getToken();
        [twitchUserId, pic] = await Promise.all([
            TwitchNotifier.getUserInfo(twitchToken, process.env.TWITCH_USERNAME),
            TwitchNotifier.getUserPicture(twitchToken, process.env.TWITCH_USERNAME)
        ]);
        console.log("Twitch information updated successfully.");
    } catch (error) {
        console.error("Error updating Twitch information:", error);
    }
}

async function sendTwitchAnnouncement() {
    try {
        const data = await TwitchNotifier.getStream(twitchToken, twitchUserId);
        if (data.length > 0 && !online) {
            online = true;
            const button = TwitchNotifier.getButton(`https://www.twitch.tv/${process.env.TWITCH_USERNAME}`);
            const embed = TwitchNotifier.getEmbed(`https://www.twitch.tv/${process.env.TWITCH_USERNAME}`, data[0].title, data[0].game_name, data[0].thumbnail_url.replace('{width}', '1920').replace('{height}', '1080'), data[0].user_name, data[0].viewer_count, pic);
            const row = new ActionRowBuilder().addComponents(button);
            const channel = client.channels.cache.get(process.env.STREAM_ANNOUNCE_ID);
            if (!channel) {
                console.error('Channel not found.');
                return;
            }
            await channel.send({
                embeds: [embed],
                components: [row],
                content: `@everyone`
            });
            console.log("Stream announcement sent.");
        } else if (data.length === 0) {
            online = false;
        }
    } catch (error) {
        console.error("Error fetching Twitch stream data:", error);
    }
}


async function sendYouTubeAnnouncement() {
    try {
        console.log("Checking for new YouTube video...");
        await YouTubeNotifier.checkForNewVideos(client);
        if (YouTubeNotifier.announcementSent) {
            console.log("YouTube announcement sent.");
        } else {
            console.log("No new video found or announcement not sent.");
        }
    } catch (error) {
        console.error("Error sending YouTube announcement:", error);
    }
}

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    updateTwitchInfo();
    (updateTwitchInfo, 86400000); // Update Twitch info every 24 hours
    setInterval(sendTwitchAnnouncement, 1000 * 60 * 5); // Check Twitch stream every 5 minutes
    setInterval(sendYouTubeAnnouncement, 86400000); // Check Youtube every 24 hours
});

client.login(process.env.TOKEN);