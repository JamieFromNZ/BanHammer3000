// Libraries and that jazz
const { Client, Events, GatewayIntentBits, REST, Routes, Collection, EmbedBuilder } = require('discord.js');

// Utils and stuff
require('dotenv').config();

// Classes for the bot
const EventManager = require('./EventManager.js');
const CommandManager = require('./CommandManager.js');
const WebhookManager = require('./WebhookManager.js');
const MessageHandler = require('./MessageHandler.js');

class BanHammer3000 {
    constructor() {
        // Initialize Discord client for bot
        this.client = new Client({ intents: [GatewayIntentBits.Guilds] });

        // Initialise main managers for bot
        this.eventManager = new EventManager(this);
        this.commandManager = new CommandManager(this);
        this.webhookManager = new WebhookManager(this);
        this.messageHandler = new MessageHandler(this);

        // Token
        this.token = process.env.TOKEN;
    }

    login() {
        console.log('Logging in...');
        return this.client.login(this.token);
    }
}

module.exports = BanHammer3000;