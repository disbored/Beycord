module.exports.run = async (client, message, args, prefix, player, db) => {
  let stats = await db.collection("users").findOne({ _id: message.author.id });

  // Check if the user provided an index
  if (!args[0]) return message.reply("please provide the index number of the item you wish to use.");

  // Retrieve the item from the user's inventory
  let itemi = stats.items[parseInt(args[0]) - 1];
  if (!itemi) return message.reply("no item found at that index.");

  // Get the item class from the client
  let itemc = client.items.get(itemi.name);
  if (!itemc) return message.reply("it looks like you got an unknown item. Please report it in the support server.");

  let item = new itemc(itemi);

  try {
    // Attempt to use the item
    let res = await item.use(client, message, args, prefix, player, db, parseInt(args[0]) - 1);

    // Provide feedback to the user after using the item
    if (res && res.success) {
      message.reply(`You successfully used ${itemi.name}!`);
    } else {
      message.reply("there was an issue using this item. Please try again or contact support.");
    }
  } catch (err) {
    // Catch any errors during item usage
    console.error(err);
    message.reply("an error occurred while trying to use the item. Please try again or contact support.");
  }
};

module.exports.help = {
  name: "use",
  aliases: ["useitem", "uitem"],
  desc: "Use an item from your inventory.",
  usage: "use <item index> - Use the item at the specified index in your inventory."
};
