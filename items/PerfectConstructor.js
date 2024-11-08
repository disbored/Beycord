const Item = require("./Item.js");

class PerfectConstructor extends Item {
    constructor() {
        super("PerfectConstructor", 2000);
    }

    async use(client, message, args, prefix, iindex, db) {
        try {
            let stats = await db.collection("users").findOne({ _id: message.author.id });
            message.channel.send("Please provide the index number of the \"Phoenixes\" you wish to use in order to construct a Perfect Phoenix using the following format: \`\`Revive Phoenix|Dead Phoenix\`\`.\n*Example: 4|5*");

            let awaitps = await message.channel.awaitMessages(m => m.author.id === message.author.id, { maxMatches: 1, time: 300000 });
            if (awaitps[0].content.toLowerCase() === "cancel") return message.channel.send("Prompt cancelled.");

            let ps = awaitps[0].content.split("|");
            if (!ps[1]) return message.reply("Please provide the index number of the Dead Phoenix you wish to use.");

            let rindex = parseInt(ps[0]) - 1;
            let dindex = parseInt(ps[1]) - 1;
            let rp = stats.beys[rindex];
            let dp = stats.beys[dindex];

            if (!rp) return message.reply("No Revive Phoenix found.");
            if (!dp) return message.reply("No Dead Phoenix found.");
            if (rp.name !== "Revive Phoenix") return message.reply("That's not a Revive Phoenix.");
            if (dp.name !== "Dead Phoenix") return message.reply("That's not a Dead Phoenix.");

            let msg = await message.channel.send("Constructing...");
            let chance = Math.round(Math.random() * 100);

            setTimeout(async () => {
                if (chance < 16) {
                    let ppc = client.beys.get("Perfect Phoenix");
                    let pp = new ppc(message.author.id);
                    pp.init(message);
                    stats.items.splice(iindex, 1);
                    stats.beys.splice(stats.beys.indexOf(rp), 1);
                    stats.beys.splice(stats.beys.indexOf(dp), 1);
                    stats.beys.push(pp);
                    await db.collection("users").updateOne({ _id: message.author.id }, { $set: { items: stats.items, beys: stats.beys } });
                    msg.edit({ content: "Construct ||successful! Enjoy your Perfect Phoenix!||" });
                } else {
                    stats.items.splice(iindex, 1);
                    stats.beys.splice(stats.beys.indexOf(rp), 1);
                    stats.beys.splice(stats.beys.indexOf(dp), 1);
                    await db.collection("users").updateOne({ _id: message.author.id }, { $set: { items: stats.items, beys: stats.beys, xp: stats.xp + 50 } });
                    msg.edit({ content: "Construct ||unsuccessful... How unfortunate it is.||" });
                }
            }, 5000);
        } catch (error) {
            console.error("Error using PerfectConstructor item:", error);
            message.channel.send("An error occurred while processing the item.");
        }
    }
}

module.exports = PerfectConstructor;
