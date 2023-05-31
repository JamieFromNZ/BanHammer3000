const fs = require('fs');

class EventManager {
    constructor(bot) {
        this.b = bot;
    }

    load() {
        const eventsPath = './events';
        const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

        // b could be not the same as the b (out of date)
        for (const file of eventFiles) {
            const event = require('../events/' + file);
            if (event.once) {
                this.b.once(event.name, (...args) => event.execute(...args, this.b));
            } else {
                this.b.on(event.name, (...args) => event.execute(...args, this.b));
            }
        }
    }
}

module.exports = EventManager;