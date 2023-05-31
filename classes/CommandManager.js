// Libraries needed
const fs = require('fs');
const path = require('node:path');
const { REST, Routes } = require('discord.js');

class CommandManager {
    constructor(bot) {
        // Map of all command file directories
        this.commandPathsMap = new Map();
        this.commandsDataArr = new Array();
    }

    async loadCmds(bot) {
        // Get all command files and store them in this.commandPathsMap & this.commandsDataArr;
        const findJsFiles = (directory) => {
            for (const item of fs.readdirSync(directory)) {
                const itemPath = path.join(directory, item);
                if (fs.statSync(itemPath).isFile() && path.extname(itemPath) === '.js') {
                    // Getting file of the command
                    const itemFile = require('../' + itemPath);

                    // Save data to commandsMap & other one with the key as the filename
                    this.commandPathsMap.set(path.basename(itemPath, '.js'), itemPath);
                    this.commandsDataArr.push(itemFile.data.toJSON());
                }
            }
        }

        // Get all subdirectories of 'commands'
        const subdirectories = fs.readdirSync('commands').filter(subdir => fs.statSync(path.join('commands', subdir)).isDirectory());

        // For each subdirectory, find .js files
        for (const subdir of subdirectories) {
            findJsFiles(path.join('commands', subdir));
        }

        // Construct and prepare an instance of the REST module and deploy the commands
        const rest = new REST({ version: '10' }).setToken(bot.token);

        try {
            console.log(`Started refreshing ${this.commandsDataArr.length} application (/) commands.`);
            const data = await rest.put(
                Routes./*applicationCommands*/applicationGuildCommands(bot.client.user.id, "996353076950732890"),
                { body: this.commandsDataArr },
            );
            console.log(`Successfully reloaded ${data.length} application (/) commands.`);
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