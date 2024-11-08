const { EmbedBuilder } = require('discord.js');
const fs = require("fs");
const jimp = require("jimp");
const Logger = require("./Logger.js");

async function countdown(message, opponent1, opponent2, player, prefix, client, msg, logger) {
  setTimeout(() => {
    msg.edit("3");
    setTimeout(() => {
      msg.edit("2");
      setTimeout(() => {
        msg.edit("1");
        setTimeout(async () => {
          let motto = ["**Let it rip!**", "**Go shoot!**"];
          let mt = Math.floor(Math.random() * 2);
          msg.edit(motto[mt]);
          awaitMoves(message, opponent1, opponent2, player, prefix, client, logger);
        }, 1000);
      }, 1000);
    }, 1000);
  }, 1000);
}

async function awaitMoves(message, opponent1, opponent2, player, prefix, client, logger) {
  let member1 = await message.guild.members.cache.get(opponent1.id);
  let member2 = await message.guild.members.cache.get(opponent2.id);

  let paused = false;
  let state = "Began";

  let embed = new EmbedBuilder()
    .setAuthor({ name: member1.displayName, iconURL: opponent1.avatarURL })
    .setFooter({ text: member2.displayName, iconURL: opponent2.avatarURL })
    .setColor("#7f7fff")
    .setDescription(`Status: **${state}** [Battle Instructions](https://workshop.overcold.xyz/game-guides/battling)\n__**Logs**__\n${logger.logs.join("\n")}`)
    .addFields(
      {
        name: `__**${member1.displayName}**__`,
        value: `***${opponent1.bey.bbname || opponent1.bey.name}***\nLevel ${opponent1.lvl}\n**HP:** ${Math.round(opponent1.hp)}\n**Stamina:** ${opponent1.stamina.toFixed(1)}\n**Stability:** ${opponent1.stability}%\n**Energy:** ${opponent1.sp}\n**Type:** ${opponent1.bey.type}\n**SD:** ${opponent1.sd}`,
        inline: true,
      },
      {
        name: `__**${member2.displayName}**__`,
        value: `***${opponent2.bey.bbname || opponent2.bey.name}***\nLevel ${opponent2.lvl}\n**HP:** ${Math.round(opponent2.hp)}\n**Stamina:** ${opponent2.stamina.toFixed(1)}\n**Stability:** ${opponent2.stability}%\n**Energy:** ${opponent2.sp}\n**Type:** ${opponent2.bey.type}\n**SD:** ${opponent2.sd}`,
        inline: true,
      }
    )
    .setImage(`attachment://${opponent1.id}-${opponent2.id}.png`);

  let battleImage = fs.readFileSync(`./tempimages/${opponent1.id}-${opponent2.id}.png`);

  let battleMessage = await message.channel.send({
    embeds: [embed],
    files: [{ attachment: battleImage, name: `${opponent1.id}-${opponent2.id}.png` }],
  }).catch(err => {
    player.collection("users").updateOne({ _id: opponent1.id }, { $set: { "states.inBattle": false } });
    player.collection("users").updateOne({ _id: opponent2.id }, { $set: { "states.inBattle": false } });
    message.channel.send("I failed to send the battle message! Please make sure I have the permissions to send embedded links and attach files to my messages. Inform a moderator of this server about this if you can't fix it.");
    return;
  });

  await battleMessage.react("🗡️");
  await battleMessage.react("🛡️");
  await battleMessage.react("🔄");
  await battleMessage.react("✨");
  await battleMessage.react("❌");

  if (opponent1.item && opponent1.item.avatarStart) {
    opponent1.item.avatarStart(opponent1, opponent2, logger);
  }
  if (opponent2.item && opponent2.item.avatarStart) {
    opponent2.item.avatarStart(opponent2, opponent1, logger);
  }

  let reset = setInterval(() => {
    let embed2 = new EmbedBuilder()
      .setAuthor({ name: member1.displayName, iconURL: opponent1.avatarURL })
      .setFooter({ text: member2.displayName, iconURL: opponent2.avatarURL })
      .setColor("#7f7fff")
      .setDescription(`Status: **${state}** [Battle Instructions](https://workshop.overcold.xyz/game-guides/battling)\n__**Logs**__\n${logger.logs.join("\n")}`)
      .addFields(
        {
          name: `__**${member1.displayName}**__`,
          value: `***${opponent1.bey.bbname || opponent1.bey.name}***\nLevel ${opponent1.lvl}\n**HP:** ${Math.round(opponent1.hp)}\n**Stamina:** ${opponent1.stamina.toFixed(1)}\n**Stability:** ${opponent1.stability}%\n**Energy:** ${opponent1.sp}\n**Type:** ${opponent1.bey.type}\n**SD:** ${opponent1.sd}`,
          inline: true,
        },
        {
          name: `__**${member2.displayName}**__`,
          value: `***${opponent2.bey.bbname || opponent2.bey.name}***\nLevel ${opponent2.lvl}\n**HP:** ${Math.round(opponent2.hp)}\n**Stamina:** ${opponent2.stamina.toFixed(1)}\n**Stability:** ${opponent2.stability}%\n**Energy:** ${opponent2.sp}\n**Type:** ${opponent2.bey.type}\n**SD:** ${opponent2.sd}`,
          inline: true,
        }
      )
      .setImage(`attachment://${opponent1.id}-${opponent2.id}.png`);

    battleMessage.edit({
      embeds: [embed2],
      files: [{ attachment: battleImage, name: `${opponent1.id}-${opponent2.id}.png` }],
    });
  }, 2000);

  let resetStats = setInterval(() => {
    opponent1.atk = 20;
    opponent2.atk = 20;
    if (opponent1.sd === "Right") opponent1.atk += 2;
    if (opponent2.sd === "Right") opponent2.atk += 2;
    let ratk1 = Math.floor(Math.random() * 2);
    let ratk2 = Math.floor(Math.random() * 2);
    opponent1.atk += ratk1;
    opponent2.atk += ratk2;
    opponent1.atk = Math.round(opponent1.atk + ((opponent1.lvl - 1) * 0.4));
    opponent2.atk = Math.round(opponent2.atk + ((opponent2.lvl - 1) * 0.4));
    if (opponent1.bey.type === "Defense") opponent2.atk = Math.round((opponent2.atk / 100) * 80);
    if (opponent2.bey.type === "Defense") opponent1.atk = Math.round((opponent1.atk / 100) * 80);
    if (opponent1.bey.type === "Attack") opponent1.atk = Math.round((opponent1.atk / 100) * 120);
    if (opponent2.bey.type === "Attack") opponent2.atk = Math.round((opponent2.atk / 100) * 120);
    if (opponent1.bey.type === "Balance") {
      opponent2.atk = Math.round((opponent2.atk / 100) * 90);
      opponent1.atk = Math.round((opponent1.atk / 100) * 110);
    }
    if (opponent2.bey.type === "Balance") {
      opponent2.atk = Math.round((opponent2.atk / 100) * 110);
      opponent1.atk = Math.round((opponent1.atk / 100) * 90);
    }
  }, 5000);

  let passive = setInterval(async () => {
    if (opponent1.stability > 100) opponent1.stability = 100;
    if (opponent2.stability > 100) opponent2.stability = 100;

    // Handling items and launchers
    if (opponent1.item?.avatarPassive) {
      opponent1.item.avatarPassive(opponent1, opponent2, logger);
    }
    if (opponent2.item?.avatarPassive) {
      opponent2.item.avatarPassive(opponent2, opponent1, logger);
    }
    if (opponent1.launcher?.boost) {
      opponent1.launcher.boost(opponent1, opponent2, logger);
    }
    if (opponent2.launcher?.boost) {
      opponent2.launcher.boost(opponent2, opponent1, logger);
    }

    // Check if the battle is paused or if players haven't chosen yet
    if ((paused || (!opponent1.chosen || !opponent2.chosen)) && !be.ended) return;

    // Passive abilities for opponent 1
    for (const a of opponent1.bey.passives) {
      try {
        let met = await a.requires(opponent1, opponent2, logger);
        if (met && !a.onCD) {
          a.execute(opponent1, opponent2, logger);
          a.onCD = true;
          setTimeout(() => { a.onCD = false; }, a.cd);
        }
      } catch (err) {
        console.error(err);
      }
    }

    // Passive abilities for opponent 2
    for (const b of opponent2.bey.passives) {
      try {
        let met = await b.requires(opponent2, opponent1, logger);
        if (met && !b.onCD) {
          b.execute(opponent2, opponent1, logger);
          b.onCD = true;
          setTimeout(() => { b.onCD = false; }, b.cd);
        }
      } catch (err) {
        console.error(err);
      }
    }

    // Beyblade Modes
    for (const cn of opponent1.bey.modes) {
      let c = opponent1.bey[cn];
      try {
        let met = await c.requires(opponent1, opponent2, logger);
        if (met && !c.active) {
          c.boost(opponent1, opponent2, logger);
        }
      } catch (err) {
        console.error(err);
      }
    }
    for (const dn of opponent2.bey.modes) {
      let d = opponent2.bey[dn];
      try {
        let met = await d.requires(opponent2, opponent1, logger);
        if (met && !d.active) {
          d.boost(opponent2, opponent1, logger);
        }
      } catch (err) {
        console.error(err);
      }
    }

    // Reducing stamina and stability
    opponent1.stamina -= 1.2;
    opponent2.stamina -= 1.2;
    opponent1.stability -= 8;
    opponent2.stability -= 8;

    // Beyblade type adjustments
    if (opponent1.bey.type === "Attack") {
      opponent1.stamina -= 0.3;
      opponent1.stability -= 2;
    } else if (opponent1.bey.type === "Balance") {
      opponent1.stamina -= 0.2;
      opponent1.stability -= 1;
    }

    if (opponent2.bey.type === "Attack") {
      opponent2.stamina -= 0.3;
      opponent2.stability -= 2;
    } else if (opponent2.bey.type === "Balance") {
      opponent2.stamina -= 0.2;
      opponent2.stability -= 1;
    }

  }, 3000);

  // Check for win conditions
  let checkDeath = setInterval(() => {
    const cleanupFile = () => {
      fs.unlink(`./tempimages/${opponent1.id}-${opponent2.id}.png`, (err) => {
        if (err) console.log(err);
      });
    };

    // Conditions for opponent 1's loss
    if (opponent1.stability <= 0) {
      cleanupFile();
      return end(opponent2, opponent1, "ring-out", player);
    }
    if (opponent1.stamina <= 0) {
      cleanupFile();
      return end(opponent2, opponent1, "survivor", player);
    }
    if (opponent1.hp <= 0) {
      cleanupFile();
      return end(opponent2, opponent1, "burst", player);
    }

    // Conditions for opponent 2's loss
    if (opponent2.stability <= 0) {
      cleanupFile();
      return end(opponent1, opponent2, "ring-out", player);
    }
    if (opponent2.stamina <= 0) {
      cleanupFile();
      return end(opponent1, opponent2, "survivor", player);
    }
    if (opponent2.hp <= 0) {
      cleanupFile();
      return end(opponent1, opponent2, "burst", player);
    }
  }, 1000);

  // Special choose timeout
  let specialChoose = setTimeout(() => {
    if (!be.ended) chooseSpecial(logger, client, message);
  }, 8000);


  async function chooseMove() {
    if ((paused || (!opponent1.chosen || !opponent2.chosen)) && !be.ended) {
      return setTimeout(() => chooseMove(), 1000);
    }

    let maxtimeouts = 0;
    const respond = await ReactionHandler.collectReactions(be, userid => [opponent1.id, opponent2.id].includes(userid), { time: 60000, maxMatches: 1 });

    if (respond[0]) {
      maxtimeouts = 0;
      let player1 = opponent1;
      let player2 = opponent2;

      if (opponent2.id === respond[0].userID) {
        player1 = opponent2;
        player2 = opponent1;
      }

      const emoji = respond[0].emoji.name;

      if (!player1.moveChosen) {
        switch (emoji) {
          case "🗡️":
            fight(player1, player2, logger, message);
            break;
          case "🛡️":
            defend(player1, player2, logger, message);
            break;
          case "🔄":
            spin(player1, player2, logger, message);
            break;
          case "✨":
            charge(player1, player2, logger, message);
            break;
          case "❌":
            fs.unlink(`./tempimages/${opponent1.id}-${opponent2.id}.png`, (err) => {
              if (err) console.log(err);
            });
            return end(player2, player1, "cancel", player);
        }

        player1.moveChosen = true;
        setTimeout(() => {
          player1.moveChosen = false;
        }, 1000);
      }
    }

    if (!be.ended) {
      maxtimeouts++;
      if (maxtimeouts >= 3) return end(opponent1, opponent2, "time-out", player);
      chooseMove();
    }
  }

  function chooseSpecial(logger, client, message) {
    paused = true;
    opponent1.chosen = false;
    opponent2.chosen = false;
    state = "Optional rest / Choose a special move";

    // Call special move functions for both opponents
    special(opponent1, opponent2, logger, client, message, chooseSpecial);
    special(opponent2, opponent1, logger, client, message, chooseSpecial);

    // Timeout for pausing the game, then continue the battle if applicable
    setTimeout(() => {
      paused = false;

      if (state !== "Continuing" && !be.ended) {
        // Restore stamina to both players
        opponent1.stamina += 2;
        opponent2.stamina += 2;

        // Change state to "Continuing"
        state = "Continuing";

        // Recur to choose special moves again after a short delay
        setTimeout(() => {
          if (!be.ended) {
            chooseSpecial(logger, client, message);
          }
        }, 8000);
      }
    }, 15000);
  }

  function end(winner, loser, finish, player) {
    be.ended = true;

    if (finish !== "time-out" && finish !== "cancel") {
      const bchance = Math.floor(Math.random() * 100);

      // Handle Beyblade breaking chance
      if (bchance <= 5) {
        if (loser.id !== "501005337373966336") {
          loser.stats.beys[loser.stats.main].broken = true;
        }

        // Update winner stats
        player.collection("users").updateOne(
          { _id: winner.id },
          {
            $set: {
              "states.inBattle": false,
              wins: winner.wins,
              coins: winner.valtz + 80,
              xp: winner.xp + 20,
              quests: winner.stats.quests,
              won: winner.stats.won
            }
          }
        );

        // Update loser stats
        player.collection("users").updateOne(
          { _id: loser.id },
          {
            $set: { beys: loser.stats.beys, "states.inBattle": false }
          }
        );
      } else {
        // Update winner stats
        player.collection("users").updateOne(
          { _id: winner.id },
          {
            $set: {
              "states.inBattle": false,
              coins: winner.valtz + 80,
              xp: winner.xp + 20,
              wins: winner.wins,
              quests: winner.stats.quests,
              won: winner.stats.won
            }
          }
        );

        // Update loser stats
        player.collection("users").updateOne(
          { _id: loser.id },
          {
            $set: { "states.inBattle": false, xp: loser.xp + 8 }
          }
        );
      }
    } else {
      // Handle case for time-out or cancel
      player.collection("users").updateOne({ _id: winner.id }, { $set: { "states.inBattle": false } });
      player.collection("users").updateOne({ _id: loser.id }, { $set: { "states.inBattle": false } });
    }

    // Clear ongoing intervals and timeouts
    clearInterval(reset);
    clearInterval(resetstats);
    clearInterval(passive);
    clearInterval(checkdeath);
    clearTimeout(specialChoose);

    // Notify in the channel and send webhook
    message.channel.send(`<@${winner.id}> won the battle with a ${finish} finish!`);

    return;
  }
  chooseMove();
}

