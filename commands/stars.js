const Discord = require('discord.js');

module.exports.run = async (client, message, args, prefix, player, db) => {
    let stats = await db.collection("users").findOne({ _id: message.author.id });
    if (!stats) return message.reply(`it seems like you haven't started the game yet. Please type \`${prefix}start\` to begin.`);

    let starred = stats.beys.filter(bey => bey.starred);
    let maxpages = Math.ceil(starred.length / 25) || 1;
    let page = parseInt(args[0]) || 1;

    // Validate the page input
    if (isNaN(page) || page < 1 || page > maxpages) {
        return message.reply("Invalid page number. Please specify a page number between 1 and " + maxpages + ".");
    }

    let stars = "";
    for (let i = (page - 1) * 25; i < (page - 1) * 25 + 25; i++) {
        let crnt = starred[i];
        if (crnt) {
            if (client.shadowbeys.has(crnt.name)) stars += "<:black:721678218859511829>";
            if (crnt.broken) stars += "<a:alert:724198069226438686>";
            if (crnt.level === 0) stars += "<:level0:722078650190528583>";
            stars += `⭐**[${parseInt(stats.beys.indexOf(crnt)) + 1}]:** Level ${crnt.level} ${crnt.bbname || crnt.name}\n`;
        }
    }

    let embed = new Discord.EmbedBuilder()
        .setTitle("Starred Beys")
        .setAuthor(message.author.username + "#" + message.author.discriminator, message.author.avatarURL)
        .setDescription(stars || "You haven't starred any Beys yet.")
        .setFooter(`PAGE ${page}/${maxpages}`)
        .setColor("#7f7fff")
        .setTimestamp();

    message.channel.send({ embeds: [embed] });
};

module.exports.help = {
    name: "stars",
    aliases: ["starredbeys", "sbs"],
    desc: "View all of the starred Beys.",
    usage: "stars - View the first page of starred Beys.\nstars <page number> - View a page of starred Beys."
};
