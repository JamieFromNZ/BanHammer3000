// Libraries and that jazz
const { Client, Events, GatewayIntentBits, REST, Routes, Collection, EmbedBuilder } = require('discord.js');

// Utils and stuff
require('dotenv').config();

// Classes for the bot
const EventManager = require('./EventManager.js');
const CommandManager = require('./CommandManager.js');
const KeepAlive = require('./KeepAlive.js');
const DatabaseManager = require('./DatabaseManager.js');
const GiveawayManager = require('./GiveawayManager');
const EmbedHelper = require('./EmbedHelper');
const CONSTANTS = require('../constants.json');

class FloraBlitz {
    constructor() {
        // Initialize Discord client for bot
        this.client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

        // Initialise main managers for bot
        this.eventManager = new EventManager(this);
        this.commandManager = new CommandManager(this);
        this.databaseManager = new DatabaseManager(process.env.MONGO_URI, this);
        this.keepAlive = new KeepAlive(this);
        this.giveawayManager = new GiveawayManager(this);
        this.embedHelper = new EmbedHelper(this);

        this.CONSTANTS = CONSTANTS;

        // Token
        this.token = process.env.TOKEN;
    }

    login() {
        console.log('Logging in...');
        return this.client.login(this.token);
    }
}

module.exports = FloraBlitz;