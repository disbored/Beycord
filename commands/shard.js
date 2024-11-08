const Discord = require("discord.js");

module.exports.run = async (client, message, args, prefix, player, db) => {
    let embed = new Discord.EmbedBuilder()
        .setTitle(`This server is on Shard ${message.guild.shard.id}!`)
        .setDescription("Sharding is the process of splitting the bot's operations across multiple servers to improve performance and scale for large bots.")
        .setColor("#7f7fff");
    message.channel.send({ embed: embed });
}

module.exports.help = {
    name: "shard",
    aliases: ["sh"],
    desc: "Displays the ID of the shard that the server belongs to.",
    usage: "shard - Read the description and you'll know what this does."
};
