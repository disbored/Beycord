const Discord = require("discord.js");

module.exports.run = async (client, message, args, prefix, player, db) => {
    let stats = await db.collection("users").findOne({ _id: message.author.id });
    if (!stats) return message.reply(`please start the game first and try again. Type \`${prefix}start\` to begin the game.`);

    if (args[0] && args[0].toLowerCase() === "enable") {
        if (!args[1]) return message.reply("please provide a setting that you would like to enable.");
        switch (args[1].toLowerCase()) {
            case "battle":
                stats.settings.breqs = true;
                db.collection("users").updateOne({ _id: message.author.id }, { $set: { settings: stats.settings } })
                message.channel.send("Enabled battle requests!");
                break;
            case "trade":
                stats.settings.treqs = true;
                db.collection("users").updateOne({ _id: message.author.id }, { $set: { settings: stats.settings } })
                message.channel.send("Enabled trade requests!");
                break;
            case "inv":
                stats.settings.inv = true;
                db.collection("users").updateOne({ _id: message.author.id }, { $set: { settings: stats.settings } })
                message.channel.send("Enabled inventory viewing from others!");
                break;
            default:
                message.channel.send("Invalid option. Type `!settings help` for a list of available settings.");
        }
    } else if (args[0] && args[0] === "disable") {
        if (!args[1]) return message.reply("please provide a setting that you would like to disable.");
        switch (args[1].toLowerCase()) {
            case "battle":
                stats.settings.breqs = false;
                db.collection("users").updateOne({ _id: message.author.id }, { $set: { settings: stats.settings } })
                message.channel.send("Disabled battle requests!");
                break;
            case "trade":
                stats.settings.treqs = false;
                db.collection("users").updateOne({ _id: message.author.id }, { $set: { settings: stats.settings } })
                message.channel.send("Disabled trade requests!");
                break;
            case "inv":
                stats.settings.inv = false;
                db.collection("users").updateOne({ _id: message.author.id }, { $set: { settings: stats.settings } })
                message.channel.send("Disabled inventory viewing from others!");
                break;
            default:
                message.channel.send("Invalid option. Type `!settings help` for a list of available settings.");
        }
    } else {
        let breqs = stats.settings.breqs ? ":white_check_mark:" : ":x:";
        let treqs = stats.settings.treqs ? ":white_check_mark:" : ":x:";
        let inv = stats.settings.inv ? ":white_check_mark:" : ":x:";

        let embed = new Discord.EmbedBuilder()
            .setTitle("Settings")
            .setColor("#7f7fff")
            .setAuthor(message.author.username + "#" + message.author.discriminator, message.author.avatarURL)
            .setDescription(`Type \`${prefix}help settings\` to know what each setting means and how to configure them.\n\n**Battle Requests:** ${breqs}\n**Trade Requests:** ${treqs}\n**Inventory Viewing:** ${inv}`)
            .setFooter("Use `enable` or `disable` to change your settings.");

        message.channel.send({ embed: embed });
    }
}

module.exports.help = {
    name: "settings",
    aliases: ["setting", "configself", "configureself"],
    usage: "settings - Shows your current settings\nsettings enable <setting> - Enables a setting\nsettings disable <setting> - Disables a setting\n\n__**Settings:**__\nbattle - Battle requests\ntrade - Trade requests\ninv - Allow others to see your inventory",
    desc: "Configure your settings."
}
