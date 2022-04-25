const Discord = require('discord.js');

/**
 *
 * @param {Discord.GuildMember} member
 * @returns {boolean}
 */
function isStaff(member) {
    return (member.permissions.has('MANAGE_CHANNELS') ||
    member.permissions.has('MANAGE_MESSAGES') ||
    member.permissions.has('KICK_MEMBERS') ||
    member.permissions.has('MANAGE_GUILD') ||
    member.permissions.has('BAN_MEMBERS') ||
    member.permissions.has('MANAGE_ROLES') ||
    member.permissions.has('VIEW_AUDIT_LOG'));
}

module.exports = isStaff;
