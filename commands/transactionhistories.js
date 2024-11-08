const Discord = require("discord.js");

module.exports.run = async (client, message, args, prefix, player, db) => {
    let stats = await db.collection("users").findOne({ _id: message.author.id });
    if (!stats) return message.reply(`It seems you haven't started the game yet. Please type \`${prefix}start\` to begin the game.`);

    // Handle 'upgrade' option
    if (args[0]?.toLowerCase() === "upgrade") {
        if (stats.hslots >= 50) {
            return message.reply(`You've already reached the maximum amount of transaction history slots that can be unlocked.`);
        }
        if (stats.gv < 2) {
            return message.reply("You need 2 Golden Valtz to upgrade your transaction history slots.");
        }

        // Update user's stats for the upgrade
        stats.hslots += 10;
        stats.gv -= 2;
        await db.collection("users").updateOne({ _id: message.author.id }, { $set: { hslots: stats.hslots, gv: stats.gv } });

        message.channel.send(`Purchase made! You now have ${stats.hslots} transaction history slots.`);

        // Handle 'clear' option
    } else if (args[0]?.toLowerCase() === "clear") {
        await db.collection("users").updateOne({ _id: message.author.id }, { $set: { histories: [] } });
        message.channel.send("Histories cleared!");

        // Show transaction histories
    } else {
        let histories = stats.histories.length > 0 ? stats.histories.join("\n") : "You have no recorded transaction histories.";
        let embed = new Discord.EmbedBuilder()
            .setTitle(`Your transaction histories (${stats.histories.length}/${stats.hslots})`)
            .setDescription(histories)
            .setColor("#7f7fff");
        message.channel.send({ embeds: [embed] });
    }
}

module.exports.help = {
    name: "transactionhistories",
    aliases: ["transactionhistory", "th"],
    desc: "Check your trade and payment history.",
    usage: "transactionhistories - Show all of your recorded transaction histories.\ntransactionhistories upgrade - Buy 10 more extra transaction history slots. They cost <:premiumvaltz:899373241557209158>2.\ntransactionhistory clear - Clear your histories so new ones can get recorded."
}
