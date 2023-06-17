// Libraries and that jazz
const { Client, Events, GatewayIntentBits, REST, Routes, Collection, EmbedBuilder } = require('discord.js');

// Utils and stuff
require('dotenv').config();

// Classes for the bot
const EventManager = require('./EventManager.js');
const CommandManager = require('./CommandManager.js');
const MessageHandler = require('./MessageHandler.js');
const KeepAlive = require('./KeepAlive.js');
const DatabaseManager = require('./DatabaseManager.js');
const LevellingManager = require('./LevellingManager.js');

class BanHammer3000 {
    constructor() {
        // Initialize Discord client for bot
        this.client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

        // Initialise main managers for bot
        this.eventManager = new EventManager(this);
        this.commandManager = new CommandManager(this);
        this.databaseManager = new DatabaseManager(process.env.MONGO_URI, this);
        this.messageHandler = new MessageHandler(this);
        this.keepAlive = new KeepAlive(this);
        this.levellingManager = new LevellingManager(this);

        // Token
        this.token = process.env.TOKEN;
    }

    login() {
        console.log('Logging in...');
        return this.client.login(this.token);
    }
}

module.exports = BanHammer3000;