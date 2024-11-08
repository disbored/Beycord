module.exports.run = async (client, message, args, prefix, player, db) => {
    const stats = await db.collection("users").findOne({ _id: message.author.id });
    if (!stats) {
        return message.reply(`You haven't started the game yet. Type \`${prefix}start\` to begin.`);
    }

    if (!args[0]) {
        return message.reply(`Please type \`${prefix}help detach\` to know how to use this command.`);
    }

    const bindex = parseInt(args[0]) - 1;
    if (isNaN(bindex)) {
        return message.reply("Indexes must be a number found in your inventory.");
    }

    const bey = stats.beys[bindex];
    if (!bey) {
        return message.reply("No Bey found.");
    }

    if (!bey.attached) {
        return message.reply("That Bey doesn't have any item attached to it.");
    }

    const item = bey.attached;
    stats.beys[bindex].attached = null;

    await db.collection("users").updateOne(
        { _id: message.author.id },
        { $set: { beys: stats.beys }, $push: { items: item } }
    );

    message.reply(`Successfully detached ${item.name} from ${bey.name}! The detached item can be found in your item inventory with the index \`${stats.items.length + 1}\`.`);
};

module.exports.help = {
    name: "detach",
    aliases: ["d", "dtch"],
    desc: "Detach an item from a Bey.",
    usage: "detach <bey index>"
};
