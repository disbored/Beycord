const Discord = require("discord.js");

module.exports.run = async (client, message, args, prefix, player, db) => {
  // Fetch guild data from the database or insert it if not present
  let stats = await db.collection("guilds").findOne({ _id: message.guild.id });
  if (!stats) {
    db.collection("guilds").insertOne({ _id: message.guild.id, redirect: "nothing", prefix: ";", bey: "nothing", type: "nothing", answer: "number", disabled: [] });
    stats = await db.collection("guilds").findOne({ _id: message.guild.id });
  }

  // Permission check
  if (!message.member.permissions.has("MANAGE_GUILD")) {
    return message.reply("Woah there partner! You don't have the required permission: `MANAGE_SERVER`.");
  }

  // Channel validation
  if (!args[0] || args[0].toLowerCase() === "none") {
    db.collection("guilds").updateOne({ _id: message.guild.id }, { $set: { redirect: "nothing" } });
    return message.reply("Redirect channel removed!");
  }

  // Try to find the channel either by mention or ID
  let channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);

  if (!channel || channel.type !== "GUILD_TEXT") {
    return message.reply("Couldn't find a valid text channel. Please provide a valid channel mention or ID.");
  }

  // Update redirect channel in the database
  db.collection("guilds").updateOne({ _id: message.guild.id }, { $set: { redirect: channel.id } });

  // Send confirmation message
  const embed = new Discord.EmbedBuilder()
    .setTitle("Redirect Channel Set Successfully!")
    .addField("Redirect Channel", `<#${channel.id}>`)
    .setColor("#98FB98")
    .setTimestamp();

  message.channel.send({ embeds: [embed] });

  console.log(`Redirect channel set to: ${channel.id}`);
};

module.exports.help = {
  name: "redirect",
  aliases: ["setredirect", "set-redirect", "sr", "redirectchannel"],
  desc: "Set or remove the redirect channel where certain activities will be tracked.",
  usage: "redirect <channel> - Set a new redirect channel\nredirect none - Remove the current redirect channel"
};
