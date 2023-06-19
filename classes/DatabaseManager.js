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

    async updateMember(userId, guildId, xp, streak) {
        let updatedMember = await Member.findOneAndUpdate(
            { userId: userId, guildId: guildId },
            {
                $set: {
                    xp: xp,
                    streak: streak,
                    lastActiveDate: Date.now()
                }
            },
            { new: true, useFindAndModify: false }
        );
    
        // Update the cache with the updated member
        const cacheKey = `${userId}-${guildId}`;
        if (updatedMember) {
            this.cacheManager.set(cacheKey, updatedMember);
            console.log(`Member ${userId} updated in the database`);
        } else {
            console.log(`Member ${userId} not found in the database`);
        }
    
        return updatedMember;
    }    

    async getMember(userId, guildId) {
        // First, try to get the user from the cache
        const cacheKey = `${userId}-${guildId}`;
        let member = this.cacheManager.get(cacheKey);

        // If the member is not in the cache, fetch them from the database
        if (!member) {
            member = await Member.findOne({ userId: userId, guildId: guildId });

            // If the user was found in the database, add them to the cache
            if (member) {
                this.cacheManager.set(cacheKey, await member);
                return await member;
            } else {
                // if member doesn't exist in db, add it
                member = await this.addMember(userId, guildId);
                return await member;
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

    // returns filtered list of members in order of xp
    async getLeaderboardForGuild(guildId, type) {
        const allMembers = await Member.find(
            { guildId: guildId }
        );

        // Finally, we'll sort the array in descending order by xp and limit to the top 10
        const leaderboard = allMembers.sort((a, b) => b[type] - a[type]).slice(0, 10);

        return leaderboard;
    }
}

module.exports = DatabaseManager;