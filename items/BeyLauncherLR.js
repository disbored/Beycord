const Item = require("./Item.js");
const Discord = require("discord.js");

// Image URLs for different BeyLaunchers
const images = {
    "B-119": "https://media.discordapp.net/attachments/692234599350140961/820207153750736917/image-removebg-preview.png",
    "B-00": "https://media.discordapp.net/attachments/692234599350140961/820206994378981396/image-removebg-preview.png",
    "B-88": "https://media.discordapp.net/attachments/692234599350140961/820206898526552094/image-removebg-preview.png"
};

class BeyLauncherLR extends Item {
    constructor(launcher) {
        super("BeyLauncherLR", 1499, Infinity); // Initialize parent Item class
        const launcherList = ["B-88", "B-119", "B-00"];
        // Randomly assign a launcher or use the provided one if available
        this.var = launcher ? launcher.var : launcherList[Math.floor(Math.random() * launcherList.length)];
    }

    async use(client, message, args, prefix, iindex) {
        // Create and send an embed with launcher details
        const embed = new Discord.EmbedBuilder()
            .setThumbnail(images[this.var])
            .setTitle(`BeyLauncher LR ${this.var}`)
            .setColor("#00c674")
            .setDescription("Just your average left-right string launcher.\n\n\`\`\`xl\nStability Drop-\nStamina+\n\`\`\`")
            .setFooter(`${prefix}lc for more interaction with launchers`);

        message.channel.send({ embeds: [embed] }); // Send the embed
    }

    // Boost function that increases stamina and stability
    boost(acted, victim, logger) {
        acted.stamina += 0.2;
        acted.stability += 2;
    }
}

module.exports = BeyLauncherLR;
