const Quest = require("./Quest.js");

class LevelUpABeyOnce extends Quest {
    constructor() {
        // Calling the parent constructor with the quest name and rewards
        super("Level up a Bey once", "<:valtz:844765554237243403>25");
    }

    // Update progress based on leveling up a Bey
    updateProgress(stats) {
        // Check if the player's Bey has leveled up
        if (stats.beys[stats.main].level > 1) {
            // If the Bey has leveled up, update progress
            this.progress = 1; // Quest complete
            this.complete(); // Mark the quest as complete
        }
    }

    // Award method that grants the reward upon completion
    award(stats, db, iindex) {
        // Ensure progress is updated first
        this.updateProgress(stats);

        // If the quest is completed, award the reward
        if (this.completed) {
            stats.quests.splice(iindex, 1); // Remove the quest from the user's quest list
            db.collection("users").updateOne(
                { _id: stats._id },
                {
                    $set: {
                        coins: stats.coins + 25, // Add 25 coins for completing the quest
                        quests: stats.quests,    // Update the user's quest list
                    },
                },
                (err, res) => {
                    if (err) {
                        console.error("Error awarding quest:", err);
                    } else {
                        console.log(`Quest awarded! ${stats._id} received 25 coins.`);
                    }
                }
            );
        }
    }
}

module.exports = LevelUpABeyOnce;
