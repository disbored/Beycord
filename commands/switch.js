const Discord = require("discord.js");

module.exports.run = async (client, message, args, prefix, player, db) => {
  try {
    let stats = await db.collection("users").findOne({ _id: message.author.id });
    if (!stats) return message.reply(`you haven't started the game yet. Type \`\`${prefix}start\`\` to begin.`);

    let bey = stats.beys[stats.main];
    let examplec = client.beys.get(bey.name);
    let example = new examplec("1");

    // Check if spin direction is changeable
    if ((!bey.sdchangable || bey.sdchangable === false) && example.sdchangable === true) {
      bey.sdchangable = true;
      bey.sd = 0; // Default to Right
      stats.beys[stats.main] = bey;
      await db.collection("users").updateOne({ _id: message.author.id }, { $set: { beys: stats.beys } });
      return message.reply(`Your ${bey.name} was outdated and has been updated with the new spin direction feature! 😎 (Thanks for being an OG player!)`);
    }

    if (!bey.sdchangable || bey.sdchangable === false) {
      return message.reply(`The spin direction of ${bey.name} cannot be changed.`);
    }

    // Toggle spin direction
    if (bey.sd === undefined || bey.sd === 0) {
      bey.sd = 1; // Switch to Left
    } else {
      bey.sd = 0; // Switch to Right
    }

    stats.beys[stats.main] = bey;
    await db.collection("users").updateOne({ _id: message.author.id }, { $set: { beys: stats.beys } });

    // Send response to the user
    const sds = ["Right", "Left"];
    return message.channel.send(`Spin direction for ${bey.name} changed to ${sds[bey.sd]}.`);
  } catch (err) {
    console.error("Error occurred while processing the switch command:", err);
    return message.reply("An error occurred while processing your request. Please try again later.");
  }
}

module.exports.help = {
  name: "switch",
  aliases: ["changesd", "switchsd", "sd"],
  desc: "Changes the Bey's spin direction. (if possible).",
  usage: "switch -- Read desc"
}
