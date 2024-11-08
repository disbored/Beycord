const Item = require("./Item.js");
const Discord = require("discord.js");

class Pocket extends Item {
    constructor() {
        super("Pocket", Infinity);
        this.tickets = 0;
        this.premium = 0;
    }

    async use(client, message, args, prefix, iindex, db) {
        try {
            let stats = await db.collection("users").findOne({ _id: message.author.id });
            let pocket = stats.items[parseInt(args[0]) - 1];
            if (!pocket) {
                return message.reply("That pocket does not exist.");
            }

            let embed = new Discord.EmbedBuilder()
                .setTitle("Pocket")
                .setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.displayAvatarURL())
                .setColor("#eaab15")
                .setDescription(`${pocket.tickets} <:giveawayticket:863052676182966293>\n${pocket.premium} <:premiumgt:863052676077453372>`)
                .setThumbnail("https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/twitter/259/party-popper_1f389.png");

            message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error("Error using Pocket item:", error);
            message.channel.send("An error occurred while processing your request.");
        }
    }
}

module.exports = Pocket;
