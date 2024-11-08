const Part = require("./Part.js");

class Boost extends Part {
  constructor() {
    super(
      "Zenith",  // Name of the part
      "Disc",  // Type (e.g., "Driver", "Disc")
      "https://vignette.wikia.nocookie.net/beyblade/images/3/3e/DiskZenith.png/revision/latest?cb=20181115083207",  // Image URL
      { atk: 42 },  // Effects (attack boost)
      { atk: 5, def: 0, stamina: 0 }  // Stats (attack: 5, defense: 0, stamina: 0)
    );
  }
}

module.exports = Boost;
