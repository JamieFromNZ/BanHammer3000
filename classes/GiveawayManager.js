class GiveawayManager {
    constructor(bot) {
        this.bot = bot;
        this.cache = new Map(); // Cache for giveaways
        this.checkFinished = this.checkFinished.bind(this);
    }
    
    async endGiveaway(messageId) {
        await Giveaway.deleteOne()(
            { messageId: messageId },
        );

        console.log(`Giveaway ${messageId} ended in the database`);
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

        return await giveaways;
    }

    async getWinner(entries) {
        let i = Math.floor(Math.random() * entries.length);
        let winner = entries[i];

        return winner;
    }

    async endGiveaway(giveaway, bot) {
        let entries = this.getEntries((await giveaway).channelId, (await giveaway).messageId);
        console.log(await entries);

        let winners = [];
        let winnersList = " "

        // ensure length is not zero
        if (!(await entries).length === 0) {
            for (let i = 0; i < (await giveaway).winnerCount; i++) {
                console.log("looping through winners");
                let winner = this.getWinner(await entries); // get winner
                console.log("got winner", (await winner).id);

                /* do checks */
                if ((await winner).bot == false) { // check if the winner is a bot (most likely the client)
                    console.log("winner isn't bot", (await winner).id);
                    if (winners.includes((await winner))) { // check if winner already exists
                        console.log("winner is already on array", winner.id);
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
    }

    async getEntries(channelId, messageId) {
        let channel = await this.bot.client.channels.fetch(channelId);
        let message = await channel.messages.fetch(messageId);
        let reactions = await message.reactions.cache.first().users.fetch();
        reactions = await reactions.toJSON();

        return (await reactions).filter(member => member.bot == true);
    }

    async checkFinished(bot) {
        console.log('checking if finished');
        let giveaways = await this.getGiveaways();
        console.log(giveaways);

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

                            // Handle giveaway end logic

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