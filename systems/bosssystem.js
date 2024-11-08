const { EmbedBuilder } = require('discord.js');

async function start(client, message, prefix, player, db, boss) {
    // Create an embed for the wait message
    let waitembed = new EmbedBuilder()
        .setTitle("***A boss appears!***")
        .setDescription("Players have 1 minute to join.")
        .setAuthor("Boss Battle", client.user.avatarURL())
        .setImage(boss.image);

    await message.channel.send({ embeds: [waitembed] });

    // Await messages to join the boss fight
    let joins = await message.channel.awaitMessages({
        filter: m => m.content.toLowerCase() === boss.keyword && !boss.players.includes(m.author.id),
        time: 60000,
    });

    if (joins.length <= 0) {
        return message.channel.send(`${boss.name} ran away because no one joined.`);
    }

    boss.users = new Map();
    joins.forEach(async join => {
        let stats = await db.collection("users").findOne({ _id: join.author.id });

        if (!boss.players.includes(join.author.id) && stats.states.inBattle !== true) {
            boss.players.push(join.author.id);
            boss.users.set(join.author.id, join.author);

            // Set initial stats for the joined player
            join.author.hp = 300;
            join.author.atk = 21;
            join.author.stamina = 3;
            join.author.sp = 3;
            join.author.sd = stats.beys[stats.main].sd || "Right";

            if (stats.beys[stats.main].name === "Guardian Kerbeus Red Ver. <:haoyunshu:844767503813050369>") {
                stats.beys[stats.main].name = "Guardian Kerbeus Red Ver. HYS";
            }

            join.author.bey = new (client.beys.get(stats.beys[stats.main].name))(join.author.id, stats.beys[stats.main].id, stats.beys[stats.main]);
            join.author.lvl = stats.beys[stats.main].level;
            join.author.hp += (stats.beys[stats.main].level - 1) * 5;
            join.author.stamina += (stats.beys[stats.main].level - 1) * 0.051;

            // Apply class-specific bonuses
            if (join.author.stamina > 10) join.author.stamina = 10;
            if (join.author.bey.type === "Stamina") join.author.stamina += 2;
            if (join.author.bey.type === "Balance") join.author.stamina += 1;
            if (join.author.bey.sd === "Right") join.author.atk += 2;
            if (join.author.bey.sd === "Left") join.author.stamina += 1;

            join.author.maxstamina = join.author.stamina;
            join.author.maxhp = join.author.hp;
            join.author.wins = stats.wins;
            join.author.xp = stats.xp;
            join.author.valtz = stats.valtz;
            join.author.stats = stats;
            join.author.passiveAllowed = true;
            join.author.bleed = { status: false, dmg: 0, turn: 0 };
            join.author.effectAllowed = true;
            join.author.atk = Math.round(join.author.atk + ((stats.beys[stats.main].level - 1) * 0.4));
            join.author.moveChosen = false;
            join.author.dead = false;

            // Update user status in DB
            await db.collection("users").updateOne({ _id: join.author.id }, { $set: { "states.inBattle": true } });
            join.author.stats.states.inBattle = true;
        }
    });

    // Create embed for the boss battle
    let dbossembed = new EmbedBuilder()
        .setTitle(`***${boss.name}***`)
        .setThumbnail(boss.image2)
        .setDescription(`Type \`${prefix}battleinstructions\` to know how to fight the boss.\n\n**HP:** ${boss.hp}\n**Stamina:** ${boss.stamina}\n**Remaining players:** ${boss.players.length}\n**Timer:** 300 seconds left`)
        .addField("__*Logs*__", `${boss.logs}`)
        .setColor("#eb1465")
        .setAuthor("Boss Battle", client.user.avatarURL())
        .setFooter("Do you hear boss music?", "https://i.redd.it/l7u85m34qrw41.png")
        .setTimestamp();

    let msg = await message.channel.send({ embeds: [dbossembed] });

    // Add reactions for players to select actions
    await msg.react("🗡️");
    await msg.react("🛡️");
    await msg.react("🔄");
    await msg.react("✨");
    await msg.react("❌");

    // Create a message collector to handle reactions
    const filter = (reaction, user) => {
        return ['🗡️', '🛡️', '🔄', '✨', '❌'].includes(reaction.emoji.name) && boss.players.includes(user.id);
    };

    const collector = msg.createReactionCollector({ filter, time: 300000 });  // 5-minute timer

    collector.on('collect', (reaction, user) => {
        // Handle reaction events here
        // For example, if a player reacts with 🗡️ (Attack), you can initiate the attack logic.
        if (reaction.emoji.name === '🗡️') {
            // Attack logic
            user.hp -= boss.atk;
            boss.addLogs(`${user.tag} attacked! ${boss.atk} damage dealt.`);
        }
        // Add logic for other reactions here (🛡️ for defend, 🔄 for special moves, etc.)
    });

    // Update the boss battle status every 5 seconds
    let resetembed = setInterval(() => {
        let now = new Date();
        let diff = ((300 - ((now - boss.startTime) / 1000)) + 660).toFixed(1);
        let bossembed = new EmbedBuilder()
            .setTitle(`***${boss.name}***`)
            .setThumbnail(boss.image2)
            .setDescription(`Type \`${prefix}battleinstructions\` to know how to fight the boss.\n\n**HP:** ${boss.hp}\n**Stamina:** ${boss.stamina}\n**Remaining players:** ${boss.players.length}\n**Timer:** ${diff} seconds left`)
            .addField("__*Logs*__", `${boss.logs}`)
            .setColor("#eb1465")
            .setAuthor("Boss Battle", client.user.avatarURL())
            .setFooter("Do you hear boss music?", "https://i.redd.it/l7u85m34qrw41.png")
            .setTimestamp();

        msg.edit({ embeds: [bossembed] });
    }, 5000);

    // Decrease stamina every 3 seconds
    let decreasestamina = setInterval(() => {
        let users = client.users.cache.filter(user1 => boss.players.includes(user1.id));
        users.forEach(user2 => {
            user2.stamina -= 1;
        });
        boss.stamina -= 1;
    }, 3000);

    // Send player stats every 15 seconds
    let sendstats = setInterval(() => {
        let users = client.users.cache.filter(user1 => boss.players.includes(user1.id));
        users.forEach(async user2 => {
            let statsembed = new EmbedBuilder()
                .setTitle("Your boss battle stats")
                .setColor("#eb1465")
                .setDescription(`**HP:** ${user2.hp}\n**Stamina:** ${user2.stamina.toFixed(1)}\n**Energy:** ${user2.sp}`)
                .setFooter("I'm here once again asking do you hear boss music?", "https://i.redd.it/l7u85m34qrw41.png")
                .setTimestamp();

            let dmchannel = await user2.createDM();
            dmchannel.send({ embeds: [statsembed] }).catch(err => console.log(err));
        });
    }, 15000);

    // Boss attack logic every 3 seconds
    let bossattack = setInterval(() => {
        if (boss.stamina <= 2) {
            boss.stamina += 4;
            boss.addLogs(`${boss.name} spun more! Stamina increased!`);
        } else {
            let users = client.users.cache.filter(user1 => boss.players.includes(user1.id));
            if (boss.atk < 1) boss.atk = 1;
            users.forEach(user2 => {
                user2.hp -= boss.atk;
            });
            boss.addLogs(`${boss.name} attacked! ${boss.atk} damage dealt to everyone.`);
        }
    }, 3000);

    // Execute boss special move every minute
    let executespecial = setInterval(() => {
        boss.special(client);
    }, 60000);

    // Check for death conditions every 5 seconds
    let checkdeath = setInterval(async () => {
        let users = client.users.cache.filter(user1 => boss.players.includes(user1.id));
        users.forEach(async user3 => {
            if (user3.hp <= 0 || user3.stamina <= 0) boss.removePlayer(user3.id, client);
        });
    }, 5000);

    setTimeout(() => {
        clearInterval(resetembed);
        clearInterval(decreasestamina);
        clearInterval(sendstats);
        clearInterval(bossattack);
        clearInterval(executespecial);
        clearInterval(checkdeath);
    }, 300000); // 5 minutes
}

