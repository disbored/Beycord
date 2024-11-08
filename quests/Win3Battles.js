const Quest = require("./Quest.js");

class Win3Battles extends Quest {
    constructor() {
        super("Win 3 battles", "<:giveawayticket:844766936146903040> 2");
        this.progress = 0;  // Tracks the number of battles won
    }

    // Update the progress of the quest each time a battle is won
    updateProgress(stats) {
        // Check if the player has won a battle
        if (stats.battlesWon) {
            this.progress += 1; // Increment the progress by 1 each time a battle is won

            if (this.progress >= 3) {
                this.complete();  // Mark the quest as completed once 3 battles are won
            }
        }
    }

    // Award the player with 2 tickets after completing the quest
    async award(stats, db, iindex) {
        try {
            // Remove the quest from the player's quest list
            stats.quests.splice(iindex, 1);

            // Find the 'Pocket' item in the player's inventory
            const pocket = stats.items.find(item => item.name === "Pocket");

            // If the player has a 'Pocket', award them 2 tickets
            if (pocket) {
                const pocketIndex = stats.items.indexOf(pocket);
                stats.items[pocketIndex].tickets += 2;  // Increment tickets by 2

                // Update the user's items and quests in the database
                await db.collection("users").updateOne(
                    { _id: stats._id },
                    { $set: { items: stats.items, quests: stats.quests } }
                );
            }
        } catch (error) {
            console.error("Error awarding 2 tickets:", error);
        }
    }
}

module.exports = Win3Battles;
