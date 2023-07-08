const mongoose = require('mongoose');

const GuildSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
        unique: true
    },
    levellingEnabled: {
        type: Boolean,
        default: false
    },
    pojChannels: {
        type: [String],
        default: []
    }
});

module.exports = mongoose.model('guilds', GuildSchema);