async function fight(acted, victim, logger, message) {
  try {
    let bchance = Math.round(Math.random() * 100);
    let member1 = await message.guild.member.cache.get(acted.id);
    let member2 = await message.guild.member.cache.get(victim.id);

    // Ensure attack value is positive
    if (acted.atk < 0) acted.atk = 1;

    // Calculate the damage
    let dmg = acted.atk;
    if (acted.bey.ZaWarudo && acted.bey.ZaWarudo.active) {
      dmg *= 2;  // Double damage if ZaWarudo is active
    }

    // Apply damage to victim
    victim.hp -= dmg;
    logger.add(`[${member1.effectiveName}] ${acted.bey.bbname || acted.bey.name} dealt ${dmg} damage.`);

    // Check for additional bleeding damage
    if (bchance < 26 && acted.bey.type === "Attack" && acted.effectAllowed) {
      let bleeddmg = setInterval(() => {
        victim.hp -= Math.round(((acted.lvl - 1) * 0.09) + 1);
        victim.stability -= 1;
      }, 2000);

      // Stop the bleeding damage after 15 seconds
      setTimeout(() => {
        clearInterval(bleeddmg);
      }, 15000);

      logger.add("The hit was fatal! The opponent might need some time to regain stability.");

      // Disable effect temporarily
      acted.effectAllowed = false;
      setTimeout(() => {
        acted.effectAllowed = true;  // Re-enable effect after 3 minutes
      }, 180000);
    }

    resolve(true);
  } catch (error) {
    logger.add(`Error during fight: ${error.message}`);
    reject(error);
  }
}


