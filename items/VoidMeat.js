const Item = require("./Item.js");

const available = [
  "Victory Valtryek", //
  "Rising Ragnaruk", //
  "King Kerbeus", //
  "Revive Phoenix", //
  "Dead Phoenix", //
  "Winning Valkyrie", //
  "Spryzen Requiem", //
  "Buster Xcalibur", //
  "Cho-Z Spriggan", //
  "Dead Hades", //
  "Judgement Joker", //
  "Ace Dragon", //
  "Slash Valkyrie", //
  "Cho-Z Valkyrie", //
  "Storm Pegasus", //
  "Wizard Fafnir", //
  "Lost Longinus", //
  "Shelter Regulus", //
  "Hell Salamander", //
  "Xeno Xcalibur", //
  "Z Achilles", //
  "Venom Diabolos", //
  "Killer Deathscyther", //
  "Union Achilles", //
  "Spriggan", //
  "Valkyrie", //
  "Wyvern", //
  "Chaos", //
  "Acid Anubis", //
  "Arc Bahamut", //
  "Beast Behemoth", //
  "Bloody Longinus", //
  "Dark Deathscyther", //
  "Deathscyther", //
  "Diomedes D2", //
  "Drain Fafnir", //
  "Earth Aquila", // 
  "Evil-eye", //
  "Exceed Evil-eye", //
  "Fang Fenrir", //
  "Flame Sagittario", //
  "Gigant Gaia", //
  "God Valkyrie", //
  "Holy Horusood", //
  "Horusood", //
  "Hyrus H2", //
  "Inferno Ifrit", //
  "Istros I2", //
  "Jail Jormungand", //
  "Kaiser Kerbeus", //
  "Kerbeus", //
  "Kreis Satan", //
  "Lightning L-Drago", //
  "Mad Minoboros", //
  "Minoboros", //
  "Neptune", //
  "Nightmare Longinus", //
  "Nova Neptune", //
  "Obelisk Odin",
  "Odin", //
  "Orpheus O2", //
  "Psychic Phantom", //
  "Quad Quetzalcoatl", //
  "Ragnaruk", //
  "Rock Leone", //
  "Sieg Xcalibur", //
  "Strike God Valkyrie", //
  "Surtr S2", //
  "Tornado Wyvern", // 
  "Trident", //
  "Tyros T2", //
  "Unicorn", //
  "Unlock Unicorn", //
  "Wild Wyvern", //
  "Xcalibur", //
  "Yaeger Yggdrasil", //
  "Yggdrasil", //
  "Zillion Zeus", //
  "Geist Fafnir",
  "Prime Apocalypse",
  "Beat Kukulcan",
  "Blast Jinnius",
  "Blaze Ragnaruk",
  "Bushin Ashura",
  "Deep Chaos",
  "Galaxy Zeus",
  "Guardian Kerbeus",
  "Legend Spriggan",
  "Storm Spriggan",
  "Draciel Shield",
  "Dragoon Storm",
  "Dranzer Spiral",
  "Driger Slash",
  "Gaia Dragoon",
  "Maximus Garuda",
  "Screw Trident",
];
const exclusives = [
  "Amaterios",
  "Baldur"
];
let black = [
  "Black Slash Valkyrie",
  "Black Spriggan Requiem",
  "Black Beat Kukulcan",
  "Black God Valkyrie",
  "Black Killer Deathscyther",
  "Black Legend Spriggan",
  "Black Nightmare Longinus",
  "Black Sieg Xcalibur",
];

class VoidMeat extends Item {
  constructor() {
    super("VoidMeat", 1000);
  }

  async use(client, message, args, prefix, iindex, db) {
    const msg = await message.channel.send("Rolling prizes...");
    const stats = await db.collection("users").findOne({ _id: message.author.id });
    const prizechance = Math.floor(Math.random() * 3);

    const prizeActions = [
      async () => {
        msg.edit("Rolled on a random Bey! Rolling Bey...");
        let bundle = available;
        if (Math.floor(Math.random() * 100) === 1) bundle = exclusives;
        if (Math.floor(Math.random() * 1000) === 1) bundle = ["Brave Solomon"];
        if (Math.floor(Math.random() * 460) === 1) bundle = black;
        const bey = new (client.beys.get(bundle[Math.floor(Math.random() * bundle.length)]))(message.author.id);
        await db.collection("users").updateOne({ _id: message.author.id }, { $push: { beys: bey } });
        msg.edit(`Rolled on ${bey.name}! Enjoy!`);
      },
      async () => {
        const amount = Math.round(Math.random() * 50);
        await db.collection("users").updateOne({ _id: message.author.id }, { $set: { xp: stats.xp + amount } });
        msg.edit(`Rolled on ${amount} EXPs! Enjoy!`);
      },
      async () => {
        const valtz = Math.round(Math.random() * 1000);
        await db.collection("users").updateOne({ _id: message.author.id }, { $set: { coins: stats.coins + valtz } });
        msg.edit(`Rolled on ${valtz} Valtz! Enjoy!`);
      }
    ];

    setTimeout(() => prizeActions[prizechance](), 5000);

    stats.items.splice(iindex, 1);
    await db.collection("users").updateOne({ _id: message.author.id }, { $set: { items: stats.items } });
  }
}


module.exports = VoidMeat;
