const Item = require("./Item.js");
const Discord = require("discord.js");

class AvatarEmbryo extends Item {
    constructor() {
        super("AvatarEmbryo", 1999); // Set item name and cost
        this.xp = 1; // Default xp for the AvatarEmbryo
    }

    async use(client, message, args, prefix, iindex, db) {
        let stats = await db.collection("users").findOne({ _id: message.author.id });

        // Check if the user has an item at the given index and if args[0] is valid
        if (!args[0] || isNaN(args[0]) || args[0] <= 0 || args[0] > stats.items.length) {
            return message.channel.send("Invalid item index. Please provide a valid number.");
        }

        // Access the item's xp and handle any potential errors
        const itemIndex = parseInt(args[0]) - 1;
        const item = stats.items[itemIndex];

        if (!item || !item.xp) {
            return message.channel.send("This item doesn't have xp data.");
        }

        let embed = new Discord.EmbedBuilder()
            .setTitle("Hi, I'm an Avatar Embryo!")
            .setDescription(`I'm looking forward to my adventures with you. Just \`;attach\` me to your equipped Bey and I will be beside you as you face powerful foes!\n\n**EXPs**: ${item.xp} / 900`)
            .setImage("https://static.wikia.nocookie.net/beyblade/images/5/50/Beyblade_Burst_Chouzetsu_Cho-Z_Valkyrie_Zenith_Evolution_vs_Cho-Z_Achilles_00_Dimension_2.png/revision/latest/scale-to-width-down/1000?cb=20190507222656")
            .setColor("#fbb804");

        message.channel.send({ embeds: [embed] }); // Send the embed message
    }
}

module.exports = AvatarEmbryo;
