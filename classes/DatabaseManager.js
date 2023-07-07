const mongoose = require('mongoose');

const Member = require('../schemas/Member.js');
const Guild = require('../schemas/Guild.js');
const Giveaway = require('../schemas/Giveaway.js');

class DatabaseManager {
    constructor(connectionString, bot) {
        this.connectionString = connectionString;
        this.cacheManager = new Map();
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

    async addObject(objectType, parameters) {
        switch (objectType) {
            case "member":
                const member = new Member({
                    userId: parameters.userId,
                    guildId: parameters.guildId
                });

                await member.save();

                // Create a key for cache with userid AND guildid (since member)
                const cacheKey = `${parameters.userId}-${parameters.guildId}`;
                this.cacheManager.set(cacheKey, member);  // add to cache

                console.log(`Member ${parameters.userId} of ${parameters.guildId} added to the database`);
                return member;

            case "guild":
                const guild = new Guild({
                    guildId: parameters.guildId,
                });

                await guild.save();

                this.cacheManager.set(parameters.guildId, guild);  // Add to cache

                console.log(`Guild ${parameters.guildId} added to the database`);
                return guild;

            case "giveaway":
                const giveaway = new Giveaway({
                    messageId: parameters.messageId,
                    hostId: parameters.hostId,
                    channelId: parameters.channelId,
                    guildId: parameters.guildId,
                    prize: parameters.prize,
                    winnerCount: parameters.winnerCount,
                    endsAt: parameters.endsAt,
                    members: parameters.members
                });

                await giveaway.save();

                this.cacheManager.set(parameters.messageId, giveaway);  // Add to cache

                console.log(`Giveaway ${parameters.messageId} added to the database`);
                return giveaway;
        }
    }

    async updateObject(objectType, parameters) {
        switch (objectType) {
            case "member":
                let updatedMember = await Member.findOneAndUpdate(
                    { userId: parameters.userId, guildId: parameters.guildId },
                    {
                        $set: {
                            xp: parameters.xp,
                            streak: parameters.streak,
                            lastActiveDate: Date.now()
                        }
                    },
                    { new: true, useFindAndModify: false }
                );

                // Update the cache with the updated member
                const cacheKey = `${parameters.userId}-${parameters.guildId}`;
                if (updatedMember) {
                    this.cacheManager.set(cacheKey, updatedMember);
                    console.log(`Member ${parameters.userId} updated in the database`);
                } else {
                    console.log(`Member ${parameters.userId} not found in the database`);
                }

                return updatedMember;

            case "guild":
                let updatedGuild = await Guild.findOneAndUpdate(
                    { guildId: parameters.guildId },
                    {
                        $set: parameters.update
                    },
                    { new: true, useFindAndModify: false }
                );

                // Update the cache with the updated guild
                this.cacheManager.set(parameters.guildId, updatedGuild);

                console.log(`Guild ${parameters.guildId} updated in the database`);
                return updatedGuild;

            case "giveaway":
                let updatedGiveaway = await Giveaway.findOneAndUpdate(
                    { messageId: parameters.messageId },
                    {
                        $set: parameters.update
                    },
                    { new: true, useFindAndModify: false }
                );

                this.cacheManager.set(parameters.messageId, updatedGiveaway);
                console.log(`Giveaway ${parameters.messageId} updated in the database`);
                return updatedGiveaway;
        }
    }

    async getObject(objectType, parameters) {
        switch (objectType) {
            case "member":
                // First, try to get the user from the cache
                const cacheKey = `${parameters.userId}-${parameters.guildId}`;
                let member = this.cacheManager.get(cacheKey);

                // If the member is not in the cache, fetch them from the database
                if (!member) {
                    member = await Member.findOne({ userId: parameters.userId, guildId: parameters.guildId });

                    // If the user was found in the database, add them to the cache
                    if (member) {
                        this.cacheManager.set(cacheKey, await member);
                        return await member;
                    } else {
                        // if member doesn't exist in db, add it
                        member = await this.addObject("member", { userId: parameters.userId, guildId: parameters.guildId });
                        return await member;
                    }
                } else {
                    return member;
                }

            case "guild":
                let guild = this.cacheManager.get(parameters.guildId);

                // If the guild is not in the cache
                if (!guild) {
                    guild = await Guild.findOne({ guildId: parameters.guildId });
        
                    if (guild) {
                        this.cacheManager.set(parameters.guildId, guild);
                        return await guild;
                    } else {
                        // if not found in database, create
                        guild = await this.addObject("guild", parameters.guildId);
                        return guild;
                    }
                } else {
                    return guild;
                }

            case "giveaway":
                let giveaway = await this.cache.get(messageId);
                // If there is no giveaway found, fetch from db and add to cache
                if (!giveaway) {
                    giveaway = await Giveaway.findOne({ messageId: parameters.messageId });
                    await this.cache.set(parameters.messageId, await giveaway)
                }
                return giveaway;
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