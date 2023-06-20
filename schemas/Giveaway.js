const mongoose = require('mongoose');

const GiveawaySchema = new mongoose.Schema({
    messageId: String,
    channelId: String,
    hostId: String,
    guildId: String,
    prize: String,
    winnerCount: Number,
    endsAt: Date,
    members: Array
});

module.exports = mongoose.model('giveaways', GiveawaySchema);