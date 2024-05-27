const superagent = require("superagent");
const {
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

class Twitch {
    static async makeRequest(endpoint, token) {
        try {
            const res = await superagent
                .get(`https://api.twitch.tv/helix/${endpoint}`)
                .set({
                    "Client-ID": process.env.TWITCH_CLIENT_ID,
                    "Authorization": `Bearer ${token}`
                });
            return res.body.data;
        } catch (err) {
            console.error(err);
            throw new Error("There was a problem fetching data from the Twitch API");
        }
    }

    static async getToken() {
        try {
            const {
                body: {
                    access_token
                }
            } = await superagent
                .post("https://id.twitch.tv/oauth2/token")
                .send({
                    client_id: process.env.TWITCH_CLIENT_ID,
                    client_secret: process.env.TWITCH_CLIENT_SECRET,
                    grant_type: "client_credentials",
                    scope: "user:read:email",
                });
            return access_token;
        } catch (err) {
            console.error(err);
            throw new Error("There was a problem fetching a token from the Twitch API");
        }
    }

    static async getUserInfo(token, username) {
        try {
            const userData = await this.makeRequest(`users?login=${username}`, token);
            return userData[0].id;
        } catch (err) {
            console.error(err);
            throw new Error("There was a problem fetching user info from the Twitch API");
        }
    }

    static async getUserPicture(token, username) {
        try {
            const userData = await this.makeRequest(`users?login=${username}`, token);
            return userData[0].profile_image_url;
        } catch (err) {
            console.error(err);
            throw new Error("There was a problem fetching user picture from the Twitch API");
        }
    }

    static async getStream(token, userID) {
        try {
            return await this.makeRequest(`streams?user_id=${userID}`, token);
        } catch (err) {
            console.error(err);
            throw new Error("There was a problem fetching stream data from the Twitch API");
        }
    }

    static getButton(StreamURL) {
        return new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setURL(StreamURL)
            .setLabel("Watch Stream");
    }

        static getEmbed(StreamURL, StreamTitle, GameName, ThumbnailURL, UserName, GameId, ProfilePicture) {
            return new EmbedBuilder()
                .setColor("Purple")
                .setTitle(StreamTitle)
                .setURL(StreamURL)
                .setDescription(`${UserName} is now live on Twitch!`)
                .addFields({
                    name: "Playing", 
                    value: `${GameName}`
                })
                .setImage(ThumbnailURL)
                .setAuthor({
                    name: `${UserName}`,
                    iconURL: `${ProfilePicture}`
                })
                .setThumbnail(`https://static-cdn.jtvnw.net/ttv-boxart/${GameId}.jpg`)
                .setTimestamp()
                .setFooter({
                    text: "Twitch",
                    iconURL: "https://cdn.discordapp.com/attachments/695874779407974461/1244116166289657916/twitch-footer.png?ex=6653f0f8&is=66529f78&hm=aa6ba57abb00f9cfe24ea2d8fd34641239524a5cc44a75c15f02296c6560fb66&"
                });
        }    
}

module.exports = Twitch;