async function defend(acted, victim, logger, message) {
  try {
    let rchance = Math.round(Math.random() * 100);
    let member1 = await message.guild.member.cache.get(acted.id);
    let member2 = await message.guild.member.cache.get(victim.id);

    // Adjust victim's attack and acted's stability
    victim.atk = Math.round((victim.atk / 100) * 40);
    acted.stability += 10;

    // Ensure stability doesn't exceed 100
    if (acted.stability > 100) acted.stability = 100;

    logger.add(`[${member1.effectiveName}] ${acted.bey.bbname || acted.bey.name} blocked!`);

    // Reflect damage if certain conditions are met
    if (rchance < 51 && acted.bey.type === "Defense" && victim.move === "fight" && acted.effectAllowed) {
      acted.hp += victim.atk;
      victim.hp -= victim.atk;
      logger.add("Damage reflected!");

      // Temporarily disable the effect
      acted.effectAllowed = false;
      setTimeout(() => {
        acted.effectAllowed = true;
      }, 180000);
    }

    resolve(true);
  } catch (error) {
    logger.add(`Error during defend: ${error.message}`);
    reject(error);
  }
}


async function spin(acted, victim, logger, message) {
  try {
    let hchance = Math.round(Math.random() * 100);
    let member1 = await message.guild.member.cache.get(acted.id);

    // Increase stamina based on bey type
    if (acted.bey.type === "Attack") acted.stamina += 3;
    else if (acted.bey.type === "Balance") acted.stamina += 2.6;
    else acted.stamina += 2;

    // Increase stamina if ZaWarudo is active
    if (acted.bey.ZaWarudo && acted.bey.ZaWarudo.active) acted.stamina += 1;

    logger.add(`[${member1.effectiveName}] ${acted.bey.bbname || acted.bey.name} spun more. Stamina is increased by 1 and will retain for 1 round.`);

    // Heal damage if conditions are met
    if (hchance < 26 && acted.bey.type === "Stamina" && acted.effectAllowed) {
      acted.hp += victim.atk;
      logger.add(`${victim.atk} hitpoints healed from spinning.`);

      // Temporarily disable the effect
      acted.effectAllowed = false;
      setTimeout(() => {
        acted.effectAllowed = true;
      }, 180000);
    }

    resolve(true);
  } catch (error) {
    logger.add(`Error during spin: ${error.message}`);
    reject(error);
  }
}


