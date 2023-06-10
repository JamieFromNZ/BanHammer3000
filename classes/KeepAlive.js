// Libraries and that jazz
const { WebhookClient } = require('discord.js');

// Utils and stuff
require('dotenv').config();

// Our webhook
const webhookClient = new WebhookClient({ url: process.env.PRIVATE_WEBHOOK_URL });

// KeepAlive class !!
class KeepAlive {
    constructor(bot) {
        this.bot = bot;
    }

    async start() {
        this.bot.client.on('debug', async (e) => {
            await webhookClient.send({
                content: `# Debug\n \`\`\`${e}\`\`\``,
            });
            console.log(e);
        });

        this.bot.client.on('error', async (e) => {
            await webhookClient.send({
                content: `# Error warning <@422603238936936450>\n \`\`\`${e}\`\`\``,
            });
            console.log(e);
        });

        this.bot.client.on('warn', async (info) => {
            await webhookClient.send({
                content: `# Warn <@422603238936936450>\n \`\`\`${info}\`\`\``,
            });
            console.log(info);
        });

        process.on('unhandledRejection', async (reason, p) => {
            await webhookClient.send({
                content: `# unhandledRejection <@422603238936936450>\n \`\`\`${reason}\n${p}\`\`\``,
            });
            console.log(reason, p);
        });

        process.on('uncaughtException', async (err, origin) => {
            await webhookClient.send({
                content: `# uncaughtException <@422603238936936450>\n \`\`\`${err}\n@ ${await origin.toJSON()}\`\`\``,
            });
            console.log(err, origin);
        });

        process.on('uncaughtExceptionMonitor', async (err, origin) => {
            await webhookClient.send({
                content: `# uncaughtExceptionMonitor <@422603238936936450>\n \`\`\`${err}\n@ ${await origin.toJSON()}\`\`\``,
            });
            console.log(err, origin);
        });
    }
}

module.exports = KeepAlive;