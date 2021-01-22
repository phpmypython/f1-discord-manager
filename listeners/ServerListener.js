const ServerManager = require('../managers/ServerManager');
const Discord = require('discord.js');
const Server = require('../items/Server');

module.exports = {
    /**
     * 
     * @param {Discord.Client} client 
     * @param {ServerManager} servers 
     */
    async run(client, servers) {
        client.on('guildCreate', async (guild) => {
            try {
                const exists = await servers.fetch(guild.id);
                if (!exists) {
                    const server = new Server(client, guild, undefined, "-", 0, servers);
                    servers.addServer(server);
                    server.save();
                    console.log(`[SERVER] Joined server ${guild.name}`);
                }
            } catch (err) {
                console.log('[ERROR] Something happened while trying to add a server!', err);
            }
        });

        client.on('guildDelete', async (guild) => {
            try {
                const server = await servers.fetch(guild.id);
                await servers.removeServer(server);
                console.log(`[SERVER] Left server ${guild.name}`);
            } catch (err) {
                console.log('[ERROR] Something happened while trying to add a server!', err);
            }
        });
    }
};