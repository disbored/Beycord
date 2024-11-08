const Discord = require("discord.js");
const Fuse = require("fuse.js");

module.exports.run = async (client, message, args, prefix, player, db) => {
  let stats = await db.collection("users").findOne({ _id: message.author.id });
  if (!stats) return message.reply(`You haven't started the game yet. Type \`${prefix}start\` to begin.`);

  let beys = Array.from(client.beys.values()).filter(b => !["Buddy Bey", "Demonic Armageddon"].includes(b.name));
  let maxPage = Math.ceil(beys.length / 25);
  let page = parseInt(args[0]) || 1;
  let results = null;

  if (args[0]) {
    const fuse = new Fuse(beys.map(b => b.name), { threshold: 0.4 });
    let result = fuse.search(args.join(" "));
    results = result[0]?.item || args.join(" ");
  }

  if (args[0] && client.beys.get(results) && isNaN(page)) {
    if (results === "Buddy Bey") {
      return message.channel.send({
        embed: new Discord.EmbedBuilder()
          .setAuthor("Beypedia", client.user.avatarURL())
          .setTimestamp()
          .setThumbnail("https://i.imgur.com/EBcoTao.png")
          .setDescription("Buddy Bey can be anything – from a reskinned God Valkyrie to an original Bey. A Buddy Bey is truly unique.")
          .setColor(0x7f7fff)
      });
    }

    let bey = new (client.beys.get(results))("1", 1);
    let atk = bey.type === "Attack" ? 28 : 23;
    let stamina = bey.type === "Stamina" ? 5 : bey.type === "Balance" ? 4 : 3;
    let rarity = getBeyRarity(bey.name, client);

    let embed = new Discord.EmbedBuilder()
      .setTitle(`${bey.name}'s Base Information`)
      .addField("Type", bey.type)
      .addField("Rarity", rarity)
      .addField("Special Move", bey.specials[0]?.name || "None")
      .addField("Statistics", `Hitpoints: 100\nAttack: ${atk}\nStamina: ${stamina}`)
      .setColor(0x7f7fff)
      .setAuthor("Beypedia", client.user.avatarURL())
      .setTimestamp()
      .setThumbnail(bey.image);

    if (stats.perks.includes("Beypedia++")) {
      addSpecialMoveSimulation(embed, bey, message, client);
    }

    return message.channel.send({ embed });
  }

  let list = beys.slice((page - 1) * 25, page * 25);
  let embed = new Discord.EmbedBuilder()
    .setTitle("Beypedia - The only encyclopedia you need for Beycord!")
    .setThumbnail(client.user.avatarURL())
    .setTimestamp()
    .setColor(0x7f7fff)
    .setFooter(`PAGE ${page}/${maxPage}`, client.user.avatarURL());

  list.forEach(b => {
    let owned = stats.beys.filter(s => s.name === b.name).length;
    let ownership = owned > 0 ? `✅ (x${owned})` : "❌";
    embed.addField(`${ownership} ${b.name}`, `${b.type} Type`, true);
  });

  message.channel.send({ embed });
  if (page > maxPage) return message.reply("No page found.");
};

function getBeyRarity(name, client) {
  if (client.commonbeys.has(name)) return "Common";
  if (client.specialbeys.has(name)) return "Special";
  if (client.rarebeys.has(name)) return "Rare";
  if (client.legendarybeys.has(name)) return "Legendary";
  if (client.availablebeys.has(name)) return "Unknown";
  if (client.blackbeys.has(name)) return "Black";
  return "Exclusive/Event";
}

function addSpecialMoveSimulation(embed, bey, message, client) {
  let fakeMsg = {
    channel: { send: content => captureSimulationContent(content, embed) }
  };
  let dummyPlayer = {
    id: message.author.id,
    hp: 100,
    stamina: 3,
    atk: 23,
    username: message.member.effectiveName,
    bey: bey
  };

  try {
    bey.special(dummyPlayer, dummyPlayer, fakeMsg, client);
  } catch (err) {
    embed.addField("Special Move Simulation", "***It looks like this Bey's special is broken! Please report the error.***\n" + err.stack);
  }
}

function captureSimulationContent(content, embed) {
  let simulationText = content.embed ? content.embed.title + "\n" + content.embed.description : content;
  embed.addField("Special Move Simulation", simulationText || "Unknown");
}

module.exports.help = {
  name: "beypedia",
  aliases: ["pedia", "beydex", "dex"],
  desc: "Flip the legendary Beypedia and get information about Beys.",
  usage: "beypedia - Show the first page of Beypedia.\nbeypedia <page number> - Show a page of Beypedia.\nbeypedia <bey name> - Check a Bey's base information."
};
