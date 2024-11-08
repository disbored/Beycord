const Discord = require("discord.js");
const jimp = require("jimp");
const fs = require("fs");

module.exports.run = async (client, message, args, prefix, player, db) => {
    message.channel.sendTyping();

    // Fetch player stats
    let stats = await db.collection("users").findOne({ _id: message.author.id });
    if (!stats) return message.reply(`You haven't started the game yet. Type \`\`${prefix}start\`\` to begin.`);

    let main = stats.beys[stats.main];
    let gen = main.gen || 1;
    let requiredLevel = gen * 20; // Level required for each generation
    let requiredStars = 25; // Stars required for each upgrade

    // Check if the player can upgrade
    if (main.level < requiredLevel) return message.channel.send(`*Upgrade failed!*. Please reach level ${requiredLevel} before attempting an upgrade.`);
    if (stats.stars < requiredStars) return message.channel.send(`*Upgrade failed!* You don't have enough stars.`);

    // Start the upgrade process
    let newImage = await upgradeBeyImage(main.image, gen);
    if (!newImage) {
        message.channel.send(`*Upgrade failed!* Please try again.`);
        db.collection("users").updateOne({ _id: message.author.id }, { $set: { stars: stats.stars - 1 } });
        return;
    }

    // Send the upgraded image
    let embed = new Discord.EmbedBuilder()
        .setTitle(`${main.bbname || main.name} is now upgraded to Generation ${gen + 1}!`)
        .setColor("#7f7fff")
        .setImage(`attachment://${message.author.id}gen${gen + 1}.png`)
        .setTimestamp();

    let msg = await message.channel.send({ embeds: [embed], files: [{ attachment: newImage, name: `${message.author.id}gen${gen + 1}.png` }] });

    // Update player's Bey data and deduct stars
    stats.beys[stats.main].image = msg.attachments.first().url;
    stats.beys[stats.main].gen = gen + 1;
    db.collection("users").updateOne({ _id: message.author.id }, { $set: { beys: stats.beys, stars: stats.stars - requiredStars } });

    // Cleanup temporary files
    fs.unlink(`./tempimages/${message.author.id}gen${gen + 1}.png`, (err) => {
        if (err) console.log(err);
    });
};

// Function to upgrade Bey image
async function upgradeBeyImage(imageUrl, gen) {
    let images = [imageUrl, "https://media.discordapp.net/attachments/863630426411892766/865079465717792778/null.png?width=498&height=498"];
    let jimps = [];
    for (let i = 0; i < images.length; i++) {
        jimps.push(jimp.read(images[i]));
    }

    try {
        let data = await Promise.all(jimps);
        data[0].resize(400, 390); // Resize Bey image
        let outputImage = data[1].clone();
        outputImage.composite(data[0], 55, 65); // Overlay resized Bey image

        let filePath = `./tempimages/${message.author.id}gen${gen + 1}.png`;
        await outputImage.writeAsync(filePath); // Save image

        return filePath;
    } catch (err) {
        console.error("Error upgrading Bey image:", err);
        return null;
    }
}

module.exports.help = {
    name: "upgrade",
    desc: "Upgrades your equipped Bey to its next generation.",
    usage: "upgrade <bey index>",
    aliases: ["genup", "generationup"],
    cooldown: 10
};
