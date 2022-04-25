const {Discord,MessageActionRow,MessageButton,MessageEmbed} = require('discord.js');
const Database = require('../database/Database');
const Reserve = require('../items/Reserve');
const Server = require('../items/Server');
const Tier = require('../items/Tier');
const isStaff = require('../utils/isStaff');

module.exports = {
    name: 'addtier',
    aliases: ['newtier', 'createtier'],
    usage: '[ name ]',
    description: 'Creates a new tier',
    /**
     * @param {Discord.Client} client
     * @param {Server} server
     * @param {string} command
     * @param {string[]} args
     * @param {Discord.Message} message
     */
    async run(client, server, command, args, message) {
        if (isStaff(message.member)) {
            const embed = new MessageEmbed();
            embed.setColor('BLUE');
            // embed.setFooter(`*WARINING* This command is deprecated and should be avoided! Use ${server.prefix}dupetier instead!`);
            if (!args.length) {
                embed.setAuthor('Usage is:');
                embed.setDescription(`${server.prefix}${command} ${this.usage}`);
                message.channel.send(embed);
                return;
            }
            const name = args[0]

            if (name.length >= 256) {
                const embed6 = new Discord.MessageEmbed().setTitle(`Tier name cannot be longer than 256 characters!`);
                message.channel.send(embed6);
                return;
            }
            console.log(name)

            // const tier = new Tier(client, server, name);
            embed.setTitle('Would you like to automatically create a role for this division?');
            // var bean = message.guild.emojis.cache?.find(emoji => emoji.name == 'bean');
           const row = new MessageActionRow().addComponents(new MessageButton().setCustomId('yes').setLabel('Yes').setStyle('PRIMARY'),new MessageButton().setCustomId('no').setLabel('No').setStyle('PRIMARY'))
            const botMessage = await message.channel.send({embeds:[embed],components:[row]})

            const filter = (i) => {
               console.log(i)
                return i.user.id === message.author.id;
                // return reaction.emoji.name === '👍' && user.id === message.author.id;
            };
            const collector = botMessage.createMessageComponentCollector(filter,{ time: 15000 });
            collector.on('collect', async i => {
                if (i.customId === 'yes') {
                    i.reply(`${i.user.id} clicked on the ${i.customId} button.`);
                }
                if (i.customId === 'no') {
                    i.reply(`${i.user.id} clicked on the ${i.customId} button.`);
                }

            });
            collector.on('end', collected => {
                console.log(`Collected ${collected.size} items`);
            });

            // collector.on('end', async (col) => {
            //     const reply = col.first();
            //     if (!reply) {
            //         embed.setAuthor('No response! Exiting add mode!');
            //         message.channel.send(embed);
            //         return;
            //     }
            //     const mentions = reply.mentions.members;
            //     mentions.forEach(mention => {
            //         const reserve = new Reserve(client, mention, server, 0, tier);
            //         tier.addReserve(reserve);
            //     });
            //     server.getTierManager().addTier(tier);
            //     server.getTierManager().tiers.sort((a, b) => a.name.localeCompare(b.name));
            //     embed.setAuthor(`Created tier ${name} with drivers:`);
            //     var driverList = "";
            //     tier.reserves.forEach(reserve => {
            //         driverList += (`- ${reserve.member}\n`);
            //         reserve.save();
            //     });
            //     embed.setDescription(`${driverList}\nNext step is using ` + server.prefix + `setdriver`);
            //     message.channel.send(embed);
            //     server.log(`${message.member.user.tag} has added tier ${tier.name}`);
            //     Database.run(Database.tierSaveQuery, [server.id, name]);
            // });
        }
    }
};
