const {
    WebhookClient,
    PermissionFlagsBits
} = require('discord.js');

// Utils and stuff
require('dotenv').config();

// All webhooks are used for private logging atm, no need for any cool stuff
class WebhookManager {
    constructor(bot) {
        this.b = bot;
        this.webhooksMap = new Map();
    }

    loadPrivateWebhooks() {

    }

    async sendWebhook(channelId, message) {
        if (!channelId) return;

        let webhookData = await this.getWebhookWithChannelId(channelId);

        const webhook = new WebhookClient({ id: webhookData?.id, token: webhookData?.token });
        if (!webhook) return console.log('err making webhook');

        await webhook.send({
            content: message,
            username: 'BanHammer3000',
            avatarURL: 'https://i.imgur.com/AfFp7pu.png',
        });
    }

    getWebhookWithChannelId(channelID) {
        let wh = await this.webhooksMap.get(channelID);
        if (!wh) {
            const channel = await client.channels.cache.get(channelID);
            wh = await channel.fetchWebhooks();
            return await wh;
        } else {
            return await wh;
        }
    }
}

module.exports = WebhookManager;