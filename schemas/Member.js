const mongoose = require('mongoose');

const MemberSchema = new mongoose.Schema({
    userId: {
      type: String,
      required: true,
      unique: true
    },
    guildId: {
        type: String,
        required: true,
        unique: true
    },
    level: {
      type: Number,
      default: 1
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
    }
  });  

module.exports = mongoose.model('members', MemberSchema);