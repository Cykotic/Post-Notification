require('dotenv').config();
const axios = require('axios');
const {
    EmbedBuilder
} = require('discord.js');
const fs = require('fs');

class YouTubeNotifier {
    constructor(client) {
        this.client = client;
        this.announcementSent = false;
        this.lastVideoId = fs.existsSync('classes/VidId.txt') ? fs.readFileSync('classes/VidId.txt', 'utf8') : '';
    }

    static async getChannelDetails() {
        try {
            const url = `https://www.googleapis.com/youtube/v3/channels?key=${process.env.YOUTUBE_API_KEY}&id=${process.env.YOUTUBE_CHANNEL_ID}&part=snippet`;
            const {
                data
            } = await axios.get(url);
            const channel = data.items[0].snippet;
            return {
                name: channel.title,
                iconURL: channel.thumbnails.default.url,
                url: `https://www.youtube.com/channel/${process.env.YOUTUBE_CHANNEL_ID}`
            };
        } catch (error) {
            console.error('Error fetching channel details:', error);
            return null;
        }
    }

    static async getLatestVideo() {
        try {
            const url = `https://www.googleapis.com/youtube/v3/search?key=${process.env.YOUTUBE_API_KEY}&channelId=${process.env.YOUTUBE_CHANNEL_ID}&part=snippet,id&order=date&maxResults=1`;
            const {
                data
            } = await axios.get(url);
            return data.items[0];
        } catch (error) {
            console.error('Error fetching latest video:', error);
            return null;
        }
    }

    static async sendEmbed(client, video, channelDetails) {
        try {
            const channel = await client.channels.fetch(process.env.DISCORD_CHANNEL_ID);
            const videoUrl = `https://www.youtube.com/watch?v=${video.id.videoId}`;
            const embed = new EmbedBuilder()
                .setTitle(video.snippet.title)
                .setAuthor({
                    name: channelDetails.name,
                    iconURL: channelDetails.iconURL,
                    url: channelDetails.url
                })
                .setThumbnail(channelDetails.iconURL)
                .setURL(videoUrl)
                .setDescription(`${channelDetails.name} published a video on YouTube!`)
                .setImage(video.snippet.thumbnails.high.url)
                .addFields({
                    name: "Description",
                    value: `${video.snippet.description}`
                })
                .setTimestamp(new Date(video.snippet.publishedAt))
                .setFooter({
                    text: "YouTube",
                    iconURL: "https://cdn.discordapp.com/attachments/425261854558912512/1244363388130164867/youtube-footer.png?ex=6654d736&is=665385b6&hm=8de71d75509434e6dc3c2ad51d64d0b4368b55979320effb9f5a461de96edb3b&"
                })
                .setColor('#FF0000');

            await channel.send({
                content: `@everyone ${channelDetails.name} just uploaded ${video.snippet.title}`,
                embeds: [embed]
            });
            return true;
        } catch (error) {
            console.error('Error sending Discord message:', error);
            return false;
        }
    }

    static async checkForNewVideos(client) {
        try {
            const latestVideo = await this.getLatestVideo();
            if (!latestVideo || latestVideo.id.videoId === this.lastVideoId || this.announcementSent) {
                console.log('No new video found or announcement already sent.');
                return false;
            }

            const channelDetails = await this.getChannelDetails();
            if (!channelDetails) return false;

            const sent = await this.sendEmbed(client, latestVideo, channelDetails);
            if (!sent) return false;

            console.log(`New video detected and announcement sent. Video ID: ${latestVideo.id.videoId}`);
            this.lastVideoId = latestVideo.id.videoId;
            this.updateLastVideoIdFile();
            return true;
        } catch (error) {
            console.error('Error checking for new videos:', error);
            return false;
        }
    }

    static updateLastVideoIdFile() {
        try {
            fs.writeFileSync('classes/VidId.txt', this.lastVideoId, 'utf8');
            console.log(`Updated VidId.txt with video ID: ${this.lastVideoId}`);
            this.announcementSent = true;
        } catch (error) {
            console.error(`Error writing to file: ${error}`);
            this.announcementSent = false;
        }
    }
}

module.exports = YouTubeNotifier;