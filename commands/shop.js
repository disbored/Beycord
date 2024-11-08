const Discord = require("discord.js");
const fs = require("fs");

module.exports.run = async (client, message, args, prefix, player, db) => {
  let stats = await db.collection("users").findOne({ _id: message.author.id });

  // Items array to store all available items
  const items = [
    { name: "Buddy Bey Kit", description: "Make a Buddy Bey with this awesome kit.", price: "20000 / 1 GV", currency: "valtz" },
    { name: "x1.5 EXP Booster 1 Hour", description: "Boost your EXP earn rate using this booster.", price: "3999", currency: "valtz" },
    { name: "Toolbox", description: "Fix a broken Bey using the Toolbox.", price: "250", currency: "valtz" },
    { name: "Perfect Constructor", description: "Construct a Perfect Phoenix with an 85% fail rate.", price: "2000", currency: "valtz" },
    { name: "3 Premium Tickets Chest", description: "Gives you 3 <:premiumgt:999800780565520505>.", price: "1 GV", currency: "goldenvaltz" },
    { name: "10 Premium Tickets Chest", description: "Gives you 10 <:premiumgt:999800780565520505>.", price: "3 GV", currency: "goldenvaltz" },
    { name: "35 Premium Tickets Chest", description: "Gives you 35 <:premiumgt:999800780565520505>.", price: "10 GV", currency: "goldenvaltz" },
    { name: "Void Meat", description: "Raw meat acquired from the mythical dragon Void.", price: "1000", currency: "valtz" },
    { name: "Gift Box", description: "Self-explanatory LOL.", price: "1", currency: "valtz" },
    { name: "Avatar Embryo", description: "Raise an avatar.", price: "1999", currency: "valtz" },
    { name: "BeyLauncher LR", description: "Just your average left-right string launcher.", price: "1499", currency: "valtz" }
  ];

  // Create the embed for the shop
  let shopdisplay = new Discord.EmbedBuilder()
    .setTitle("**SHOP**")
    .setDescription(`To purchase an item, use the \`${prefix}purchase\` command.`)
    .setColor("7f7fff")
    .setFooter(`Valtz: ${stats.coins} | GV: ${stats.gv}`)
    .setTimestamp();

  // Add each item to the embed dynamically
  items.forEach((item, index) => {
    shopdisplay.addField(`**[${index + 1}]:** ${item.name}`, `${item.description} | Price: <:${item.currency}:999800344848650410>${item.price}`);
  });

  // Send the embed
  message.channel.send({ embed: shopdisplay });
}

module.exports.help = {
  name: "shop",
  aliases: ["s"]
};
