const Fuse = require("fuse.js");

module.exports.run = async (client, message, args, prefix, player, db) => {
	// Collect Bey names, excluding "Buddy Bey"
	const beys = [];
	Array.from(client.beys.values()).forEach(b => {
		if (b !== client.beys.get("Buddy Bey")) {
			let be = new b();
			if (be.name) beys.push(be.name);
		}
	});

	// Initialize Fuse.js with a threshold of 0.4
	const fuse = new Fuse(beys, { threshold: 0.4 });

	// Check if a search query was provided
	if (!args[0]) {
		return message.reply("Please enter a word to search.");
	}

	// Perform the search
	let results = fuse.search(args.join(" "));
	if (!results.length) {
		return message.reply("No results found.");
	}

	// Format the results
	let result = `**Top search result:** \`${results[0].item}\``;
	if (results.length > 1) {
		result += "\n**Other matching results:**\n";
		results.slice(1).forEach(bey => result += `\`${bey.item}\`\n`);
	}

	// Send the results as a message
	message.channel.send(result);
};

module.exports.help = {
	name: "search",
	desc: "Search for a Bey using simple queries.",
	usage: "search <query> - Search for a Bey using a query.",
	aliases: []
};
