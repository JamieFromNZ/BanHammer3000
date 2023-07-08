const Giveaway = require('../schemas/Giveaway.js');

class GiveawayManager {
    constructor(bot) {
        this.bot = bot;
        this.checkFinished = this.checkFinished.bind(this);
    }
    
    async endGiveaway(messageId) {
        await Giveaway.deleteOne()(
            { messageId: messageId },
        );

        console.log(`Giveaway ${messageId} ended in the database`);
    }

    // TODO: Here, the length thing is pribably inefficient if tehre are no giveaways at all? dunno
    // Maybe make a databaesManager function for this instead
    async getGiveaways() {
        // First, try to get the giveaways from the cache
        let giveaways = Array.from(this.bot.databaseManager.giveawayCacheManager.values());

        // If the giveaways are not in the cache, fetch them from the database, this shouldn't happen often
        if (giveaways.length === 0) {
            // firstly find from DB
            giveaways = await Giveaway.find();
            // secondly, add all giveaways to cache so we don't have to do this again
            giveaways.forEach(async (giveaway) => {
                this.bot.databaseManager.giveawayCacheManager.set(giveaway.messageId, giveaway);
            });
        }

        return await giveaways;
    }

    async getWinner(entries) {
        let i = Math.floor(Math.random() * entries.length);
        let winner = entries[i];

        return winner;
    }

    async endGiveaway(giveaway) {
        let entries = await this.getEntries((await giveaway).channelId, (await giveaway).messageId);

        let winners = [];
        let winnersList = " "

        //
        if (entries.length > 0) {
            for (let i = 0; i < (await giveaway).winnerCount; i++) {
                let winner = await this.getWinner(await entries); // get winner
                console.log("got winner", (await winner).id);

                /* do checks */
                if ((await winner).bot == false) { // check if the winner is a bot (most likely the client)
                    if (winners.includes((await winner))) { // check if winner already exists
                        i = i - 1; // make i one less so it does this loop again
                    } else {
                        console.log("winner valid", (await winner).id);
                        winners.push((await winner));
                        winnersList += `<@${(await winner).id}>`;
                    }
                } else {
                    console.log("winner is bot", (await winner).id);
                    i = i - 1; // make i one less so it does this loop again
                }
            }

            /* Announce winner(s) */
            let channel = await this.bot.client.channels.fetch(giveaway.channelId);
            let message = await channel.messages.fetch(giveaway.messageId);

            await message.reply(
                `:tada: Giveway winner(s): ${winnersList}, congrats, you won **${(await giveaway).prize}**!`
            );
        } else {
            // if the length is zero
            let channel = await this.bot.client.channels.fetch(giveaway.channelId);
            let message = await channel.messages.fetch(giveaway.messageId);

            await message.reply(
                `:frown: Nobody entered the giveaway`
            );
        }

        // Remove giveaway from database
        await this.bot.databaseManager.removeObject("giveaway", { messageId: giveaway.messageId });
    }

    async getEntries(channelId, messageId) {
        let channel = await this.bot.client.channels.fetch(channelId);
        let message = await channel.messages.fetch(messageId);
        let reactions = await message.reactions.cache.first().users.fetch();
        reactions = await reactions.toJSON();

        return (await reactions).filter(member => member.bot == false);
    }

    async checkFinished(bot) {
        console.log('checking if finished');
        let giveaways = await this.getGiveaways();

        if (giveaways) {
            if ((giveaways).length !== 0) {
                (giveaways).forEach(async (giveaway) => {
                    // Check if the giveaway has a duration, yes ik this is a stupid way of doing it
                    const isJanuaryFirst2000 = giveaway.endsAt.getFullYear() === 2000
                        && giveaway.endsAt.getMonth() === 0 // Months are 0-indexed, so January is 0
                        && giveaway.endsAt.getDate() === 1;

                    // if the gw *does* have a duration, check if over
                    if (!isJanuaryFirst2000) {
                        if (new Date() > giveaway.endsAt) {
                            console.log("gw ended");
                            await this.endGiveaway(giveaway, bot);
                        }
                    }
                });
            }
        }

        setTimeout(this.checkFinished, 10000);
        // call fn again after 10 minutes
        //setTimeout(this.checkFinished, 10 * 60 * 1000);
    }
}

module.exports = GiveawayManager;