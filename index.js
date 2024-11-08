const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
require('dotenv').config();
const { MongoClient } = require("mongodb");

// MongoDB connection
const mongo = new MongoClient(process.env.MONGOURL, { useUnifiedTopology: true });
mongo.connect((err) => {
    if (err) throw err;
    console.log("Connection to MongoDB database established successfully!");
});

// Initialize Discord client
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_BANS,
        Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
        Intents.FLAGS.GUILD_INTEGRATIONS,
        Intents.FLAGS.GUILD_WEBHOOKS,
        Intents.FLAGS.GUILD_INVITES,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_MESSAGE_TYPING,
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
        Intents.FLAGS.DIRECT_MESSAGE_TYPING,
    ],
    partials: ['CHANNEL', 'MESSAGE', 'REACTION'], // Optionally handle partial data
});

// Collections to store different bot data
client.commands = new Collection();
client.beys = new Collection();
client.parts = new Collection();
client.items = new Collection();
client.spawns = new Collection();
client.bossys = new Collection();
client.bosses = new Collection();
client.aliases = new Collection();
client.quests = new Collection();
client.expboost = new Collection();
client.valtzboost = new Collection();
client.availablebeys = new Collection();
client.commonbeys = new Collection();
client.specialbeys = new Collection();
client.rarebeys = new Collection();
client.legendarybeys = new Collection();
client.shadowbeys = new Collection();
client.blackbeys = new Collection();
client.restarttime = new Collection();

// Function to load files into collections
const loadFiles = (directory, collectionName) => {
    const files = fs.readdirSync(directory).filter(file => file.endsWith(".js"));
    for (const file of files) {
        const module = require(`${directory}/${file}`);
        if (collectionName === 'beys' || collectionName === 'blackbeys') {
            const beyInstance = new module("1", "1");
            client[collectionName].set(beyInstance.name, module);
        } else {
            client[collectionName].set(module.name, module);
        }
    }
};

// Load command files
loadFiles('./commands', 'commands');
loadFiles('./beys', 'beys');
loadFiles('./blackbeys', 'blackbeys');
loadFiles('./items', 'items');
loadFiles('./quests', 'quests');
loadFiles('./parts', 'parts');
loadFiles('./bosses', 'bosses');

// Load systems such as spawner, bosssystem
const spawner = require('./systems/spawnsystem.js');
client.spawns.set(spawner.name || spawner.help.name, spawner);

const bossys = require('./systems/bosssystem.js');
client.bossys.set(bossys.name || bossys.help.name, bossys);

const beybladeFiles = [
    {
        list: ["WildWyvern", "AceDragon", "ArcBahamut", "UnionAchilles", "DrigerSlash", "Odin", "Neptune", "BlazeRagnaruk", "SurtrS2", "StormSpriggan", "KaiserKerbeus", "XenoXcalibur", "BeastBehemoth", "WizardFafnir", "OrpheusO2", "BushinAshura", "GeistFafnir", "ZillionZeus", "Yggdrasil", "InfernoIfrit"],
        mapTo: client.commonbeys
    },
    {
        list: ["JudgementJoker", "ScrewTrident", "Wyvern", "BusterXcalibur", "HyrusH2", "Kerbeus", "KillerDeathscyther", "Evileye", "ChoZValkyrie", "NightmareLongins", "Spriggan", "RevivePhoenix", "SiegXcalibur", "RockLeone", "DracielShield", "Xcalibur", "DeadPhoenix", "LostLonginus"],
        mapTo: client.specialbeys
    },
    {
        list: ["UnlockUnicorn", "KreisSatan", "GalaxyZeus", "DeadHades", "VenomDiabolos", "IstrosI2", "DeepChaos", "ExceedEvileye", "AcidAnubis", "LegendSpriggan", "DarkDeathscyther", "HellSalamander", "GaiaDragoon", "ZAchilles", "TornadoWyvern", "StormPegasus", "GodValkyrie", "Ragnaruk"],
        mapTo: client.rarebeys
    },
    {
        list: ["VictoryValkyrie", "DragoonStorm", "NovaNeptune", "ShelterRegulus", "LightningLDrago", "GuardianKerbeus", "BloodyLonginus", "EarthAquila", "YaegerYggdrasil", "Trident", "TyrosT2", "MadMinoboros", "Unicorn", "DranzerSpiral", "ObeliskOdin", "Deathscyther", "ChoZSpriggan", "PsychicPhantom"],
        mapTo: client.legendarybeys
    },
    {
        list: ["GigantGaia", "DrainFafnir", "JailJormungand", "SpryzenRequiem", "HolyHorusood", "SlashValkyrie", "RisingRagnaruk", "BeatKukulcan", "FlameSagittario", "Valkyrie", "DiomedesD2", "BlastJinnius", "Minoboros", "PrimeApocalypse", "Horusood", "WinningValkyrie", "Chaos", "FangFenrir", "StrikeGodValkyrie"],
        mapTo: client.shadowbeys
    }
];

