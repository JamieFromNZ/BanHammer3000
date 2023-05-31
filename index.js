const BanHammer3000 = require('./classes/BanHammer3000');

const bot = new BanHammer3000();
bot.login().then(() => {
    console.log('Logged in.');
});