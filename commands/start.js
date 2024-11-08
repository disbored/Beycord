const Discord = require('discord.js');

module.exports.run = async (client, message, args, prefix, player, db) => {
  let statss = await db.collection("users").findOne({ _id: message.author.id });
  if (statss !== null) return message.reply("you already started the game.");

  let referrerid = null;
  if (args[0]) {
    let referrer = await db.collection("users").findOne({ _id: args[0] });
    if (!referrer) return message.reply("The referrer ID provided is invalid.");
    referrerid = referrer._id;
  }

  let startembed = new Discord.EmbedBuilder()
    .setTitle('**Welcome to Beycord!**')
    .setDescription('Choose your starter Bey: Type its name to select.')
    .setColor("#7f7fff")
    .addField("Victory Valkyrie", "[https://cdn.glitch.me/246ebe39-76c4-4f23-9058-86ccadf85d3b%2FABABB5E9-B2A6-4982-A2DC-DB6EA5489546.jpeg]")
    .addField("Rising Ragnaruk", "[https://cdn.glitch.me/246ebe39-76c4-4f23-9058-86ccadf85d3b%2F0386FB12-85BF-4C07-94A8-9B085F1E4D6E.jpeg]")
    .addField("King Kerbeus", "[https://cdn.glitch.me/246ebe39-76c4-4f23-9058-86ccadf85d3b%2F87D66958-279A-4A2C-A6C0-A77FB9A61221.jpeg]")
    .addField("Storm Spriggan", "[https://vignette.wikia.nocookie.net/beyblade/images/a/a7/Beyblade_Spriggan.png/revision/latest]")
    .setTimestamp();

  message.channel.send({ embeds: [startembed] });

  const filter = m => m.author.id === message.author.id;
  let collected = await message.channel.awaitMessages({ filter, maxMatches: 1, time: 300000 })
    .catch(() => message.reply("You took too long to respond. Please start again."));

  if (!collected || collected.size === 0) return;

  let chosenBey = collected.first().content.toLowerCase();
  let starter;

  if (chosenBey === "victory valkyrie") {
    starter = new (client.beys.get("Victory Valkyrie"))(message.author.id);
  } else if (chosenBey === "rising ragnaruk") {
    starter = new (client.beys.get("Rising Ragnaruk"))(message.author.id);
  } else if (chosenBey === "king kerbeus") {
    starter = new (client.beys.get("King Kerbeus"))(message.author.id);
  } else if (chosenBey === "storm spriggan") {
    starter = new (client.beys.get("Storm Spriggan"))(message.author.id);
  } else {
    return message.channel.send("Invalid Beyblade. Please try again.");
  }

  await db.collection("users").insertOne({
    _id: message.author.id,
    beys: [starter],
    coins: 100,
    main: 0,
    xp: 0,
    level: 1,
    faction: "nothing",
    premium: false,
    banned: false,
    referrer: referrerid
  });

  if (referrerid) {
    await db.collection("users").updateOne({ _id: referrerid }, { $inc: { xp: 15, coins: 25 } });
  }

  message.channel.send(`✅ Success! You've chosen ${chosenBey.charAt(0).toUpperCase() + chosenBey.slice(1)} as your starter Bey.`);
}


module.exports.help = {
  name: "start",
  aliases: ["begin"],
  desc: "Start the game.",
  usage: "start <referrer's user ID (optional)> - Begin the game."
}