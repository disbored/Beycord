const Part = require("./Part.js");

class Zeta extends Part {
  constructor() {
    super(
      "Zeta",  // Name of the part
      "Driver",  // Type (e.g., "Driver", "Disc")
      "https://vignette.wikia.nocookie.net/beyblade/images/9/97/DriverZeta.png/revision/latest?cb=20171116103333", // Image URL
      { atk: 11 },  // Effects (attack boost)
      { atk: 2, def: 0, stamina: 0 }  // Stats (attack: 2, defense: 0, stamina: 0)
    );
  }
}

module.exports = Zeta;
