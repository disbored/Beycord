const Discord = require("discord.js");
const Item = require("./Item.js");

class GiftBox extends Item {
    constructor() {
        super("GiftBox", 1);
        this.beys = [];
        this.items = [];
        this.parts = [];
    }
    async use(client, message, args, prefix, iindex, db) {
        let stats = await db.collection("users").findOne({ _id: message.author.id });
        if (!args[1]) return message.channel.send(`Here's how you use the Gift Box correctly:\n\n\`${prefix}use ${parseInt(args[0]) - 1 + 1} gift <player> - Gift all of the contents inside the gift box to a player.\n${prefix}use ${parseInt(args[0]) - 1 + 1} view - View all of the contents inside the Gift box.\n${prefix}use ${parseInt(args[0]) - 1 + 1} bey <bey index> - Add a Bey into the box.\n${prefix}use ${parseInt(args[0]) - 1 + 1} part <part index> - Add a part into the box.\n${prefix}use ${parseInt(args[0]) - 1 + 1} item <item index> - Add an item into the box.\`\n\n**⚠️Stuff added into the gift box cannot be retrieved!!⚠️**`)
        switch (args[1].toLowerCase()) {
            case "gift":
                const box = stats.items[parseInt(args[0]) - 1];
                if (!args[2]) return message.reply("Please mention who you want to gift.");

                const recipientId = message.mentions[0] ? message.mentions[0].id : args[2];
                const user = await message.guild.member.cache.get(recipientId);

                if (!user) return message.reply("No player found. Please try again.");
                if (user.id === message.author.id) return message.reply("Please don't try to gift yourself.");

                const stats2 = await db.collection("users").findOne({ _id: user.id });
                if (!stats2) return message.reply("That player has not started the game yet.");

                let cost = 10;
                let exp = 5;
                let stuff = "";

                const calculateCostAndExp = (rarity) => {
                    switch (rarity) {
                        case "Common": return { cost: 10, exp: 2 };
                        case "Rare": return { cost: 25, exp: 3 };
                        case "Legendary": return { cost: 50, exp: 5 };
                        case "Unknown": return { cost: 500, exp: 8 };
                        case "Black":
                        case "Exclusive": return { cost: 1000, exp: 12 };
                        default: return { cost: 0, exp: 0 };
                    }
                };

                box.beys.forEach(bey => {
                    const rarity = client.commonbeys.has(bey.name) ? "Common" :
                        client.specialbeys.has(bey.name) ? "Special" :
                            client.rarebeys.has(bey.name) ? "Rare" :
                                client.legendarybeys.has(bey.name) ? "Legendary" :
                                    client.availablebeys.has(bey.name) ? "Unknown" :
                                        client.shadowbeys.has(bey.name) ? "Shadow" : "Exclusive";

                    const { cost: itemCost, exp: itemExp } = calculateCostAndExp(rarity);
                    cost += itemCost + (bey.attached ? 15 : 0);
                    exp += itemExp + (bey.attached ? 3 : 0);
                    stats2.beys.push(bey);
                    stuff += `${bey.bbname || bey.name}, `;
                });

                box.items.forEach(item => {
                    cost += 15;
                    exp += 3;
                    stats2.items.push(item);
                    stuff += `${item.name}, `;
                });

                box.parts.forEach(part => {
                    cost += 50;
                    exp += 3;
                    stats2.beyparts.push(part);
                    stuff += `${part.name}, `;
                });

                if (!box.beys.length && !box.parts.length && !box.items.length) cost = 10000;
                if (stats.coins < cost) return message.reply("You don't have enough Valtz to pay for the shipping fees.");

                stats.items.splice(parseInt(args[0]) - 1, 1);
                await db.collection("users").updateOne({ _id: message.author.id }, { $set: { coins: stats.coins - cost, items: stats.items, xp: stats.xp + exp } });
                await db.collection("users").updateOne({ _id: user.id }, { $set: { beys: stats2.beys, items: stats2.items, beyparts: stats2.beyparts } });

                const dmchannel = await client.getDMChannel(user.id);
                dmchannel.send(`You received a gift from ${message.author.tag}!\nYou received ${stuff || "nothingness"}.`);

                message.channel.send("Gift sent!");
                const webhookembed = new Discord.EmbedBuilder()
                    .setTitle(`${message.author.tag} (${message.author.id}) gifted ${user.user.tag} (${user.id})!`)
                    .setDescription(`It contains ${stuff || "nothing"}.`)
                    .setColor("#ff0090")
                    .setTimestamp();
                break;
            case "view":
                const box2 = stats.items[parseInt(args[0]) - 1];
                let cost2 = 10;
                let stuff2 = "";

                const addCostAndStuff = (item, costIncrement, name) => {
                    cost2 += costIncrement;
                    if (stuff2 !== "") stuff2 += ", ";
                    stuff2 += name;
                };

                const rarityCosts = {
                    "Common": 10,
                    "Rare": 25,
                    "Legendary": 50,
                    "Unknown": 500,
                    "Black": 1000,
                    "Exclusive": 1000,
                    "Shadow": 1000 // Assuming Shadow also has a specific cost
                };

                box2.beys.forEach(bey => {
                    let rarity = client.commonbeys.has(bey.name) ? "Common" :
                        client.rarebeys.has(bey.name) ? "Rare" :
                            client.legendarybeys.has(bey.name) ? "Legendary" :
                                client.availablebeys.has(bey.name) ? "Unknown" :
                                    client.blackbeys.has(bey.name) ? "Shadow" : "Exclusive";

                    cost2 += rarityCosts[rarity] + (bey.attached ? 15 : 0);
                    addCostAndStuff(bey, 0, bey.bbname || bey.name);
                });

                box2.items.forEach(item => addCostAndStuff(item, 15, item.name));
                box2.parts.forEach(part => addCostAndStuff(part, 50, part.name));

                if (box2.beys.length === 0 && box2.parts.length === 0 && box2.items.length === 0) cost2 = 10000;

                message.channel.send(`**Shipping Fee: <:valtz:863052675968925716>${cost2}**\n__Contents__\n${stuff2 || "Nothing. Put something here or pay <:valtz:863052675968925716>10000."}\n*If your list is messy, I recommend using something called \`CTRL+F\`/\`CMD+F\`. ||Or \`ALT+F4\` if you want to rage quit because of your messy list.||*`).catch(err => message.channel.send(`Good job. Your list is probably as populated as the human population that Discord refuses to send it. Good job. It is still sendable to a friend though. The shipping fee costs <:valtz:863052675968925716>${cost} by the way.`));
                break;

            case "bey":
                if (!args[2]) return message.reply("Please provide the index of the Bey that you would like to add to the box.");
                const beyIndex = parseInt(args[2]) - 1;
                const bey = stats.beys[beyIndex];
                if (!bey) return message.reply("No Bey found.");
                if (beyIndex === 0) return message.channel.send("***No.***");
                if (bey.starred) return message.reply("You can't gift starred Beys.");

                message.channel.send(`Successfully added ${bey.bbname || bey.name} to the box!`);
                if (bey.attached) return message.channel.send(`That Bey contains an attached item. Please \`${prefix}detach\` it and add it in separately.`);

                stats.items[parseInt(args[0]) - 1].beys.push(bey);
                stats.beys.splice(beyIndex, 1);
                db.collection("users").updateOne({ _id: message.author.id }, { $set: { items: stats.items, beys: stats.beys } });
                break;

            case "part":
                if (!args[2]) return message.reply("Please provide the index of the part that you would like to add to the box.");
                const partIndex = parseInt(args[2]) - 1;
                const part = stats.beyparts[partIndex];
                if (!part) return message.reply("No part found.");

                message.channel.send(`Successfully added ${part.name} to the box!`);
                stats.items[parseInt(args[0]) - 1].parts.push(part);
                stats.beyparts.splice(partIndex, 1);
                db.collection("users").updateOne({ _id: message.author.id }, { $set: { items: stats.items, beyparts: stats.beyparts } });
                break;

            case "item":
                if (!args[2]) return message.reply("Please provide the index of the item that you would like to add to the box.");
                const itemIndex = parseInt(args[2]) - 1;
                const item = stats.items[itemIndex];
                if (!item) return message.reply("No item found.");
                if (itemIndex === parseInt(args[0]) - 1) return message.channel.send("You can't add the gift box into itself, very nice.");
                if (item.name === "Pocket") return message.channel.send("RIP Pocket.");
                if (item.name.toLowerCase().includes("avatar")) return message.channel.send("Your avatar is yours, and only yours.");

                if (item.name === "Gift Box") {
                    item.items.forEach(innerItem => stats.items[parseInt(args[0]) - 1].items.push(innerItem));
                    item.beys.forEach(innerBey => stats.items[parseInt(args[0]) - 1].beys.push(innerBey));
                    item.parts.forEach(innerPart => stats.items[parseInt(args[0]) - 1].parts.push(innerPart));
                    message.channel.send(`Successfully added ${item.name}'s content(s) into the box!`);
                } else {
                    message.channel.send(`Successfully added ${item.name} to the box!`);
                    stats.items[parseInt(args[0]) - 1].items.push(item);
                }

                stats.items.splice(itemIndex, 1);
                db.collection("users").updateOne({ _id: message.author.id }, { $set: { items: stats.items } });
                break;

        }
    }
}

module.exports = GiftBox;