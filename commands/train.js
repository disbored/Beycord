const Discord = require("discord.js");
const last = [];

module.exports.run = async (client, message, args, prefix, player, db) => {
  let time = 15 * 60 * 1000; // 15 minutes cooldown
  let questchance = Math.random(); // Chance to get a quest (between 0 and 1)
  const now = new Date();

  if (!last[message.author.id]) last[message.author.id] = 0;

  // Check cooldown
  if (now - last[message.author.id] < time) {
    let remaining = Math.round(((time) - (now - last[message.author.id])) / 1000 / 60);
    return message.reply(`The cooldown is still active. Please try again after **${remaining} minute(s)**.`);
  }

  // Get user stats
  let stats = await db.collection("users").findOne({ _id: message.author.id });

  const actions = [
    "hit some rocks with your Bey", "discovered a new launching technique", "did some push-ups",
    "battled your friends", "did some sit-ups", "sliced some pizzas by launching your Bey sideways",
    "threw your Bey down Mt. Everest to train its durability", "charged up your legs and ran on the wall to train your Rush Launch move",
    "climbed Mt. Everest", "did 100 push-ups, 100 sit-ups, 100 squats and ran 10 km", "sat around menacingly",
    "fought off two giant bears", "launched 100 times", "did some epic backflips", "played chess to strengthen your strategy skills"
  ];

  const balance = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  // Randomize action and XP
  let ract = Math.floor(Math.random() * actions.length);
  let rno = Math.floor(Math.random() * balance.length);

  let embed = new Discord.EmbedBuilder()
    .setTitle(`You ${actions[ract]} and got ${balance[rno]} EXP.`)
    .setColor("#50c878");

  last[message.author.id] = now;

  // Check for quest chance (e.g., 35% chance)
  if (questchance < 0.35 && stats.qslots > stats.quests.length) {
    let quest = client.quests.random();
    let newquest = new quest();
    stats.quests.push(newquest);
    embed.setDescription(`A quest acquired! Do \`${prefix}quests\` to check it.`);
  }

  // Update the user's XP and quests in the database
  stats.xp += balance[rno];
  await db.collection("users").updateOne({ _id: message.author.id }, { $set: { xp: stats.xp, quests: stats.quests } });

  // Send the response
  message.channel.send({ embeds: [embed] });
};

module.exports.help = {
  name: "train",
  aliases: ["t"]
};
