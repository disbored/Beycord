const Item = require("./Item.js");

class PremiumTicketsChest3 extends Item {
  constructor() {
    super("PremiumTicketsChest3", null, 1); // Constructor for PremiumTicketsChest3
  }

  async use(client, message, args, prefix, iindex, db) {
    // Fetch user data from the database
    let stats = await db.collection("users").findOne({ _id: message.author.id });

    // Find the first "Pocket" item in the user's inventory
    let pockets = stats.items.filter(item => item.name === "Pocket");

    // If the user has a "Pocket" item, update its premium value
    if (pockets.length > 0) {
      let pocketIndex = stats.items.indexOf(pockets[0]); // Find the index of the "Pocket" item
      stats.items[pocketIndex].premium += 3; // Add 3 to the premium value
      stats.items.splice(iindex, 1); // Remove the "PremiumTicketsChest3" item from the user's inventory

      // Update the user's inventory in the database
      db.collection("users").updateOne({ _id: message.author.id }, { $set: { items: stats.items } });

      // Send a success message to the user
      message.channel.send(`You acquired <:premiumgt:863052676077453372> 3 Premium Tickets!`);
    } else {
      // If the user doesn't have a "Pocket" item, inform them
      message.channel.send("You don't have a Pocket item to use the Premium Tickets Chest.");
    }
  }
}

module.exports = PremiumTicketsChest3;