async function charge(acted, victim, logger, message) {
  try {
    let member1 = await message.guild.member.cache.get(acted.id);

    // Increment special points (sp)
    acted.sp++;
    if (acted.bey.ZaWarudo && acted.bey.ZaWarudo.active) {
      acted.sp++;
    }

    logger.add(`[${member1.effectiveName}] ${acted.bey.bbname || acted.bey.name} charged its energy.`);
    resolve(true);
  } catch (error) {
    logger.add(`Error during charge: ${error.message}`);
    reject(error);
  }
}


async function special(acted, victim, logger, client, message, chooseSpecial) {
  try {
    let member1 = await message.guild.member.cache.get(acted.id);
    let member2 = await message.guild.member.cache.get(victim.id);
    let dmchannel = await client.getDMChannel(acted.id);

    // Initial setup for available choices
    let reqmet = [1];  // [1] for the "Charge" option
    let tochoose = "**[1]** Charge ✅\n";

    // Loop through each special move to determine its availability
    acted.bey.specials.forEach(move => {
      let usable = false;
      try {
        usable = move.requires(acted, victim, logger);
      } catch (err) {
        console.error(err);
        usable = false;
      }

      let emj = usable ? "✅" : "❌";
      if (usable) reqmet.push(acted.bey.specials.indexOf(move) + 2);

      tochoose += `**[${acted.bey.specials.indexOf(move) + 2}]** ${move.name} ${emj}\n`;
    });

    // Create an embed message for available options
    let menu = new Discord.EmbedBuilder()
      .setColor("#cb00ff")
      .setDescription(tochoose)
      .setAuthor(`${acted.username}#${acted.discriminator}`, acted.avatarURL);

    // Send the embed and await user input for selecting a special move
    let menumsg = await message.channel.send({ embed: menu })
      .then(msg => {
        message.channel.awaitMessages(
          test => test.author.id === acted.id && reqmet.includes(parseInt(test.content.trim())),
          { maxMatches: 1, time: 15000 }
        ).then(spmove => {
          acted.chosen = true;

          // Continue if both players have chosen
          if (acted.chosen && victim.chosen && !be.ended) {
            paused = false;
            state = "Continuing";
            acted.stamina += 2;
            victim.stamina += 2;

            // Schedule the next special move selection
            setTimeout(() => {
              if (!be.ended) chooseSpecial(logger, client, message);
            }, 8000);
          }

          // Handle "Charge" selection
          if (spmove[0].content.trim() == 1) {
            acted.sp += 1;
            logger.add(`[${member1.effectiveName}] ${acted.bey.bbname || acted.bey.name} charged its energy.`);
          } else {
            // Execute the selected special move
            try {
              acted.bey.specials[parseInt(spmove[0].content.trim()) - 2].execute(acted, victim, logger);
            } catch (error) {
              console.error(error);
            }
          }

          // Clean up the message and user input
          menumsg.delete().catch(err => console.log(err));
          spmove[0].delete().catch(err => console.log(err));
        }).catch(err => {
          // Optionally handle timeouts or failed input
          console.log("Special move selection timed out or failed:", err);
        });
      });

    resolve(true);
  } catch (error) {
    logger.add(`Error during special move selection: ${error.message}`);
    reject(error);
  }
}


