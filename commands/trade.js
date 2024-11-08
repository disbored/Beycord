const Discord = require("discord.js");
const jimp = require("jimp");
const fs = require("fs");

module.exports.run = async (client, message, args, prefix, player, db) => {
  let stats = await db.collection("users").findOne({ _id: message.author.id });
  if (!stats) return message.reply(`you haven't started the game yet. Type \`\`${prefix}start\`\` to begin.`);

  let tuser = message.mentions[0] ? await message.guild.member.cache.get(message.mentions[0].id) :
    args[0] ? await message.guild.member.cache.get(args[0]) : null;

  if (!tuser) return message.channel.send(`Please type \`${prefix}help trade\` to know how to use the command properly.`);
  if (tuser.id === message.author.id) return message.reply("why are you trying to trade yourself?");
  if (tuser.id === "827343111234519040") return message.reply("***No.***");

  let stats2 = await db.collection("users").findOne({ _id: tuser.id });
  if (!stats2) return message.reply(`the player hasn't started the game yet. Type \`\`${prefix}start\`\` to begin.`);
  if (stats2.settings.treqs === false) return message.reply("that player has turned off their trades.");
  if (!args[1] || !args[2]) return message.channel.send(`Please type \`${prefix}help trade\` to know how to use the command properly.`);

  if (stats.states.isTrading || stats2.states.isTrading) return message.reply("One or both of you are already in a trade. Please cancel previous trades first.");

  let index1 = parseInt(args[1]) - 1;
  let index2 = parseInt(args[2]) - 1;
  if (index1 === 0 || index2 === 0) return message.channel.send("***No.***");

  let bey1 = stats.beys[index1];
  let bey2 = stats2.beys[index2];

  if (!bey1 || !bey2) return message.reply("One of the selected Beys doesn't exist.");
  if (bey1.attached || bey2.attached) return message.channel.send(`Please \`${prefix}detach\` the item on your Bey before attempting to trade it.`);

  let cost = 10 + 10;  // Base cost
  // Add cost based on Bey type
  cost += getBeyCost(bey1, client) + getBeyCost(bey2, client);

  let halved = Math.round(cost / 2);
  if (stats.coins < halved || stats2.coins < halved) {
    return message.channel.send(`Insufficient Valtz. Make sure both players have enough Valtz to pay for the trading fees. (<:valtz:899373217255407646>${halved})`);
  }

  // Generate trade image
  let images = ["https://cdn.discordapp.com/attachments/1032009191960887388/1034181897485565972/bbackground.jpg", bey1.image, bey2.image];
  let imagePromises = images.map(img => jimp.read(img));

  Promise.all(imagePromises)
    .then(data => {
      data[1].resize(700, 700);
      data[2].resize(700, 700);
      data[0].composite(data[1], 100, 240);
      data[0].composite(data[2], 1150, 240);
      return data[0].write(`./tempimages/${message.author.id}-${tuser.id}trade.png`);
    })
    .then(async () => {
      let tradeimage = fs.readFileSync(`./tempimages/${message.author.id}-${tuser.id}trade.png`);
      let embed = new Discord.EmbedBuilder()
        .setDescription(`${message.member.effectiveName} is trading a ***Level ${bey1.level} ${bey1.name}*** for ${tuser.effectiveName}'s ***Level ${bey2.level} ${bey2.name}***.\n\nThe trade will proceed once both players have confirmed by reacting with a ✅. React with ❌ to cancel.`)
        .setColor("#7f7fff")
        .setTimestamp()
        .setImage(`attachment://${message.author.id}-${tuser.id}trade.png`);

      let msg = await message.channel.send({ embeds: [embed] }, { files: [{ attachment: tradeimage, name: `${message.author.id}-${tuser.id}trade.png` }] });

      // Set trading states
      await db.collection("users").updateOne({ _id: message.author.id }, { $set: { "states.isTrading": true } });
      await db.collection("users").updateOne({ _id: tuser.id }, { $set: { "states.isTrading": true } });
      await msg.react("✅");
      await msg.react("❌");

      const reactions = await msg.awaitReactions({
        filter: (reaction, user) => user.id === message.author.id,  // Ensure the reaction is from the right user
        max: 1,  // Collect a maximum of 1 reaction
        time: 300000,  // Time limit of 5 minutes (300,000 milliseconds)
        errors: ['time'],  // Handle the timeout case
      });
      if (reactions[0].emoji.name === "❌") {
        await cancelTrade(message, tuser);
        return message.channel.send(`Trade cancelled by ${message.member.effectiveName}.`);
      }

      embed.setDescription(`${message.member.effectiveName} is waiting for ${tuser.effectiveName} to react...`);
      await msg.edit({ embeds: [embed], files: [{ attachment: tradeimage, name: `${message.author.id}-${tuser.id}trade.png` }] });

      const reactions2 = await msg.awaitReactions({
        filter: (reaction, user) => user.id === tuser.id,  // Ensure the reaction is from the right user (tuser)
        max: 1,  // Collect a maximum of 1 reaction
        time: 300000,  // Time limit of 5 minutes (300,000 milliseconds)
        errors: ['time'],  // Handle the timeout case
      });
      if (reactions2[0].emoji.name === "❌") {
        await cancelTrade(message, tuser);
        return message.channel.send(`Trade cancelled by ${tuser.effectiveName}.`);
      }

      // Finalize the trade
      await completeTrade(bey1, bey2, stats, stats2, halved, message, tuser);
    })
    .catch(err => {
      message.channel.send("Error while processing the image.");
      console.error(err);
    });
};

// Utility functions
function getBeyCost(bey, client) {
  if (client.commonbeys.has(bey.name)) return 10;
  if (client.specialbeys.has(bey.name)) return 25;
  if (client.rarebeys.has(bey.name)) return 50;
  if (client.legendarybeys.has(bey.name)) return 100;
  if (client.availablebeys.has(bey.name)) return 500;
  if (client.shadowbeys.has(bey.name)) return 1000;
  return 1000; // Default cost
}

async function cancelTrade(message, tuser) {
  await db.collection("users").updateOne({ _id: message.author.id }, { $set: { "states.isTrading": false } });
  await db.collection("users").updateOne({ _id: tuser.id }, { $set: { "states.isTrading": false } });
}

async function completeTrade(bey1, bey2, stats, stats2, halved, message, tuser) {
  bey1.starred = false;
  bey2.starred = false;

  // Swap the Beys
  stats.beys.push(bey2);
  stats2.beys.push(bey1);
  stats.beys.splice(stats.beys.indexOf(bey1), 1);
  stats2.beys.splice(stats2.beys.indexOf(bey2), 1);

  // Update histories
  if (stats.histories.length < stats.hslots) stats.histories.push(`-${bey1.name} +${bey2.name} (Traded with ${tuser.id})`);
  if (stats2.histories.length < stats2.hslots) stats2.histories.push(`-${bey2.name} +${bey1.name} (Traded with ${message.author.id})`);

  // Update database
  await db.collection("users").updateOne({ _id: message.author.id }, { $set: { beys: stats.beys, histories: stats.histories, xp: stats.xp + 10, "states.isTrading": false, coins: stats.coins - halved } });
  await db.collection("users").updateOne({ _id: tuser.id }, { $set: { beys: stats2.beys, histories: stats2.histories, xp: stats2.xp + 10, "states.isTrading": false, coins: stats2.coins - halved } });

  // Final confirmation message
  message.channel.send(`${message.member.effectiveName} and ${tuser.effectiveName} have successfully traded!`);
}
