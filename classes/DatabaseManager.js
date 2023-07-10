const mongoose = require('mongoose');

const Member = require('../schemas/Member.js');
const Guild = require('../schemas/Guild.js');
const Giveaway = require('../schemas/Giveaway.js');

class DatabaseManager {
    constructor(connectionString, bot) {
        this.connectionString = connectionString;

        this.memberCacheManager = new Map();
        this.guildCacheManager = new Map();
        this.giveawayCacheManager = new Map();
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
                this.memberCacheManager.set(cacheKey, member);  // add to cache

                console.log(`Member ${parameters.userId} of ${parameters.guildId} added to the database`);
                return member;

            case "guild":
                const guild = new Guild({
                    guildId: parameters.guildId,
                });

                await guild.save();

                this.guildCacheManager.set(parameters.guildId, guild);  // Add to cache

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

                this.giveawayCacheManager.set(parameters.messageId, giveaway);  // Add to cache

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
                    this.memberCacheManager.set(cacheKey, updatedMember);
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
                this.guildCacheManager.set(parameters.guildId, updatedGuild);

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

                this.giveawayCacheManager.set(parameters.messageId, updatedGiveaway);
                console.log(`Giveaway ${parameters.messageId} updated in the database`);
                return updatedGiveaway;
        }
    }

    async getObject(objectType, parameters) {
        switch (objectType) {
            case "member":
                // First, try to get the user from the cache
                const cacheKey = `${parameters.userId}-${parameters.guildId}`;
                let member = this.memberCacheManager.get(cacheKey);

                // If the member is not in the cache, fetch them from the database
                if (!member) {
                    member = await Member.findOne({ userId: parameters.userId, guildId: parameters.guildId });

                    // If the user was found in the database, add them to the cache
                    if (member) {
                        this.memberCacheManager.set(cacheKey, await member);
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
                let guild = this.guildCacheManager.get(parameters.guildId);

                // If the guild is not in the cache
                if (!guild) {
                    guild = await Guild.findOne({ guildId: parameters.guildId });

                    if (await guild) {
                        this.guildCacheManager.set(parameters.guildId, guild);
                        return await guild;
                    } else {
                        // if not found in database, create
                        guild = await this.addObject("guild", { guildId: parameters.guildId });
                        return guild;
                    }
                } else {
                    return guild;
                }

            case "giveaway":
                let giveaway = await this.giveawayCacheManager.get(parameters.messageId);
                // If there is no giveaway found, fetch from db and add to cache
                if (!giveaway) {
                    giveaway = await Giveaway.findOne({ messageId: parameters.messageId });
                    await this.giveawayCacheManager.set(parameters.messageId, await giveaway)
                }
                return giveaway;
        }
    }

    async removeObject(objectType, parameters) {
        switch (objectType) {
            case "member":
                const memberCacheKey = `${parameters.userId}-${parameters.guildId}`;
                const removedMember = await Member.findOneAndDelete({
                    userId: parameters.userId,
                    guildId: parameters.guildId
                });

                if (removedMember) {
                    this.memberCacheManager.delete(memberCacheKey);
                    console.log(`Member ${parameters.userId} of ${parameters.guildId} removed from the database and cache`);
                } else {
                    console.log(`Member ${parameters.userId} of ${parameters.guildId} not found in the database`);
                }

                return removedMember;

            case "guild":
                const removedGuild = await Guild.findOneAndDelete({
                    guildId: parameters.guildId
                });

                if (removedGuild) {
                    this.guildCacheManager.delete(parameters.guildId);
                    console.log(`Guild ${parameters.guildId} removed from the database and cache`);
                } else {
                    console.log(`Guild ${parameters.guildId} not found in the database`);
                }

                return removedGuild;

            case "giveaway":
                const removedGiveaway = await Giveaway.findOneAndDelete({
                    messageId: parameters.messageId
                });

                if (removedGiveaway) {
                    this.giveawayCacheManager.delete(parameters.messageId);
                    console.log(`Giveaway ${parameters.messageId} removed from the database and cache`);
                } else {
                    console.log(`Giveaway ${parameters.messageId} not found in the database`);
                }

                return removedGiveaway;

            default:
                console.log(`Invalid objectType: ${objectType}`);
                return null;
        }
    }

    async removeAllObjects(objectType) {
        switch (objectType) {
            case "member":
                const removedMembers = await Member.deleteMany({});
                console.log(`Removed ${removedMembers.deletedCount} members from the database`);

                // Remove all member entries from cache
                this.memberCacheManager.forEach(key => this.memberCacheManager.delete(key));

                return removedMembers;

            case "guild":
                const removedGuilds = await Guild.deleteMany({});
                console.log(`Removed ${removedGuilds.deletedCount} guilds from the database`);

                // Remove all guild entries from cache
                this.guildCacheManager.forEach(key => this.guildCacheManager.delete(key));

                return removedGuilds;

            case "giveaway":
                const removedGiveaways = await Giveaway.deleteMany({});
                console.log(`Removed ${removedGiveaways.deletedCount} giveaways from the database`);

                // Remove all giveaway entries from cache
                this.giveawayCacheManager.forEach(key => this.giveawayCacheManager.delete(key));

                return removedGiveaways;

            default:
                console.log(`Invalid objectType: ${objectType}`);
                return null;
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