module.exports.run = async (client, message, args, player, prefix, opponent1, opponent2, msg) => {
  try {
    // Retrieve user stats from the database
    const stats1 = await player.collection("users").findOne({ _id: opponent1.id });
    const stats2 = await player.collection("users").findOne({ _id: opponent2.id });

    // Initialize opponent stats
    resetOpponentStats(opponent1, stats1);
    resetOpponentStats(opponent2, stats2);

    // Special name handling for Guardian Kerbeus
    handleSpecialBeyName(stats1, stats2);

    // Initialize Bey objects
    initializeBeys(client, stats1, stats2, opponent1, opponent2);

    // Resize and compose images for the battle
    await composeBattleImages(client, opponent1, opponent2, message);

    // Calculate and set stats based on Bey levels
    setOpponentStats(opponent1, stats1, stats2);
    setOpponentStats(opponent2, stats2, stats1);

    // Set additional stats based on Bey types and attributes
    adjustStatsBasedOnBeyTypes(opponent1, opponent2);

    // Set max values and XP, coins, etc.
    setMaxValues(opponent1, stats1, opponent2, stats2);

    // Attach items if they exist
    attachItemsToBeys(client, stats1, stats2, opponent1, opponent2);

    // Initialize battle logger
    const logger = new Logger();

    // Start the countdown and begin the battle
    countdown(message, opponent1, opponent2, player, prefix, client, msg, logger);

  } catch (error) {
    console.error("Error in battle system:", error);
  }
}

