require('dotenv').config();
const Discord = require('discord.js');
const Database = require('./database/Database');
const Server = require('./items/Server');
const ServerManager = require('./managers/ServerManager');
const fs = require('fs');
const { Logger } = require('./utils/Utils');
const formatDiscordRegion = require('./utils/formatDiscordRegion');
const express = require('express');
const client = new Discord.Client({
    partials: ["MESSAGE", "REACTION", "GUILD_MEMBER", "CHANNEL", "USER"],
    ws: {
        intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_MEMBERS', 'DIRECT_MESSAGES' ,'GUILD_MESSAGE_REACTIONS', 'GUILD_PRESENCES', 'DIRECT_MESSAGE_REACTIONS', 'GUILD_BANS']
    }
});
require('discord-buttons')(client);

client.login(process.env.DISCORD_TOKEN);
client.setMaxListeners(15);
/**
 * @type {express.Application}
 */
client.app = express();
client.app.use(express.json());
client.manager = new ServerManager(client);
client.app.listen(process.env.PORT);
client.once('ready', () => {
    try {
        const loadServer = new Promise((resolve, reject) => {
            client.guilds.cache.forEach((guild, id) => {
                const server = client.manager.servers.get(guild.id);
                if (!server) {
                    const server = new Server(client, guild, undefined, '-', 0, client.manager);
                    client.manager.servers.set(server.id, server);
                }
                if (id === client.guilds.cache.last().id) resolve();
            });
        });

        loadServer.then(async () => {
            const loadServerData = new Promise(async (resolve, reject) => {
                const rows = await Database.allNewDB('SELECT * FROM servers')
                for (const row of rows) {
                    try {
                        client.manager.all.push(row.id);
                        const guild = await client.guilds.fetch(row.id);
                        const server = await client.manager.fetch(guild.id)
                        if (guild && server) {
                            server.loadData(JSON.parse(row.data));
                        }
                    } catch(err) {}
                }
                if (client.manager.all.length === rows.length) {
                    resolve();
                }
            });
            loadServerData.then(() => {
                client.user.setActivity(`destial.xyz | ${client.manager.all.length} leagues`);
                Logger.log('danktial is now online!');
                client.manager.servers.forEach(server => {
                    if (server.modlog) {
                        const locale = formatDiscordRegion(server.guild.region);
                        const date = new Date().toLocaleDateString('en-US', { timeZone: locale, weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
                        const time = new Date().toLocaleTimeString('en-US', { timeZone: locale, hour12: true, hour: '2-digit', minute: '2-digit' }).replace(' ', '').toLowerCase();
                        try {
                            server.modlog.setTopic(`danktial has been online since ${date} ${(time.startsWith('0') ? time.substring(1) : time)} ${server.guild.region.toLocaleUpperCase()}`);
                        } catch(err) {}
                    }
                });
            });
            
            const listenerFiles = fs.readdirSync('./listeners').filter(file => file.endsWith('.js'));
            for (const file of listenerFiles) {
                const listener = require(`./listeners/${file}`);
                listener.run(client, client.manager);
                Logger.boot(`[LISTENER] Registered ${file.replace('.js', '')}`);
            }
        });
    } catch(err) {
        client.guilds.cache.get('406814017743486976').channels.cache.get('646237812051542036').send(err.message);
    } 
});

process.on('uncaughtException', (err) => {
    console.log(err);
    client.guilds.cache.get('406814017743486976').channels.cache.get('646237812051542036').send(err ? err.message : `Uncaught exception! ${err}`);
});

process.on('unhandledRejection', (err) => {
    console.log(err);
    client.guilds.cache.get('406814017743486976').channels.cache.get('646237812051542036').send(err ? err.message : `Uncaught rejection! ${err}`);
})