module.exports.run = async (client, message, prefix, player, db) => {
    let bosses = client.bosses.array();
    let index = Math.floor(Math.random() * bosses.length);
    let bossss = bosses[index];
    let boss = new bossss();
    let alert = new Discord.EmbedBuilder()
        .setTitle("<a:alert:999835138798141520> ***ALERT!*** A boss is about to spawn in 10 minutes!")
        .setColor("#eb1465")
        .setImage("https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/a3f544f1-f07b-4aa9-b6f9-824148c31a10/daqrpoq-f7ee01ed-ac8e-4c47-86c9-360f670365d2.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOiIsImlzcyI6InVybjphcHA6Iiwib2JqIjpbW3sicGF0aCI6IlwvZlwvYTNmNTQ0ZjEtZjA3Yi00YWE5LWI2ZjktODI0MTQ4YzMxYTEwXC9kYXFycG9xLWY3ZWUwMWVkLWFjOGUtNGM0Ny04NmM5LTM2MGY2NzAzNjVkMi5wbmcifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6ZmlsZS5kb3dubG9hZCJdfQ.37GhMgHrxdiLQPB8OPtK_04vGDSUum7EM4vxWzmkzYY")
        .setDescription("React to this message with <a:alert:999835138798141520> if you wish to get notified 1 minute before the boss battle starts.\n*Get your strongest and most trustworthy Bey ready, bladers!*")
        .setTimestamp();
    let alertembed = await message.channel.send({ embed: alert }).catch(err => {
        return;
    });
    alertembed.addReaction("a:alert:999835138798141520")
    setTimeout(() => {
        start(client, message, prefix, player, db, boss);
    }, 60000);
}

module.exports.help = {
    name: "bosssystem",
}