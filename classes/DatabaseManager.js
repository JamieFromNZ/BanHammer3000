const mongoose = require('mongoose');

const Member = require('../schemas/Member.js');
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

    async addMember(userId, guildId) {
        const member = new Member({
            userId: userId,
            guildId: guildId
        });

        await member.save();

        // Create a key for cache with userid AND guildid (since member)
        const cacheKey = `${userId}-${guildId}`;
        this.cacheManager.set(cacheKey, member);  // add to cache

        console.log(`member ${userId} of ${guildId} added to the database`);
        return member;
    }

    async updateMember(userId, level, streak) {
        let updatedMember = await Member.updateOne(
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
        this.cacheManager.set(userId, updatedMember);

        console.log(`Member ${userId} updated in the database`);
    }

    // If the member is not cached
    async getMember(userId, guildId) {
        // First, try to get the user from the cache
        const cacheKey = `${userId}-${guildId}`;
        let member = this.cacheManager.get(cacheKey);

        // If the member is not in the cache, fetch them from the database
        if (!member) {
            member = await Member.findOne({ userId: userId, guildId: guildId });

            // If the user was found in the database, add them to the cache
            if (member) {
                this.cacheManager.set(cacheKey, member);
                return await member;
            } else {
                // if member doesn't exist in db
                member = await this.addMember(userId, guildId);
                return member;
            }
        } else {
            return member;
        }
    }

    async addGuild(guildId, levellingEnabled = false) {
        const guild = new Guild({
            guildId: guildId,
            levellingEnabled: levellingEnabled
        });

        await guild.save();

        this.cacheManager.set(guildId, guild);  // Add to cache
        
        console.log(`Guild ${guildId} added to the database`);
        return guild;
    }

    async updateGuild(guildId, levellingEnabled) {
        let updatedGuild = await Guild.updateOne(
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

        // If the guild is not in the cache
        if (!guild) {
            guild = await Guild.findOne({ guildId: guildId });

            if (guild) {
                this.cacheManager.set(guildId, guild);
                return await guild;
            } else {
                // if not found in database, create
                guild = await this.addGuild(guildId);
                return guild;
            }
        } else {
            return guild;
        }
    }
}

module.exports = DatabaseManager;