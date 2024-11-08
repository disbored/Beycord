module.exports.run = async (client, message, args, prefix, player, db) => {
    // Fetch user data from the database
    let stats = await db.collection("users").findOne({ _id: message.author.id });

    // Check if the user is registered
    if (!stats) {
        return message.channel.send(`You don't need to do this command if you don't even have your data registered. Type \`${prefix}start\` to get yourself registered in Beycord.`);
    }

    // Check if 'states' object exists before updating
    if (!stats.states) {
        return message.channel.send("It looks like your data is incomplete. Please try again later.");
    }

    // Reset the user's states
    db.collection("users").updateOne({ _id: message.author.id }, {
        $set: { "states.inBattle": false, "states.isTrading": false, "states.isListing": false }
    });

    // Confirm the reset
    message.channel.send("Done! You should now be able to do commands once again.");
};

module.exports.help = {
    name: "resetstates",
    desc: "Reset your states data in case you are stuck in a battle or prompt.",
    usage: "resetstates - Does a thing said in the description.\n***IMPORTANT:*** If Beycord detects that you are actually still in the prompt or battle, Beycord will reset your data to its original (true) state.",
    cooldown: 600,
    aliases: ["resets"]
};
