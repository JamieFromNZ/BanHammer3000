const Giveaway = require('../schemas/Giveaway.js');

class GiveawayManager {
    constructor(bot) {
        this.bot = bot;
        this.cache = new Map(); // Cache for giveaways

        // begin loop
        this.checkFinished();
    }

    async createGiveaway(messageId, hostId, channelId, guildId, prize, winnerCount, endsAt, members) {
        const giveaway = new Giveaway({
            messageId,
            hostId,
            channelId,
            guildId,
            prize,
            winnerCount,
            endsAt,
            members
        });

        await giveaway.save();

        this.cache.set(messageId, giveaway);  // Add to cache

        console.log(`Giveaway ${messageId} added to the database`);
        return giveaway;
    }

    async updateGiveaway(messageId, update) {
        let updatedGiveaway = await Giveaway.findOneAndUpdate(
            { messageId: messageId },
            {
                $set: update
            },
            { new: true, useFindAndModify: false }
        );

        this.cache.set(messageId, updatedGiveaway);
        console.log(`Giveaway ${messageId} updated in the database`);
        return updatedGiveaway;
    }

    async endGiveaway(messageId) {
        await Giveaway.deleteOne()(
            { messageId: messageId },
        );

        console.log(`Giveaway ${messageId} ended in the database`);
    }

    async getGiveaway(messageId) {
        let giveaway = this.cache.get(messageId);
        // If there is no giveaway found, fetch from db and add to cache
        if (!giveaway) {
            giveaway = await Giveaway.findOne({ messageId: messageId });
            await this.cache.set(messageId, await giveaway)
        }
        return giveaway;
    }

    async getGiveaways() {
        // First, try to get the giveaways from the cache
        let giveaways = Array.from(this.cache.values())

        // If the giveaways are not in the cache, fetch them from the database, this shouldn't happen often
        if (!giveaways) {
            // firstly find from DB
            giveaways = await Giveaway.find();
            // secondly, add all giveaways to cache so we don't have to do this again
            giveaways.forEach(async (giveaway) => {
                this.cache.set(giveaway.messageId, giveaway);
            });
        }

        return giveaways;
    }

    async checkFinished() {
        const giveaways = await this.getGiveaways();

        if (giveaways) {
            giveaways.forEach(async (giveaway) => {
                // Check if the giveaway has a duration, yes ik this is a stupid way of doing it
                const isJanuaryFirst2000 = giveaway.endsAt.getFullYear() === 2000
                    && giveaway.endsAt.getMonth() === 0 // Months are 0-indexed, so January is 0
                    && giveaway.endsAt.getDate() === 1;
    
                // if the gw *does* have a duration, check if over
                if (!isJanuaryFirst2000) {
                    if (new Date() > giveaway.endsAt) {
                        console.log("gw ended");
                    }
                }
            });
        }

        // call fn again after 30 minutes
        setTimeout(this.checkFinished, 30 * 60 * 1000);
    }
}

module.exports = GiveawayManager;