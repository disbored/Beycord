const { EmbedBuilder } = require("discord.js");

module.exports.run = async (client, message, args, prefix, player, db) => {
  if (message.channel.id !== process.env.approvalChannel) return;

  const [beyID, ...reasonParts] = args;
  if (!beyID) return message.reply("Please provide the ID of the Buddy Bey you want to decline.");

  const stats = await db.collection("buddybeys").findOne({ _id: beyID });
  if (!stats) return message.reply("No Buddy Bey found or it might've already been approved or declined.");

  try {
    const user = await client.users.cache.get(stats.submitter);
    if (!user) return message.reply("An error occurred while declining this Bey. Please try again.");

    if (reasonParts.length === 0) return message.reply("Please leave a message for the Buddy Bey submitter.");
    const amessage = reasonParts.join(" ");

    const declinedEmbed = new EmbedBuilder()
      .setTitle(`😢 Sorry but your Buddy Bey, ${stats.bey.bbname} has been declined`)
      .setDescription(`**Decliner:** ${message.author.tag}\n**Message from decliner:** ${amessage}\nYou got your Buddy Bey Kit back so that you can retry.`)
      .setColor("#7f7fff")
      .setTimestamp();

    // Update user's items in the database
    await db.collection("users").updateOne(
      { _id: stats.submitter },
      { $push: { items: { name: "Buddy Bey Kit", civ: 20000, cigv: 1 } } }
    );

    // Remove the declined Bey
    await db.collection("buddybeys").deleteOne({ _id: stats._id });

    // Send a DM to the user with the declined message
    await user.send({ embeds: [declinedEmbed] });

    // Confirmation message in the approval channel
    message.channel.send(`✅ Successfully declined #${beyID}!`);

  } catch (error) {
    console.error("An error occurred while declining the Buddy Bey:", error);
    message.reply("An error occurred. Please try again.");
  }
};

module.exports.help = {
  name: "declinebb",
  desc: "Decline a Buddy Bey. AUTHORIZED ACCESS ONLY",
  aliases: [],
  usage: "declinebb <ID> <message> - Decline a Buddy Bey according to the ID."
};
