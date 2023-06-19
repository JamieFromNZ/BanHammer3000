// Libraries needed
const fs = require('fs');
const path = require('node:path');
const { REST, Routes } = require('discord.js');

class CommandManager {
    constructor(bot) {
        // Map of all command file directories
        this.commandsDataArr = new Array();
    }

    // Load all command files from each subdirectory in the commands directory.
    async loadCmds(bot) {
        const subdirectories = fs.readdirSync('commands').filter(subdir => fs.statSync(path.join('commands', subdir)).isDirectory());

        for (const subdir of subdirectories) {
            const commandData = {
                name: subdir,
                description: `Commands for ${subdir}`,
                options: []
            };

            for (const item of fs.readdirSync(path.join('commands', subdir))) {
                if (path.extname(item) === '.js') {
                    const itemFile = require('../commands/' + subdir + '/' + item);
                    commandData.options.push({
                        type: 1, // sub cmd
                        name: path.basename(item, '.js'),
                        description: itemFile.data.description,
                        options: itemFile.data.options
                    });
                }
            }

            await this.commandsDataArr.push(commandData);
        }

        const rest = new REST({ version: '10' }).setToken(bot.token);
        try {
            await rest.put(
                Routes.applicationCommands(bot.client.user.id),
                { body: this.commandsDataArr }
            );
            console.log(`Successfully registered commands`);
        } catch (error) {
            console.error(error);
        }
    }

    async getCmdFileWithName(name) {
        let file = await require('../' + this.commandPathsMap.get(name + '.js'))
        return file;
    }
}

module.exports = CommandManager;