const mongoose = require('mongoose');

const User = require('../schemas/User.js');
const Guild = require('../schemas/Guild.js');

const CacheManager = require('./CacheManager');

class DatabaseManager {
    constructor(connectionString, bot) {
        this.connectionString = connectionString;
        this.cacheManager = new CacheManager(); // class within class within class
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
            },
            { new: true }
        );

        // Update the cache with the updated user
        this.cacheManager.set(userId, updatedUser);

        console.log(`User ${userId} updated in the database`);
    }

    async getUser(userId) {
        // First, try to get the user from the cache
        let user = this.cacheManager.get(userId);

        // If the user is not in the cache, fetch them from the database
        if (!user) {
            user = await User.findOne({ userId: userId });

            // If the user was found in the database, add them to the cache
            if (user) {
                this.cacheManager.set(userId, user);
            }
        }

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
            },
            { new: true }
        );

        // Update the cache with the updated guild
        this.cacheManager.set(guildId, updatedGuild);

        console.log(`Guild ${guildId} updated in the database`);
    }

    async getGuild(guildId) {
        let guild = this.cacheManager.get(guildId);

        if (!guild) {
            guild = await Guild.findOne({ guildId: guildId });

            if (guild) {
                this.cacheManager.set(guildId, guild);
            }
        }

        return guild;
    }
}

module.exports = DatabaseManager;