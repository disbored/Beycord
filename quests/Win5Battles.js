const Quest = require("./Quest.js");

class Win5Battles extends Quest {
    constructor() {
        super("Win 5 battles", "<:giveawayticket:844766936146903040> 3");
        this.progress = 0;  // Tracks the number of battles won
    }

    // Update the progress of the quest each time a battle is won
    updateProgress(stats) {
        // Check if the player has won a battle
        if (stats.battlesWon) {
            this.progress += 1; // Increment the progress by 1 each time a battle is won

            if (this.progress >= 5) {
                this.complete();  // Mark the quest as completed once 5 battles are won
            }
        }
    }

    // Award the player with 3 tickets after completing the quest
    async award(stats, db, iindex) {
        try {
            // Remove the quest from the player's quest list
            stats.quests.splice(iindex, 1);

            // Find the 'Pocket' item in the player's inventory
            const pocket = stats.items.find(item => item.name === "Pocket");

            // If the player has a 'Pocket', award them 3 tickets
            if (pocket) {
                const pocketIndex = stats.items.indexOf(pocket);
                stats.items[pocketIndex].tickets += 3;  // Increment tickets by 3

                // Update the user's items and quests in the database
                await db.collection("users").updateOne(
                    { _id: stats._id },
                    { $set: { items: stats.items, quests: stats.quests } }
                );
            }
        } catch (error) {
            console.error("Error awarding 3 tickets:", error);
        }
    }
}

module.exports = Win5Battles;
