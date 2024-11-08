const Discord = require("discord.js");

module.exports.run = async (client, message, args, prefix, player, db) => {

  if (!message.member.hasPermission("MANAGE_GUILD")) return message.reply("You don't have the required permission: `MANAGE_SERVER`.");

  if (!args[0] || args[0] === "help") {
    return message.reply(`Usage: \`${prefix}setprefix <new prefix>\` - Changes the bot's prefix in this server.`);
  }

  const newPrefix = args[0];

  if (newPrefix.length > 3) return message.reply("The prefix is too long. Please use a prefix with a maximum of 3 characters.");

  // Update the prefix in the database
  await db.collection("guilds").updateOne({ _id: message.guild.id }, { $set: { prefix: newPrefix } });

  // Create the embed for the confirmation
  let sEmbed = new Discord.EmbedBuilder()
    .setColor("#7f7fff")
    .setTitle("New Prefix Set")
    .setDescription(`The bot's prefix has been updated to \`${newPrefix}\`.`);

  // Send the confirmation message
  message.channel.send({ embeds: [sEmbed] });

}

module.exports.help = {
  name: "setprefix",
  aliases: ["sp"],
  description: "Changes the bot's prefix in this server.",
  usage: "setprefix <new prefix>"
}
