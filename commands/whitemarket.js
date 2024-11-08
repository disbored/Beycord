const Discord = require("discord.js");
const Fuse = require("fuse.js");

module.exports.run = async (client, message, args, prefix, player, db) => {
  let stats = await db.collection("users").findOne({ _id: message.author.id });
  if (!stats) return message.reply(`you haven't started the game yet. Type \`\`${prefix}start\`\` to begin.`);

  let option = (args[0] || "view").toLowerCase();
  if (option === "sell") {
    if (stats.states.isListing) return message.reply("finish your current listing before starting a new one.");

    if (!args[1] || !args[2]) return message.reply("you must provide both the Bey index and price.");

    let sindex = parseInt(args[1]) - 1;
    let sbey = stats.beys[sindex];
    let price = parseInt(args[2]);

    if (!sbey) return message.reply("Bey not found.");
    if (isNaN(price) || price <= 0 || price > 9999999) return message.reply("please provide a valid price between 1 and 9,999,999.");

    let sprompt = new Discord.EmbedBuilder()
      .setDescription(`❓Are you sure you want to list your Level ${sbey.level} ${sbey.name} for <:valtz:899373217255407646>${price}? This action cannot be undone.`)
      .setAuthor(message.author.tag, message.author.avatarURL())
      .setFooter("Beycord White Market", client.user.avatarURL())
      .setColor(0xffffff);

    db.collection("users").updateOne({ _id: message.author.id }, { $set: { "states.isListing": true } });

    let msg = await message.channel.send({ embeds: [sprompt] });
    await msg.react("✅");
    await msg.react("❌");

    const reactions = await msg.awaitReactions({
      filter: (reaction, user) => user.id === message.author.id,  // Filter for the correct user
      max: 1,  // Only collect one reaction
      time: 300000,  // Time limit of 5 minutes (300000 ms)
      errors: ['time'],  // Handle timeout errors
    });

    if (reactions[0]) {
      if (reactions[0].emoji.name === "✅") {
        stats.beys.splice(sindex, 1); // Remove Bey from user's inventory
        db.collection("users").updateOne({ _id: message.author.id }, { $set: { beys: stats.beys, "states.isListing": false } });

        // Insert Bey into the market
        let marketData = await db.collection("market").findOne({ _id: "info" });
        let mid = (parseInt(marketData.latestid) + 1).toString();

        db.collection("market").insertOne({
          _id: mid,
          seller: message.author.id,
          bey: sbey,
          price
        });
        db.collection("market").updateOne({ _id: "info" }, { $set: { latestid: mid } });

        let done = new Discord.EmbedBuilder()
          .setColor(0xffffff)
          .setAuthor(message.author.tag, message.author.avatarURL())
          .setDescription(`✅ Successfully listed your Level ${sbey.level} ${sbey.name} for <:valtz:899373217255407646>${price}.`);
        msg.edit({ embeds: [done] });

        // Optionally, log the action via webhook
        let webhookembed = new Discord.EmbedBuilder()
          .setTitle(`${message.author.tag} listed a Bey on the White Market!`)
          .setDescription(`Level ${sbey.level} ${sbey.name} for <:valtz:899373217255407646>${price}.`)
          .setTimestamp()
          .setColor("#ffffff");
        // Send to webhook or log service here
      } else {
        msg.edit({ embeds: [new Discord.EmbedBuilder().setColor(0xffffff).setDescription("❌ Listing cancelled.")] });
        db.collection("users").updateOne({ _id: message.author.id }, { $set: { "states.isListing": false } });
      }
    } else {
      message.channel.send("Prompt timed out.");
      db.collection("users").updateOne({ _id: message.author.id }, { $set: { "states.isListing": false } });
    }
  } else if (option === "view" || option === "page") {
    let msg = await message.channel.send("Loading White Market...");
    let page = parseInt(args[1] || 1);
    if (isNaN(page) || page < 1) return msg.edit("Invalid page number.");

    let allitems = await db.collection("market").countDocuments({});
    let recent = await db.collection("market").findOne({ _id: "info" });
    let id = recent.latestid;
    let maxpages = Math.ceil(allitems / 25);

    if (page > maxpages) return msg.edit("Page not found.");

    let items = await db.collection("market").find({}).skip((page - 1) * 25).limit(25).toArray();
    let embed = new Discord.EmbedBuilder()
      .setTitle("Beycord White Market")
      .setAuthor("Results", client.user.avatarURL)
      .setTimestamp()
      .setFooter(`PAGE ${page}/${maxpages}`)
      .setColor(0xffffff);

    items.forEach(async item => {
      let user = await client.users.cache.get(item.seller);
      embed.addField(
        `***Level ${item.bey.level} ${item.bey.bbname || item.bey.name}*** (#${item._id})`,
        `**Seller:** ${user.username || "Someone"}#${user.discriminator || "0000"} | **Price:** <:valtz:899373217255407646>${item.price}`,
        true
      );
    });

    msg.edit({ content: "✅ Finished loading!", embeds: [embed] });
  } else if (option === "info") {
    if (!args[1]) return message.reply("Please provide the index of the Bey to view.");

    let item = await db.collection("market").findOne({ _id: args[1] });
    if (!item) return message.reply("Bey not found.");

    let seller = await client.users.cache.get(item.seller);
    let crntbey = item.bey;
    let reqxp = crntbey.level * 300;
    let lastxp = (crntbey.level - 1) * 300;
    let xps = crntbey.xp - lastxp;
    let difference = reqxp - crntbey.xp;

    let atk = 23, stamina = 3, hp = 100;
    if (crntbey.type === "Attack") atk += 5;
    if (crntbey.type === "Stamina") stamina += 2;
    if (crntbey.type === "Balance") {
      atk += 3;
      stamina += 1;
    }

    hp += (crntbey.level - 1) * 2;
    stamina += (crntbey.level - 1) * 0.2;
    if (stamina > 10) stamina = 10;

    let exps = crntbey.level === 100 ? "**MAX LEVEL ACHIEVED**" : `${xps} / 300`;

    let embed = new Discord.EmbedBuilder()
      .setAuthor("Beycord White Market", client.user.avatarURL)
      .setColor("#ffffff")
      .setTitle(`${crntbey.bbname || crntbey.name}'s Information (#${item._id})`)
      .setThumbnail(crntbey.image)
      .addField("Seller", `${seller.username || "Someone"}#${seller.discriminator || "0000"}`)
      .addField("Price", `<:valtz:899373217255407646>${item.price}`)
      .addField("Level", crntbey.level)
      .addField("EXPs", exps)
      .addField("Total EXPs", crntbey.xp)
      .addField("Type", crntbey.type)
      .addField("Statistics", `\`\`\`Hitpoints: ${hp}\nAttack: 17 - ${atk}\nStamina: ${stamina}\`\`\``)
      .addField("Special Move", crntbey.move)
      .addField("Original Blader ID", crntbey.firstOwner)
      .setFooter(`${difference} more EXPs required to reach Lvl ${crntbey.level + 1}.`);

    if (crntbey.level === 100) embed.setFooter("Level MAX");
    embed.addField("Generation", "⭐".repeat(crntbey.gen || 1));

    message.channel.send({ embeds: [embed] });
  } else if (option === "buy") {
    if (!args[1]) return message.reply("Please provide the ID of the Bey you wish to buy.");

    let bey = await db.collection("market").findOne({ _id: args[1] });
    if (!bey) return message.reply("No Bey found. Maybe try again?");
    if (bey.seller === message.author.id) return message.reply("You can't buy back your own Bey from the White Market.");

    let stats = await db.collection("users").findOne({ _id: message.author.id });
    if (stats.coins < bey.price) return message.reply("You don't have enough Valtz.");

    let seller = await db.collection("users").findOne({ _id: bey.seller });
    if (!seller) return message.channel.send("The seller is no longer available. They may have been banned or their account removed.");

    let suser = await client.users.cache.get(bey.seller);
    let confirmationEmbed = new Discord.EmbedBuilder()
      .setTitle(`Are you sure you want to buy the Level ${bey.bey.level} ${bey.bey.name} for <:valtz:899373217255407646>${bey.price}?`)
      .setColor("#ffffff");

    let confirmMessage = await message.channel.send({ embeds: [confirmationEmbed] });
    await confirmMessage.react("✅");
    await confirmMessage.react("❌");

    // Wait for the user's reaction
    const reactions = await confirmMessage.awaitReactions({
      filter: (reaction, user) => user.id === message.author.id,  // Filter for the correct user
      max: 1,  // Only collect one reaction
      time: 60000,  // Time limit of 1 minute (60000 ms)
      errors: ['time'],  // Handle timeout errors
    });

    if (reactions[0]) {
      if (reactions[0].emoji.name === "✅") {
        // Process the purchase
        let start = new Date();
        stats = await db.collection("users").findOne({ _id: message.author.id });
        let end = new Date();
        if (end - start > 50) return message.channel.send(`The current ping (${end - start}ms) is too high. Try again later.`);

        if (stats.coins < bey.price) return message.reply("You don't have enough Valtz.");
        let beyInMarket = await db.collection("market").findOne({ _id: args[1] });
        if (!beyInMarket) return message.reply("This Bey has already been bought by someone else.");

        // Tax calculations based on user's level
        let tax = [75, 80, 85, 90, 95][stats.level - 1] || 75;
        let afterTaxAmount = Math.round(bey.price * tax / 100);

        // Experience calculation based on price
        let exp = 0;
        if (bey.price > 10000) exp = 30;
        else if (bey.price > 5000) exp = 18;
        else if (bey.price > 1000) exp = 10;
        else if (bey.price > 100) exp = 2;

        // Update user stats and market
        await db.collection("users").updateOne({ _id: message.author.id }, { $set: { coins: stats.coins - bey.price }, $push: { beys: bey.bey } });
        await db.collection("users").updateOne({ _id: bey.seller }, { $set: { coins: seller.coins + afterTaxAmount }, $push: { items: seller.items }, $inc: { xp: exp } });
        await db.collection("market").deleteOne({ _id: bey._id });

        // Notify the seller
        let dmChannel = await client.getDMChannel(bey.seller);
        if (dmChannel) {
          dmChannel.createMessage(`Your ${bey.bey.bbname || bey.bey.name} (Market ID: #${bey._id}) was bought for <:valtz:863052675968925716>${bey.price}!`).catch(err => console.log(err));
        }

        // Notify the buyer
        message.channel.send(`✅ Successfully bought the Level ${bey.bey.level} ${bey.bey.bbname || bey.bey.name} from ${suser.username}#${suser.discriminator}. Enjoy!`);

        // Log the transaction
        let transactionEmbed = new Discord.EmbedBuilder()
          .setTitle(`${message.author.username}#${message.author.discriminator} bought a Bey from ${suser.username}#${suser.discriminator} on the White Market!`)
          .setDescription(`Bey: Level ${bey.bey.level} ${bey.bey.name} (OBID: ${bey.bey.firstOwner}) sold for <:valtz:899373217255407646>${bey.price}.`)
          .setTimestamp()
          .setColor("#ffffff");

      } else {
        message.channel.send("Purchase cancelled.");
      }
    } else {
      message.channel.send("Prompt timed out.");
    }
  }
  else if (option === "find" || option === "search") {
    if (!args[1]) return message.reply("Please provide a Bey name to search.");

    let searchTerm = args.slice(1).join(" ");
    let nargs = searchTerm.split("|");
    let sort = (nargs[2] || "random").toLowerCase();
    let page = parseInt(nargs[1] || 1);

    if (isNaN(page) || page < 1) return message.reply("Invalid page number.");

    let levelSort = (nargs[3] || "random").toLowerCase();

    let msg = await message.channel.send(`Searching for "${nargs[0]}"...`);

    // cache.get all Beys
    const beys = Array.from(client.beys.values()).map(b => {
      if (b !== client.beys.get("Buddy Bey") && b.name) return b.name;
    }).filter(Boolean);

    beys.push("Buddy Bey");

    const fuse = new Fuse(beys, { threshold: 0.4 });
    let sresults = fuse.search(nargs[0]);

    if (!sresults[0]) return msg.edit("No result found.");

    let query = { "bey.name": sresults[0].item };

    // Apply sorting based on user input
    let sortOption = {};
    if (sort === "a" || sort === "ascending") {
      sortOption = { price: 1 };
    } else if (sort === "d" || sort === "descending") {
      sortOption = { price: -1 };
    } else if (sort === "random") {
      query = query; // no additional sort needed for random
    }

    let items = await db.collection("market").find(query).sort(sortOption).toArray();

    if (levelSort === "a" || levelSort === "ascending") {
      items = items.sort((a, b) => a.bey.level - b.bey.level);
    } else if (levelSort === "d" || levelSort === "descending") {
      items = items.sort((a, b) => b.bey.level - a.bey.level);
    }

    if (!items || items.length === 0) return msg.edit("No result found.");

    let count = items.length;
    let maxPages = Math.ceil(count / 25);

    if (page > maxPages || page < 1) return msg.edit("Page not found.");

    let embed = new Discord.EmbedBuilder()
      .setTitle("Beycord White Market")
      .setColor("#ffffff")
      .setTimestamp()
      .setAuthor(`Search results for "${nargs[0]}"`, client.user.avatarURL)
      .setFooter(`Page ${page}/${maxPages}`);

    // Add search results to the embed
    for (let i = (page - 1) * 25; i < Math.min(page * 25, count); i++) {
      let item = items[i];
      let user = await client.users.cache.get(item.seller);

      embed.addFields({
        name: `***Level ${item.bey.level} ${item.bey.bbname || item.bey.name}*** (#${item._id})`,
        value: `**Seller:** ${user.username}#${user.discriminator} | **Price:** <:valtz:899373217255407646>${item.price}`,
        inline: true
      });
    }

    msg.edit({ content: "✅ Finished loading!", embeds: [embed] });
  } else {
    return message.reply(`Invalid option. Type \`\`${prefix}help whitemarket\`\` for more details.`);
  }
};

module.exports.help = {
  name: "whitemarket",
  aliases: ["market", "wm"],
  desc: "Sell or buy Beys from the White Market.",
  usage: "whitemarket - Show the first page of the White Market.\nwhitemarket view/page <page number> - View a page of the White Market.\nwhitemarket sell <bey index number> <price> - Sell a Bey on the White Market.\nwhitemarket info <ID> - View the information of a Bey displayed on the White Market.\nwhitemarket search <Bey name>|<page number (optional)>|<price order (optional)>|<level order (optional)> - Search for a Bey in the White Market.\nwhitemarket buy <ID> - Buy a Bey from the White Market.\n\nThe IDs are the (#12345678) thing with \"(#)\" removed. Basically the numbers.\n\n**Price Orders:**\na OR ascending\nd OR descending\nr OR random\n\n**Level orders are the same as price orders.**"
};