const Item = require("./Item.js");

class Toolbox extends Item {
    constructor() {
        super("Toolbox", 250);
    }

    async use(client, message, args, prefix, iindex, db) {
        try {
            let stats = await db.collection("users").findOne({ _id: message.author.id });

            // Check if index is provided
            if (!args[1]) {
                return message.reply("Please provide the index number of the broken Bey you wish to fix.");
            }

            let bindex = parseInt(args[1]) - 1; // Convert to zero-based index

            // Check if the Bey exists at the given index
            if (!stats.beys[bindex]) {
                return message.reply("No Bey found at that index. Please try again.");
            }

            let bey = stats.beys[bindex];

            // Check if the Bey is broken
            if (!bey.broken || bey.broken === false) {
                return message.reply("That Bey is not broken.");
            }

            // Fix the Bey and update the stats
            bey.broken = false;
            stats.items.splice(iindex, 1);  // Remove the toolbox from the items
            await db.collection("users").updateOne({ _id: message.author.id }, { $set: { beys: stats.beys, items: stats.items } });

            message.channel.send(`✅ Successfully fixed **[${bindex + 1}] ${bey.name}**!`);
        } catch (error) {
            console.error("Error using Toolbox:", error);
            message.channel.send("An error occurred while trying to fix the Bey.");
        }
    }
}

module.exports = Toolbox;