beybladeFiles.forEach(category => {
    category.list.forEach(file => {
        const bey = require(`./beys/${file}`);
        const beyInstance = new bey("1", "1");
        category.mapTo.set(beyInstance.name, bey);
    });
});


//MESSAGE ####################################################################################

//On Message Create
client.on('messageCreate', async (message) => {
    const db = mongo.db("main");
    const testForNumber = Math.floor(Math.random() * 30);
    const testForNumber2 = Math.floor(Math.random() * 100);
    const raritytest = Math.floor(Math.random() * 30);

    // Configuration
    let channel = await db.collection("channels").findOne({ _id: message.channel.id });
    if (!channel) {
        db.collection("channels").insertOne({ _id: message.channel.id, bey: "nothing", type: "nothing", answer: "number" });
    }
    let guild = await db.collection("guilds").findOne({ _id: message.guild.id });
    if (!guild) {
        db.collection("guilds").insertOne({ _id: message.guild.id, redirect: "nothing", prefix: ";", bey: "nothing", type: "nothing", answer: "number", disabled: [] });
    }
    let prefix = guild.prefix;

    // Prefix and help
    if (message.content.toLowerCase() === `${prefix}prefix`) {
        message.channel.send(`The prefix for this server is \`${prefix}\`. Have fun blading!`);
    }

    // Spawn Beys & Bosses
    if (testForNumber === 0) {
        let available;
        if (raritytest >= 20) {
            available = ["Wild Wyvern", "Ace Dragon", "Arc Bahamut", "Union Achilles", "Driger Slash", "Odin", "Neptune", "Blaze Ragnaruk", "Surtr S2", "Storm Spriggan", "Kaiser Kerbeus", "Xeno Xcalibur", "Beast Behemoth", "Wizard Fafnir", "Orpheus O2", "Bushin Ashura", "Geist Fafnir", "Zillion Zeus", "Yggdrasil", "Inferno Ifrit"];
        } else if (raritytest >= 10) {
            available = ["Judgement Joker", "Screw Trident", "Wyvern", "Buster Xcalibur", "Hyrus H2", "Kerbeus", "Killer Deathscyther", "Evileye", "Cho-Z Valkyrie", "Nightmare Longins", "Spriggan", "Revive Phoenix", "Sieg Xcalibur", "Rock Leone", "Draciel Shield", "Xcalibur", "Dead Phoenix", "Lost Longinus"];
        } else if (raritytest >= 5) {
            available = ["Unlock Unicorn", "Kreis Satan", "Galaxy Zeus", "Dead Hades", "Venom Diabolos", "Istros I2", "Deep Chaos", "Exceed Evileye", "Acid Anubis", "Legend Spriggan", "Dark Deathscyther", "Hell Salamander", "Gaia Dragoon", "Z Achilles", "Tornado Wyvern", "Storm Pegasus", "God Valkyrie", "Ragnaruk"];
        } else if (raritytest >= 3) {
            available = ["Victory Valkyrie", "Dragoon Storm", "Nova Neptune", "Shelter Regulus", "Lightning L Drago", "Guardian Kerbeus", "Bloody Longinus", "Earth Aquila", "Yaeger Yggdrasil", "Trident", "Tyros T2", "Mad Minoboros", "Unicorn", "Dranzer Spiral", "Obelisk Odin", "Deathscyther", "Cho-Z Spriggan", "Psychic Phantom"];
        } else {
            available = ["Gigant Gaia", "Drain Fafnir", "Jail Jormungand", "Spryzen Requiem", "HolyHorusood", "Slash Valkyrie", "Rising Ragnaruk", "Beat Kukulcan", "Flame Sagittario", "Valkyrie", "Diomedes D2", "Blast Jinnius", "Minoboros", "Prime Apocalypse", "Horusood", "Winning Valkyrie", "Chaos", "Fang Fenrir", "Strike God Valkyrie"];
        }
        client.spawns.get('spawnsystem').run(message, prefix, db, available, client);
    }

    if (testForNumber2 == 0) {
        try {
            client.boss.get('bosssystem').run(client, message, prefix, db, client);
        } catch (error) {
            let embed = new EmbedBuilder()
                .setTitle('Error')
                .setDescription(error.message)
                .setColor("#fa2c2c")
                .setTimestamp();
            message.channel.send({ embeds: [embed] });
            console.error(error);
        }
    }

    let info = await db.collection("users").findOne({ _id: message.author.id }, { _id: 0, beys: 1, main: 1 });
    if (info && !info.banned) {
        if ((info.main + 1) > info.beys.length) {
            db.collection("users").updateOne({ _id: message.author.id }, { $set: { main: 0 } });
        }

        // Random Function
        function random(min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min) + min);
        }

        // EXP System
        let crntbey = info.beys[info.main];
        let booster1 = client.expboost.get(message.author.id);
        let exp = booster1 ? crntbey.xp + Math.floor((random(1, 20)) * 1.5) : crntbey.xp + random(1, 20);
        let levelNew = Math.floor(exp / 300);
        let staramount = random(0, 2);

        // Update Level
        if (levelNew > crntbey.level) {
            let embed = new EmbedBuilder()
                .setTitle(`**${crntbey.name}** just leveled up to **${levelNew}**!`)
                .setColor("#50c878");

            // Quest check
            let lvlupquest = info.quests.find(quest => quest.name === "LevelUpABeyOnce");
            if (lvlupquest && !lvlupquest.completed) {
                info.quests.forEach(que => {
                    if (que.name === "LevelUpABeyOnce" && !que.completed) {
                        que.completed = true;
                    }
                });
                db.collection("users").updateOne({ _id: message.author.id }, { $set: { [`beys.${info.main}.level`]: levelNew, [`beys.${info.main}.xp`]: exp, stars: info.stars + staramount, coins: info.coins + 100, quests: info.quests } });
                message.channel.send({ embeds: [embed] }).then(msg => {
                    setTimeout(() => msg.delete(), 5000);
                });
            } else {
                db.collection("users").updateOne({ _id: message.author.id }, { $set: { [`beys.${info.main}.level`]: levelNew, [`beys.${info.main}.xp`]: exp, stars: info.stars + staramount, coins: info.coins + 100 } });
                message.channel.send({ embeds: [embed] }).then(msg => {
                    setTimeout(() => msg.delete(), 5000);
                });
            }
        } else {
            db.collection("users").updateOne({ _id: message.author.id }, { $set: { [`beys.${info.main}.xp`]: exp, stars: info.stars + staramount } });
        }
    }

    // Command handler
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    try {
        let cmd = client.commands.get(command) || client.aliases.get(command);
        if (cmd) {
            await cmd.run(client, message, args, prefix, db);
        }
    } catch (error) {
        console.error(error);
        message.reply('An error occurred while processing the command. Please try again later.');
    }
});

//Client
client.on('ready', () => {
    console.log('Beycord is online.');
    client.user.setActivity(`with Beyblades in ${client.guilds.cache.size} servers! | ;prefix`, { type: 'PLAYING' });
});


client.login(process.env.TOKEN);
