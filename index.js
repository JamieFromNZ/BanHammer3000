const BanHammer3000 = require('./classes/BanHammer3000');
const dashboardInit = require('./dashboard/app');

const bot = new BanHammer3000();
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
    dashboardInit(bot);
});