class Quest {
    // Constructor to initialize quest details
    constructor(name, rewards) {
        this.name = name;          // Name of the quest
        this.completed = false;    // Tracks if the quest is completed
        this.rewards = rewards;    // Rewards associated with the quest
        this.progress = 0;         // Progress of the quest (can be updated by subclasses)
    }

    // Method to mark the quest as completed
    complete() {
        this.completed = true;
    }

    // Method to update quest progress (to be used by subclasses)
    updateProgress(amount) {
        if (this.completed) return; // Don't allow progress if quest is already completed
        this.progress += amount;
        if (this.progress >= 100) {  // Consider quest completed when progress reaches 100
            this.complete();
        }
    }
}

module.exports = Quest;
