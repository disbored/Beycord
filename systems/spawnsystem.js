const { EmbedBuilder } = require("discord.js");

module.exports.run = async (message, prefix, db, available, client) => {
  try {
    // Fetch the guild's server data
    const server = await db.collection("guilds").findOne({ _id: message.guild.id });
    let spawn;

    // Determine the spawn channel based on redirection
    if (server.redirect !== "nothing") {
      spawn = await db.collection("channels").findOne({ _id: server.redirect }) || { _id: message.channel.id, bey: "nothing", type: "nothing", answer: "number", settings: { spawn: true, dcommands: [] } };
    } else {
      spawn = await db.collection("channels").findOne({ _id: message.channel.id }) || { _id: message.channel.id, bey: "nothing", type: "nothing", answer: "number", settings: { spawn: true, dcommands: [] } };
    }

    // Randomly select a beyblade from available options
    const result = Math.floor(Math.random() * available.length);
    const selected = available[result];
    const cons = client.beys.get(selected);
    const prebey = new cons("1", "1");

    // Generate a random math question
    const ok1 = Math.floor(Math.random() * 20);
    const ok2 = Math.floor(Math.random() * 20);
    const answer = ok1 + ok2;

    // Create embed message
    const sembed = new EmbedBuilder()
      .setTitle("A Bey spawned!")
      .setThumbnail(prebey.image)
      .setDescription(`\`\`\`${ok1} + ${ok2}\`\`\``)
      .setColor("#f90b06")
      .setFooter(`Do ${prefix}help claim for a claiming guide.`);

    // Update the spawn data in the database
    spawn.bey = selected;
    spawn.type = prebey.type;
    spawn.answer = answer;

    if (server.redirect !== "nothing") {
      // If redirected, find the target channel and send the embed
      const rchannel = message.guild.channels.cache.get(server.redirect);
      if (rchannel && rchannel.isText()) {
        await db.collection("channels").updateOne({ _id: server.redirect }, { $set: { bey: selected, type: prebey.type, answer: answer } });
        rchannel.send({ embeds: [sembed] });
      }
    } else {
      // Update the current channel and send the embed
      await db.collection("channels").updateOne({ _id: message.channel.id }, { $set: { bey: selected, type: prebey.type, answer: answer } });
      message.channel.send({ embeds: [sembed] });
    }
  } catch (error) {
    console.error("Error in spawnsystem command:", error);
    message.channel.send("There was an error trying to spawn a bey.");
  }
};

module.exports.help = {
  name: "spawnsystem",
};
