const Discord = require("discord.js");

module.exports.run = async (client, message, args, prefix, player, db) => {
    let startembed = new Discord.EmbedBuilder()
        .setTitle('Current Event - I don\'t know')
        .setDescription('There isn\'t any.')
        .setColor("#FF69B4")
        .setFooter("NoEvent.exe", client.user.avatarURL)
    message.channel.send({ embed: startembed });
}

module.exports.help = {
    name: "events",
    desc: "",
    aliases: ["event"],
    usage: ""
}