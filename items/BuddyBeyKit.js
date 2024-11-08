const Item = require("./Item.js");
let Discord = require("discord.js");

class BuddyBeyKit extends Item {
  constructor() {
    super("BuddyBeyKit", 20000, 1);
  }
  async use(client, message, args, prefix, iindex, db) {
    let stats = await db.collection("users").findOne({ _id: message.author.id });
    let gembed = new Discord.EmbedBuilder()
      .setTitle("❓ Please select a burst subsystem that you want your Buddy Bey to be in.")
      .setDescription("🇩: Dual Layer System\n🇬: God Layer System\n🇨: Cho-Z Layer System\n🇹: Gatinko Layer System\n❌: Cancel")
      .setFooter("Beycord Buddy Bey Kit")
      .setTimestamp()
      .setColor("#7f7fff")
      .setAuthor(message.author.username + "#" + message.author.discriminator, message.author.avatarURL);

    let msg = await message.channel.send({ embed: gembed });
    msg.react("🇩").then(() => msg.react("🇬")).then(() => msg.react("🇨")).then(() => msg.react("🇹")).then(() => msg.react("❌"));

    let reactions;
    try {
      reactions = await msg.awaitReactions({
        filter: (reaction, user) => user.id === message.author.id,
        max: 1, // Only collect 1 reaction
        time: 300000, // Timeout after 5 minutes
        errors: ['time'], // To handle the timeout error
      });

      // Handle the reaction here (for example, check if it's the right emoji)
      const reaction = reactions.first(); // Get the first reaction
      if (reaction.emoji.name === '✅') {
        // Perform the action if the reaction is ✅
      } else if (reaction.emoji.name === '❌') {
        // Handle cancellation if the reaction is ❌
      }
    } catch (error) {
      // Timeout or other error occurred
      message.channel.send("Prompt cancelled due to timing out.");
    }

    if (reactions[0].emoji.name === "🇩") {
      message.channel.send("Please provide the index number of the disc that you want to use.");
      let collected = await message.channel.awaitMessages(m => m.author.id === message.author.id, { maxMatches: 1, time: 300000 });
      if (collected[0].content.toLowerCase() === "cancel") return message.channel.send("Prompt cancelled.");
      let pindex = parseInt(collected[0].content) - 1;
      let disc = stats.beyparts[pindex];
      if (!disc) return message.reply("no disc found. Please restart the prompt and try again.");
      if (disc.type !== "Disc") return message.reply("the part you provided is not a disc. Please restart the prompt and try again.");
      atk = atk + disc.stats.atk;
      def = def + disc.stats.def;
      stamina = stamina + disc.stats.stamina;

      message.channel.send("Please provide the index number of the driver that you want to use.");
      let collected2 = await message.channel.awaitMessages(m => m.author.id === message.author.id, { maxMatches: 1, time: 300000 });
      if (collected2[0].content.toLowerCase() === "cancel") return message.channel.send("Prompt cancelled.");
      let dindex = parseInt(collected2[0].content) - 1;
      let driver = stats.beyparts[dindex];
      if (!driver) return message.reply("no driver found. Please restart the prompt and try again.");
      if (driver.type !== "Driver") return message.reply("the part you provided is not a driver. Please restart the prompt and try again.");
      atk = atk + driver.stats.atk;
      def = def + driver.stats.def;
      stamina = stamina + driver.stats.stamina;

      message.channel.send("Please provide the link or attachment to the energy layer of the Bey.");
      let collected3 = await message.channel.awaitMessages(m => m.author.id === message.author.id, { maxMatches: 1, time: 300000 });
      if (collected3[0].content.toLowerCase() === "cancel") return message.channel.send("Prompt cancelled.");
      if (!collected3[0].content.includes("http") && !collected3[0].attachments[0]) return message.reply("no image or link found. Please restart the prompt and try again.");
      if (collected3[0].attachments[0] && collected3[0].attachments[0].filename.split(".")[1] !== "png") return message.reply("the image must be a .PNG file. Please restart the prompt and try again.");

      message.channel.send("Please name the Bey and special move like `Bey Name|Move Name`.");
      let collected4 = await message.channel.awaitMessages(m => m.author.id === message.author.id, { maxMatches: 1, time: 300000 });
      if (collected4[0].content.toLowerCase() === "cancel") return message.channel.send("Prompt cancelled.");
      if (!collected4[0].content.includes("|")) return message.reply("please divide the Bey name and special move name with a \"|\" and make sure there's no spaces between \"|\" and the names.");

      let latk = Math.round(Math.random() * 5);
      let ldef = Math.round(Math.random() * 5);
      let lstamina = Math.round(Math.random() * 5);
      atk = atk + latk;
      def = def + ldef;
      stamina = stamina + lstamina;

      let type = "Balance";
      if (atk > def && atk > stamina) type = "Attack";
      if (def > atk && def > stamina) type = "Defense";
      if (stamina > atk && stamina > def) type = "Stamina";
      if (Math.round((atk + def + stamina) / 3) === 3) type = "Balance";

      let ss = 0;
      let hpr = 0;
      let atke = 0;
      let dmgb = 0;
      if (disc.effects.atk) atke = atke + disc.effects.atk;
      if (disc.effects.ss) ss = ss + disc.effects.ss;
      if (disc.effects.hpr) hpr = hpr + disc.effects.hpr;
      if (disc.effects.dmgb) dmgb = dmgb + disc.effects.dmgb;
      if (driver.effects.atk) atke = atke + driver.effects.atk;
      if (driver.effects.ss) ss = ss + driver.effects.ss;
      if (driver.effects.hpr) hpr = hpr + driver.effects.hpr;
      if (driver.effects.dmgb) dmgb = dmgb + driver.effects.dmgb;

      let names = collected4[0].content.split("|");
      let imaget;
      if (collected3[0].content) imaget = collected3[0].content;
      if (collected3[0].attachments[0]) imaget = collected3[0].attachments[0].url;

      let bbey = {
        name: "Buddy Bey",
        bbname: names[0] || "That Name",
        type: type,
        image: imaget,
        firstOwner: message.author.id,
        move: names[1] || "That Move",
        stats: {
          atk: atk,
          def: def,
          stamina: stamina
        },
        effects: {
          atk: atke,
          ss: ss,
          dmgb: dmgb,
          hpr: hpr
        },
        level: 1,
        xp: 0
      };

      let prompt = new Discord.EmbedBuilder()
        .setDescription(`❓ Are you sure that you want to submit your Buddy Bey, ***${bbey.bbname}*** with **Type:** ${bbey.type} and **Special Move:** ${bbey.move}, for approval so it can be used in battles and to show off?`)
        .setColor("#7f7fff")
        .setAuthor(message.author.username + "#" + message.author.discriminator, message.author.avatarURL)
        .setFooter("Beycord Buddy Bey Kit")
        .setTimestamp();

      let msg2 = await message.channel.send({ embed: prompt });
      msg2.addReaction("✅");
      msg2.addReaction("❌");

      let reactions2;
      try {
        reactions2 = await msg2.awaitReactions({
          filter: (reaction, user) => user.id === message.author.id,
          max: 1, // Only collect 1 reaction
          time: 300000, // Timeout after 5 minutes
          errors: ['time'], // To handle timeout error
        });

        // Handle the reaction here (for example, check if it's the right emoji)
        const reaction = reactions2.first(); // Get the first reaction
        if (reaction.emoji.name === '✅') {
          // Perform the action if the reaction is ✅
        } else if (reaction.emoji.name === '❌') {
          // Handle cancellation if the reaction is ❌
        }
      } catch (error) {
        // Timeout or other error occurred
        message.channel.send("Prompt cancelled due to timing out.");
      }


      if (reactions2[0].emoji.name === "✅") {
        let error = null;
        let bbs = await db.collection("buddybeys").findOne({ _id: "info" });
        let bid = (parseInt(bbs.latestid) + 1).toString();

        let approval = new Discord.EmbedBuilder()
          .setTitle(bbey.bbname + ` | (#${bid})`)
          .setThumbnail(bbey.image)
          .addField("Type", bbey.type)
          .addField("Special Move", bbey.move)
          .addField("Layer System", "Dual")
          .setFooter(`Submitted by ${message.author.username}#${message.author.discriminator} at`)
          .setTimestamp()
          .setColor("#7f7fff");

        stats.beyparts.splice(stats.beyparts.indexOf(disc), 1);
        stats.beyparts.splice(stats.beyparts.indexOf(driver), 1);
        stats.items.splice(iindex, 1);

        db.collection("users").updateOne({ _id: message.author.id }, { $set: { beyparts: stats.beyparts, items: stats.items } });
        db.collection("buddybeys").insertOne({ _id: bid, bey: bbey, submitter: message.author.id });
        db.collection("buddybeys").updateOne({ _id: "info" }, { $set: { latestid: bid } });

        message.channel.send("✅Successfully sent your Buddy Bey for approval. Please be informed that the approval process might take up to a week but trust me it's definitely worth it.");
        return true;
      } else {
        return message.channel.send("Prompt cancelled.");
      }
    }
    else if (reactions[0].emoji.name === "🐶") {
      message.channel.send("Looks like you selected the Dog Layer System.\nhttps://bit.ly/2BZSvFS");
    } else if (reactions[0].emoji.name === "🇬") {
      message.channel.send("Please provide the index number of the disc that you want to use.");

      // Wait for disc input
      let collected = await message.channel.awaitMessages(m => m.author.id === message.author.id, { maxMatches: 1, time: 300000 });
      if (collected[0].content.toLowerCase() === "cancel") return message.channel.send("Prompt cancelled.");
      let pindex = parseInt(collected[0].content) - 1;
      let disc = stats.beyparts[pindex];
      if (!disc || disc.type !== "Disc") return message.reply("Invalid disc. Please restart the prompt and try again.");

      // Update stats with disc values
      atk += disc.stats.atk;
      def += disc.stats.def;
      stamina += disc.stats.stamina;

      message.channel.send("Please provide the index number of the driver that you want to use.");

      // Wait for driver input
      let collected2 = await message.channel.awaitMessages(m => m.author.id === message.author.id, { maxMatches: 1, time: 300000 });
      if (collected2[0].content.toLowerCase() === "cancel") return message.channel.send("Prompt cancelled.");
      let dindex = parseInt(collected2[0].content) - 1;
      let driver = stats.beyparts[dindex];
      if (!driver || driver.type !== "Driver") return message.reply("Invalid driver. Please restart the prompt and try again.");

      // Update stats with driver values
      atk += driver.stats.atk;
      def += driver.stats.def;
      stamina += driver.stats.stamina;

      message.channel.send("Please provide the index number of the disc frame that you want to use. Reply with 'none' if you don't want to use any.");

      // Wait for frame input
      let collected5 = await message.channel.awaitMessages(m => m.author.id === message.author.id, { maxMatches: 1, time: 300000 });
      if (collected5[0].content.toLowerCase() === "cancel") return message.channel.send("Prompt cancelled.");
      let findex = parseInt(collected5[0].content) - 1;
      let frame;
      if (collected5[0].content.toLowerCase() !== "none") {
        frame = stats.beyparts[findex];
      } else {
        frame = null;
      }

      if (frame && frame.type !== "Disc Frame") return message.reply("Invalid disc frame. Please restart the prompt and try again.");

      // Update stats with frame values
      if (frame) {
        atk += frame.stats.atk;
        def += frame.stats.def;
        stamina += frame.stats.stamina;
      }

      message.channel.send("Please provide the link or attachment to the energy layer of the Bey.");

      // Wait for energy layer link or attachment
      let collected3 = await message.channel.awaitMessages(m => m.author.id === message.author.id, { maxMatches: 1, time: 300000 });
      if (collected3[0].content.toLowerCase() === "cancel") return message.channel.send("Prompt cancelled.");
      if (!collected3[0].content.includes("http") && !collected3[0].attachments[0]) return message.reply("No image or link found. Please restart the prompt and try again.");
      if (collected3[0].attachments[0] && collected3[0].attachments[0].filename.split(".")[1] !== "png") return message.reply("Image must be a .PNG file.");

      message.channel.send("Please name the Bey and special move like `Bey Name|Move Name`.");

      // Wait for name and move input
      let collected4 = await message.channel.awaitMessages(m => m.author.id === message.author.id, { maxMatches: 1, time: 300000 });
      if (collected4[0].content.toLowerCase() === "cancel") return message.channel.send("Prompt cancelled.");
      if (!collected4[0].content.includes("|")) return message.reply("Please use '|' to separate Bey name and move name.");

      // Adding random stats
      let latk = Math.round(Math.random() * 5);
      let ldef = Math.round(Math.random() * 5);
      let lstamina = Math.round(Math.random() * 5);
      atk += latk;
      def += ldef;
      stamina += lstamina;

      // Determine Bey type
      let type = "Balance";
      if (atk > def && atk > stamina) type = "Attack";
      if (def > atk && def > stamina) type = "Defense";
      if (stamina > atk && stamina > def) type = "Stamina";

      let names = collected4[0].content.split("|");
      let imaget;
      if (collected3[0].content) imaget = collected3[0].content;
      if (collected3[0].attachments[0]) imaget = collected3[0].attachments[0].url;

      let bbey = {
        name: "Buddy Bey",
        bbname: names[0] || "That Name",
        type: type,
        image: imaget,
        firstOwner: message.author.id,
        move: names[1] || "That Move",
        stats: {
          atk: atk,
          def: def,
          stamina: stamina
        },
        effects: {
          atk: disc.effects.atk + driver.effects.atk + (frame ? frame.effects.atk : 0),
          ss: disc.effects.ss + driver.effects.ss + (frame ? frame.effects.ss : 0),
          dmgb: disc.effects.dmgb + driver.effects.dmgb + (frame ? frame.effects.dmgb : 0),
          hpr: disc.effects.hpr + driver.effects.hpr + (frame ? frame.effects.hpr : 0)
        },
        level: 1,
        xp: 0
      };

      let prompt = new Discord.EmbedBuilder()
        .setDescription(`❓ Are you sure you want to submit your Buddy Bey, ***${bbey.bbname}*** with **Type:** ${bbey.type} and **Special Move:** ${bbey.move}, for approval so it can be used in battles and to show off?`)
        .setColor("#7f7fff")
        .setAuthor(message.author.username + "#" + message.author.discriminator, message.author.avatarURL)
        .setFooter("Beycord Buddy Bey Kit")
        .setTimestamp();

      let msg2 = await message.channel.send({ embed: prompt });
      msg2.addReaction("✅");
      msg2.addReaction("❌");

      // Wait for user reaction
      let reactions2;
      try {
        reactions2 = await msg2.awaitReactions({
          filter: (reaction, user) => user.id === message.author.id,
          max: 1, // Only allow 1 reaction
          time: 300000, // Timeout after 5 minutes (300000 ms)
          errors: ['time'], // Trigger 'time' error if time is exceeded
        });

        // You can access the first reaction here:
        const reaction = reactions2.first();

        // Handle the reaction
        if (reaction.emoji.name === '✅') {
          // Perform action for confirmation
        } else if (reaction.emoji.name === '❌') {
          // Perform action for cancellation
        }

      } catch (err) {
        // This block is executed if the reaction collection times out
        message.channel.send("Prompt cancelled due to timing out.");
      }
      if (reactions2[0].emoji.name === "✅") {
        let bbs = await db.collection("buddybeys").findOne({ _id: "info" });
        let bid = (parseInt(bbs.latestid) + 1).toString();
        let approval = new Discord.EmbedBuilder()
          .setTitle(`${bbey.bbname} | (#${bid})`)
          .setThumbnail(bbey.image)
          .addField("Type", bbey.type)
          .addField("Special Move", bbey.move)
          .addField("Layer System", "God")
          .setFooter(`Submitted by ${message.author.username}#${message.author.discriminator} at`)
          .setTimestamp()
          .setColor("#7f7fff");

        stats.beyparts.splice(stats.beyparts.indexOf(disc), 1);
        stats.beyparts.splice(stats.beyparts.indexOf(driver), 1);
        if (frame) stats.beyparts.splice(stats.beyparts.indexOf(frame), 1);
        db.collection("users").updateOne({ _id: message.author.id }, { $set: { beyparts: stats.beyparts, items: stats.items } });
        db.collection("buddybeys").insertOne({ _id: bid, bey: bbey, submitter: message.author.id });
        db.collection("buddybeys").updateOne({ _id: "info" }, { $set: { latestid: bid } });

        message.channel.send("✅Successfully sent your Buddy Bey for approval. The approval process might take up to a week, but it's definitely worth it.");
        return true;
      } else {
        return message.channel.send("Prompt cancelled.");
      }
    }
    else if (reactions[0].emoji.name === "🇨") {
      message.channel.send("Please provide the index number of the disc that you want to use.");

      let collected = await message.channel.awaitMessages(m => m.author.id === message.author.id, { maxMatches: 1, time: 300000 });
      if (collected[0].content.toLowerCase() === "cancel") return message.channel.send("Prompt cancelled.");

      let pindex = parseInt(collected[0].content) - 1;
      let disc = stats.beyparts[pindex];
      if (!disc) return message.reply("no disc found. Please restart the prompt and try again.");
      if (disc.type !== "Disc") return message.reply("the part you provided is not a disc. Please restart the prompt and try again.");

      atk += disc.stats.atk;
      def += disc.stats.def;
      stamina += disc.stats.stamina;

      message.channel.send("Please provide the index number of the driver that you want to use.");

      let collected2 = await message.channel.awaitMessages(m => m.author.id === message.author.id, { maxMatches: 1, time: 300000 });
      if (collected2[0].content.toLowerCase() === "cancel") return message.channel.send("Prompt cancelled.");

      let dindex = parseInt(collected2[0].content) - 1;
      let driver = stats.beyparts[dindex];
      if (!driver) return message.reply("no driver found. Please restart the prompt and try again.");
      if (driver.type !== "Driver") return message.reply("the part you provided is not a driver. Please restart the prompt and try again.");

      atk += driver.stats.atk;
      def += driver.stats.def;
      stamina += driver.stats.stamina;

      message.channel.send("Please provide the index number of the disc frame that you want to use. Reply with \"none\" if you don't want to use any.");

      let collected5 = await message.channel.awaitMessages(m => m.author.id === message.author.id, { maxMatches: 1, time: 300000 });
      if (collected5[0].content.toLowerCase() === "cancel") return message.channel.send("Prompt cancelled.");

      let findex = parseInt(collected5[0].content) - 1;
      let frame;
      if (collected5[0].content.toLowerCase() !== "none") frame = stats.beyparts[findex];
      else frame = null;

      if (frame && frame.type !== "Disc Frame") return message.reply("the part you provided is not a disc frame. Please restart the prompt and try again.");

      if (frame) {
        atk += frame.stats.atk;
        def += frame.stats.def;
        stamina += frame.stats.stamina;
      }

      message.channel.send("Please provide the link or attachment to the energy layer of the Bey.");

      let collected3 = await message.channel.awaitMessages(m => m.author.id === message.author.id, { maxMatches: 1, time: 300000 });
      if (collected3[0].content.toLowerCase() === "cancel") return message.channel.send("Prompt cancelled.");
      if (!collected3[0].content.includes("http") && !collected3[0].attachments[0]) return message.reply("no image or link found. Please restart the prompt and try again.");
      if (collected3[0].attachments[0] && collected3[0].attachments[0].filename.split(".")[1] !== "png") return message.reply("the image must be a .PNG file. Please restart the prompt and try again.");

      message.channel.send("Please name the Bey and special move like `Bey Name|Move Name`.");

      let collected4 = await message.channel.awaitMessages(m => m.author.id === message.author.id, { maxMatches: 1, time: 300000 });
      if (collected4[0].content.toLowerCase() === "cancel") return message.channel.send("Prompt cancelled.");
      if (!collected4[0].content.includes("|")) return message.reply("please divide the Bey name and special move name with a \"|\" and make sure there's no spaces between \"|\" and the names.");

      let latk = Math.round(Math.random() * 5);
      let ldef = Math.round(Math.random() * 5);
      let lstamina = Math.round(Math.random() * 5);
      atk += latk;
      def += ldef;
      stamina += lstamina;

      let type = "Balance";
      if (atk > def && atk > stamina) type = "Attack";
      if (def > atk && def > stamina) type = "Defense";
      if (stamina > atk && stamina > def) type = "Stamina";
      if (Math.round((atk + def + stamina) / 3) === 3) type = "Balance";

      let ss = 0, hpr = 0, atke = 0, dmgb = 0;
      if (disc.effects.atk) atke += disc.effects.atk;
      if (disc.effects.ss) ss += disc.effects.ss;
      if (disc.effects.hpr) hpr += disc.effects.hpr;
      if (disc.effects.dmgb) dmgb += disc.effects.dmgb;

      if (driver.effects.atk) atke += driver.effects.atk;
      if (driver.effects.ss) ss += driver.effects.ss;
      if (driver.effects.hpr) hpr += driver.effects.hpr;
      if (driver.effects.dmgb) dmgb += driver.effects.dmgb;

      if (frame) {
        if (frame.effects.ss) ss += frame.effects.ss;
        if (frame.effects.hpr) hpr += frame.effects.hpr;
        if (frame.effects.dmgb) dmgb += frame.effects.dmgb;
      }

      let names = collected4[0].content.split("|");
      let imaget;
      if (collected3[0].content) imaget = collected3[0].content;
      if (collected3[0].attachments[0]) imaget = collected3[0].attachments[0].url;

      let bbey = {
        name: "Buddy Bey",
        bbname: names[0] || "That Name",
        type: type,
        image: imaget,
        firstOwner: message.author.id,
        move: names[1] || "That Move",
        stats: {
          atk: atk,
          def: def,
          stamina: stamina
        },
        effects: {
          atk: atke,
          ss: ss,
          dmgb: dmgb,
          hpr: hpr
        },
        level: 1,
        xp: 0
      };

      let prompt = new Discord.EmbedBuilder()
        .setDescription(`❓ Are you sure that you want to submit your Buddy Bey, ***${bbey.bbname}*** with **Type:** ${bbey.type} and **Special Move:** ${bbey.move}, for approval so it can be used in battles and to show off?`)
        .setColor("#7f7fff")
        .setAuthor(message.author.username + "#" + message.author.discriminator, message.author.avatarURL)
        .setFooter("Beycord Buddy Bey Kit")
        .setTimestamp();

      let msg2 = await message.channel.send({ embed: prompt });
      msg2.addReaction("✅");
      msg2.addReaction("❌");

      let reactions2;
      try {
        reactions2 = await msg2.awaitReactions({
          filter: (reaction, user) => user.id === message.author.id, // filter by user id
          max: 1,  // Only accept 1 reaction
          time: 300000,  // Timeout after 5 minutes (300000 ms)
          errors: ['time'],  // Trigger 'time' error if timeout occurs
        });

        // Get the first reaction
        const reaction = reactions2.first();

        // Handle the reaction
        if (reaction.emoji.name === '✅') {
          // Handle confirmation
        } else if (reaction.emoji.name === '❌') {
          // Handle cancellation
        }

      } catch (err) {
        // This block is executed if the reaction collection times out
        message.channel.send("Prompt cancelled due to timing out.");
      }


      if (reactions2[0].emoji.name === "✅") {
        let bbs = await db.collection("buddybeys").findOne({ _id: "info" });
        let bid = (parseInt(bbs.latestid) + 1).toString();

        let approval = new Discord.EmbedBuilder()
          .setTitle(bbey.bbname + ` | (#${bid})`)
          .setThumbnail(bbey.image)
          .addField("Type", bbey.type)
          .addField("Special Move", bbey.move)
          .addField("Layer System", "Cho-Z")
          .setFooter(`Submitted by ${message.author.username}#${message.author.discriminator} at`)
          .setTimestamp()
          .setColor("#7f7fff");

        stats.beyparts.splice(stats.beyparts.indexOf(disc), 1);
        stats.beyparts.splice(stats.beyparts.indexOf(driver), 1);
        if (frame) stats.beyparts.splice(stats.beyparts.indexOf(frame), 1);
        stats.items.splice(iindex, 1);

        db.collection("users").updateOne({ _id: message.author.id }, { $set: { beyparts: stats.beyparts, items: stats.items } });
        db.collection("buddybeys").insertOne({ _id: bid, bey: bbey, submitter: message.author.id });
        db.collection("buddybeys").updateOne({ _id: "info" }, { $set: { latestid: bid } });

        message.channel.send("✅Successfully sent your Buddy Bey for approval. Please be informed that the approval process might take up to a week but trust me it's definitely worth it.");
        return message.channel.send({ embed: approval });
      } else {
        return message.channel.send("❌ Buddy Bey submission was cancelled.");
      }
    } else if (reactions[0].emoji.name === "🇹") {
      message.channel.send("Please provide the index number of the disc that you want to use.");
      let collected = await message.channel.awaitMessages(m => m.author.id === message.author.id, { maxMatches: 1, time: 300000 });
      if (collected[0].content.toLowerCase() === "cancel") return message.channel.send("Prompt cancelled.");

      let pindex = parseInt(collected[0].content) - 1;
      let part = stats.beyparts[pindex];
      if (!part || part.type !== "Disc" && part.type !== "Driver" && part.type !== "Disc Frame" && part.type !== "Layer Weight") return message.reply("Invalid part. Please try again.");

      let atk = part.stats.atk;
      let def = part.stats.def;
      let stamina = part.stats.stamina;

      // Handle multiple parts
      const parts = ["Disc", "Driver", "Disc Frame", "Layer Weight"];
      for (const partType of parts) {
        message.channel.send(`Please provide the index number of the ${partType} that you want to use.`);
        let collectedPart = await message.channel.awaitMessages(m => m.author.id === message.author.id, { maxMatches: 1, time: 300000 });
        if (collectedPart[0].content.toLowerCase() === "cancel") return message.channel.send("Prompt cancelled.");

        let index = parseInt(collectedPart[0].content) - 1;
        let part = stats.beyparts[index];
        if (!part || part.type !== partType) return message.reply(`Invalid ${partType}. Please try again.`);

        atk += part.stats.atk;
        def += part.stats.def;
        stamina += part.stats.stamina;
      }

      message.channel.send("Please provide the link or attachment for the energy layer or gatinko chip + layer base.");
      let collectedImage = await message.channel.awaitMessages(m => m.author.id === message.author.id, { maxMatches: 1, time: 300000 });
      if (collectedImage[0].content.toLowerCase() === "cancel") return message.channel.send("Prompt cancelled.");
      if (!collectedImage[0].content.includes("http") && !collectedImage[0].attachments[0]) return message.reply("No valid image or link found. Please try again.");

      message.channel.send("Please name the Bey and special move (e.g., Bey Name|Move Name).");
      let collectedName = await message.channel.awaitMessages(m => m.author.id === message.author.id, { maxMatches: 1, time: 300000 });
      if (collectedName[0].content.toLowerCase() === "cancel") return message.channel.send("Prompt cancelled.");
      if (!collectedName[0].content.includes("|")) return message.reply("Please separate the Bey name and special move with a \"|\".");

      let [beyName, moveName] = collectedName[0].content.split("|");
      let type = (atk > def && atk > stamina) ? "Attack" : (def > atk && def > stamina) ? "Defense" : (stamina > atk && stamina > def) ? "Stamina" : "Balance";

      let bbey = {
        name: beyName,
        bbname: beyName || "That Name",
        type: type,
        move: moveName || "That Move",
        stats: { atk, def, stamina },
        level: 1,
        xp: 0,
      };

      let prompt = new Discord.EmbedBuilder()
        .setDescription(`Are you sure you want to submit your Bey, ***${bbey.bbname}*** with **Type:** ${bbey.type} and **Move:** ${bbey.move}, for approval?`)
        .setColor("#7f7fff")
        .setAuthor(message.author.username, message.author.avatarURL)
        .setFooter("Beycord Buddy Bey Kit")
        .setTimestamp();

      let msg2 = await message.channel.send({ embed: prompt });
      msg2.addReaction("✅");
      msg2.addReaction("❌");

      let reactions2;
      try {
        reactions2 = await msg2.awaitReactions({
          filter: (reaction, user) => user.id === message.author.id,  // Filters to check if it's the correct user
          max: 1,  // Collect only 1 reaction
          time: 300000,  // Time limit of 5 minutes (300000 ms)
          errors: ['time'],  // Trigger error handling for timeout
        });

        // Get the first reaction
        const reaction = reactions2.first();

        // Handle the reaction
        if (reaction.emoji.name === '✅') {
          // Handle confirmation
        } else if (reaction.emoji.name === '❌') {
          // Handle cancellation
        }

      } catch (err) {
        // If the reaction collection times out
        message.channel.send("Prompt cancelled due to timing out.");
      }

      if (reactions2[0].emoji.name === "✅") {
        // Proceed with submission
      }
    }
    else return message.channel.send("Prompt cancelled.");
  }
}

module.exports = BuddyBeyKit;
