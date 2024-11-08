const Item = require("./Item.js");

class Booster extends Item {
  constructor(boost, name, costinvaltz, costingv) {
    super(name, costinvaltz, costingv);
    this.boost = boost; // The boost object contains the boosts (valtz, exp, time)
    this.startTime = new Date(); // Store the time when the boost is applied
  }

  // Method to use the booster
  async use(client, message, args, prefix, iindex, db) {
    try {
      // Retrieve user's data from the database
      let stats = await db.collection("users").findOne({ _id: message.author.id });

      // Apply the boosts to the client
      if (this.boost.valtz) {
        client.valtzboost.set(message.author.id, { amt: this.boost.valtz, time: this.boost.time, start: this.startTime });
      }
      if (this.boost.exp) {
        client.expboost.set(message.author.id, { amt: this.boost.exp, time: this.boost.time, start: this.startTime });
      }

      // Remove the booster from user's inventory
      stats.items.splice(iindex, 1);
      await db.collection("users").updateOne({ _id: message.author.id }, { $set: { items: stats.items } });

      // Notify user that the boost has been applied
      message.channel.send(`Boost applied!`);

      // Set a timeout to remove the boost after the specified duration
      setTimeout(() => {
        // Clear the boosts after the specified time
        if (client.valtzboost.has(message.author.id)) {
          client.valtzboost.delete(message.author.id);
        }
        if (client.expboost.has(message.author.id)) {
          client.expboost.delete(message.author.id);
        }
      }, this.boost.time);

    } catch (error) {
      console.error("Error using booster:", error);
      message.channel.send("There was an error applying the boost.");
    }
  }
}

module.exports = Booster;
