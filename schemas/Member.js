const mongoose = require('mongoose');

const MemberSchema = new mongoose.Schema({
    userId: {
      type: String,
      required: true,
      unique: false
    },
    guildId: {
        type: String,
        required: true,
        unique: false
    },
    xp: {
      type: Number,
      default: 0
    },
    streak: {
      type: Number,
      default: 0
    },
    lastActiveDate: {
      type: Date,
      default: Date.now
    },
    invites: {
      type: Number,
      default: 0
    },
    warnings: {
      type: Array,
      default: []
    }
  });

module.exports = mongoose.model('members', MemberSchema);