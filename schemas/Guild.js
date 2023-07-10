const mongoose = require('mongoose');

const GuildSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
        unique: true
    },
    pojChannels: {
        type: [String],
        default: []
    },
    embeds: {
        type: Array,
        default: []
    }
});

module.exports = mongoose.model('guilds', GuildSchema);