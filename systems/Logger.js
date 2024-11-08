let EventEmitter;

try {
    EventEmitter = require("eventemitter3");
} catch (err) {
    EventEmitter = require("events");
}

/**
 * Epic custom-coded logger designed for Beycord uses!
 * @extends EventEmitter
 */
class Logger extends EventEmitter {
    /**
     * Epic custom-coded logger designed for Beycord uses!
     */
    constructor() {
        super();
        this.logs = ["The battle started!"];
        this.createdAt = new Date();
        this.channel = {
            // A function to simulate sending a message and logging it
            send: (value) => {
                this.add("Something happened.");
            },
        };
    }

    /**
     * Log something.
     * @param {String} content The content to be logged.
     */
    add(content) {
        this.logs.push(content);

        // Keep the logs array size manageable by keeping only the last 5 logs
        if (this.logs.length > 5) {
            this.logs.shift();
        }
    }
}

module.exports = Logger;
