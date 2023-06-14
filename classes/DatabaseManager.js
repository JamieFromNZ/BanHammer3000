const mongoose = require('mongoose');
const User = require('../schemas/User.js');

class DatabaseManager {
    constructor(connectionString, bot) {
        this.connectionString = connectionString;
    }

    async connect() {
        try {
            await mongoose.connect(this.connectionString, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            console.log('Database connection successful');
        } catch (error) {
            console.log('Database connection error', error);
        }
    }

    async addUser(userId) {
        const user = new User({
            userId: userId
        });

        await user.save();
        console.log(`User ${userId} added to the database`);
    }

    async updateUser(userId, level, streak) {
        await User.updateOne(
            { userId: userId },
            {
                $set: {
                    level: level,
                    streak: streak,
                    lastActiveDate: Date.now()
                }
            }
        );
        console.log(`User ${userId} updated in the database`);
    }

    async getUser(userId) {
        const user = await User.findOne({ userId: userId });
        return user;
    }

    async addGuild(guildId, levellingEnabled = false) {
        const guild = new Guild({
            guildId: guildId,
            levellingEnabled: levellingEnabled
        });

        await guild.save();
        console.log(`Guild ${guildId} added to the database`);
    }

    async updateGuild(guildId, levellingEnabled) {
        await Guild.updateOne(
            { guildId: guildId },
            {
                $set: {
                    levellingEnabled: levellingEnabled
                }
            }
        );
        console.log(`Guild ${guildId} updated in the database`);
    }

    async getGuild(guildId) {
        const guild = await Guild.findOne({ guildId: guildId });
        return guild;
    }
}

module.exports = DatabaseManager;