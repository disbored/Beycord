module.exports.run = async (client, message, args, prefix, player, db) => {
    let stats = await db.collection("users").findOne({ _id: message.author.id });
    if (!stats) return message.reply(`it seems like you haven't started the game yet. Please type \`${prefix}start\` to begin.`);

    if (!args[0] || isNaN(args[0])) return message.reply("please provide a valid index number of the Bey you wish to star/unstar.");
    let index = parseInt(args[0]) - 1; // Convert to 0-based index

    if (!stats.beys[index]) return message.reply("no Bey found at this index. Please try again.");

    let bey = stats.beys[index];
    if (bey.starred) {
        // Unstar the Bey
        stats.beys[index].starred = false;
        await db.collection("users").updateOne({ _id: message.author.id }, { $set: { beys: stats.beys } });
        message.channel.send(`✅ Successfully unstarred [${index + 1}] ${bey.bbname || bey.name}.`);
    } else {
        // Star the Bey
        stats.beys[index].starred = true;
        await db.collection("users").updateOne({ _id: message.author.id }, { $set: { beys: stats.beys } });
        message.channel.send(`✅ Successfully starred [${index + 1}] ${bey.bbname || bey.name}.`);
    }
};

module.exports.help = {
    name: "star",
    aliases: ["unstar", "fav", "addfav", "removefav"],
    desc: "Star or unstar a Bey.",
    usage: "star <bey index number> - Star or unstar that Bey."
};