// Helper function to reset opponent stats
function resetOpponentStats(opponent, stats) {
  opponent.hp = 100;
  opponent.atk = 20;
  opponent.stamina = 3;
  opponent.stability = 100;
  opponent.sp = 0;
  opponent.move = "";
  opponent.sd = stats.beys[stats.main].sd || "Right";
  opponent.bey = new (client.beys.get(stats.beys[stats.main].name))(opponent.id, stats.beys[stats.main].id, stats.beys[stats.main]);
  opponent.lvl = stats.beys[stats.main].level;
}

// Handle special naming cases for specific Beyblade
function handleSpecialBeyName(stats1, stats2) {
  if (stats1.beys[stats1.main].name === "Guardian Kerbeus Red Ver. <:haoyunshu:844767503813050369>") {
    stats1.beys[stats1.main].name = "Guardian Kerbeus Red Ver. HYS";
  }
  if (stats2.beys[stats2.main].name === "Guardian Kerbeus Red Ver. <:haoyunshu:844767503813050369>") {
    stats2.beys[stats2.main].name = "Guardian Kerbeus Red Ver. HYS";
  }
}

// Initialize Bey objects for opponents
function initializeBeys(client, stats1, stats2, opponent1, opponent2) {
  opponent1.bey = new (client.beys.get(stats1.beys[stats1.main].name))(opponent1.id, stats1.beys[stats1.main].id, stats1.beys[stats1.main]);
  opponent2.bey = new (client.beys.get(stats2.beys[stats2.main].name))(opponent2.id, stats2.beys[stats2.main].id, stats2.beys[stats2.main]);
}

