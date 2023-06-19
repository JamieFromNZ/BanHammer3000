const FloraBlitz = require('./classes/FloraBlitz');
const dashboardInit = require('./dashboard/app');

const bot = new FloraBlitz();
bot.login().then(() => {
    // Log in
    console.log('Logged in.');
});

bot.client.on('ready', () => {
    console.log("Bot Ready. Loading commands & events.");
    // Load commands
    bot.commandManager.loadCmds(bot);
    bot.eventManager.load(bot);
    bot.keepAlive.start(bot);
    bot.databaseManager.connect();
    dashboardInit(bot);
});