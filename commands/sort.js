module.exports.run = async (client, message, args, prefix, player, db) => {
    let stats = await db.collection("users").findOne({ _id: message.author.id });
    if (!stats) return message.reply(`you haven't started the game yet. Type \`\`${prefix}start\`\` to begin.`);

    if (!args[0]) return message.reply("please provide a sort option.");

    let sortOption = args[0].toLowerCase();  // Handling case-insensitive input

    switch (sortOption) {
        case "alphabetically":
            if (stats.invsort === "abc") {
                return message.channel.send("Your inventory is already sorted alphabetically.");
            }
            db.collection("users").updateOne({ _id: message.author.id }, { $set: { invsort: "abc" } });
            message.channel.send("✅ Inventory successfully configured to sort alphabetically.");
            break;
        case "level":
            if (stats.invsort === "level") {
                return message.channel.send("Your inventory is already sorted by levels.");
            }
            db.collection("users").updateOne({ _id: message.author.id }, { $set: { invsort: "level" } });
            message.channel.send("✅ Inventory successfully configured to sort according to levels.");
            break;
        case "index":
            if (stats.invsort === "index") {
                return message.channel.send("Your inventory is already sorted by index.");
            }
            db.collection("users").updateOne({ _id: message.author.id }, { $set: { invsort: "index" } });
            message.channel.send("✅ Inventory successfully configured to sort according to indexes.");
            break;
        default:
            return message.reply(`invalid option, please view all the options at \`${prefix}help sort\` and try again.`);
    }
};

module.exports.help = {
    name: "sort",
    aliases: ["si", "sortinv"],
    desc: "Sort your inventory to find Beys faster.",
    usage: "sort <sort option>\n\n**Sort Options:**\nlevel\nalphabetically\nindex"
};