// Compose battle images
async function composeBattleImages(client, opponent1, opponent2, message) {
  let images = ["./assets/bbackground.jpg", "./assets/versus.jpg", opponent1.bey.image, opponent2.bey.image];
  let jimps = [];
  for (let i = 0; i < images.length; i++) {
    jimps.push(jimp.read(images[i]));
  }

  const data = await Promise.all(jimps);
  data[2].resize(700, 700);
  data[3].resize(700, 700);
  data[1].resize(300, 300);
  data[0].composite(data[2], 100, 240);
  data[0].composite(data[3], 1150, 240);
  data[0].composite(data[1], 830, 415);
  await data[0].write(`./tempimages/${opponent1.id}-${opponent2.id}.png`);
}

// Set opponent stats based on level
function setOpponentStats(opponent, stats1, stats2) {
  let health = (stats1.beys[stats1.main].level - 1) * 9.1;
  let stamina = (stats1.beys[stats1.main].level - 1) * 0.051;
  opponent.hp = Math.floor(opponent.hp + health);
  opponent.stamina = Math.floor(opponent.stamina + stamina);
  opponent.stamina = Math.min(opponent.stamina, 10);
  opponent.hp = Math.min(opponent.hp, 1000);
}

// Adjust stats based on Bey types and side direction
function adjustStatsBasedOnBeyTypes(opponent1, opponent2) {
  if (opponent1.bey.type === "Stamina") opponent1.stamina += 2;
  if (opponent2.bey.type === "Stamina") opponent2.stamina += 2;
  if (opponent1.bey.type === "Balance") opponent1.stamina += 1;
  if (opponent2.bey.type === "Balance") opponent2.stamina += 1;

  if (opponent1.sd === "Right") opponent1.atk += 2;
  if (opponent1.sd === "Left") opponent1.stamina += 1;
  if (opponent2.sd === "Right") opponent2.atk += 2;
  if (opponent2.sd === "Left") opponent2.stamina += 1;
}

// Set max stats and player info
function setMaxValues(opponent1, stats1, opponent2, stats2) {
  opponent1.maxstamina = opponent1.stamina;
  opponent2.maxstamina = opponent2.stamina;
  opponent1.maxhp = opponent1.hp;
  opponent2.maxhp = opponent2.hp;
  opponent1.wins = stats1.wins;
  opponent2.wins = stats2.wins;
  opponent1.xp = stats1.xp;
  opponent2.xp = stats2.xp;
  opponent1.valtz = stats1.coins;
  opponent2.valtz = stats2.coins;
  opponent1.stats = stats1;
  opponent2.stats = stats2;
  opponent1.effectAllowed = true;
  opponent2.effectAllowed = true;
  opponent1.atk = Math.round(opponent1.atk + ((opponent1.lvl - 1) * 0.4));
  opponent2.atk = Math.round(opponent2.atk + ((opponent2.lvl - 1) * 0.4));
  opponent1.pmessage = message;
  opponent2.pmessage = message;
  opponent1.moveChosen = false;
  opponent2.moveChosen = false;
  opponent1.chosen = true;
  opponent2.chosen = true;
}

// Attach items to Beys if they exist
function attachItemsToBeys(client, stats1, stats2, opponent1, opponent2) {
  if (stats1.beys[stats1.main].attached) {
    opponent1.item = new (client.items.get(stats1.beys[stats1.main].attached.name))(stats1.beys[stats1.main].attached);
  }
  if (stats2.beys[stats2.main].attached) {
    opponent2.item = new (client.items.get(stats2.beys[stats2.main].attached.name))(stats2.beys[stats2.main].attached);
  }
  if (stats1.launcher !== "default") {
    opponent1.launcher = new (client.items.get(stats1.launcher.name))(stats1.launcher);
  }
  if (stats2.launcher !== "default") {
    opponent2.launcher = new (client.items.get(stats2.launcher.name))(stats2.launcher);
  }
}

module.exports.help = {
  name: "battlesystem"
};

