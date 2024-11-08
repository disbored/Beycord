const Part = require("./Part.js");

class Boost extends Part {
  constructor() {
    super(
      "Boost",  // Name of the part
      "Disc",  // Type (e.g., "Disc")
      "https://vignette.wikia.nocookie.net/beyblade/images/d/d0/DiskBoost.png/revision/latest?cb=20160714200100",  // Image URL
      { atk: 36 },  // Effects (attack: 36)
      { atk: 0, def: 0, stamina: 0 }  // Stats (attack: 0, defense: 0, stamina: 0)
    );
  }
}

module.exports = Boost;
