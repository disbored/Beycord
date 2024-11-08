const Part = require("./Part.js");

class Absorb extends Part {
  constructor() {
    super(
      "Absorb",  // Name of the part
      "Driver",  // Type (e.g., "Driver")
      "https://vignette.wikia.nocookie.net/beyblade/images/3/37/DriverAbsorb.png/revision/latest?cb=20180914124001",  // Image URL
      { atk: 22 },  // Effects (attack: 22)
      { atk: 0, def: 0, stamina: 4 }  // Stats (attack: 0, defense: 0, stamina: 4)
    );
  }
}

module.exports = Absorb;
