const Part = require("./Part.js");

class Variable extends Part {
  constructor() {
    super(
      "Variable",  // Name of the part
      "Driver",  // Type (e.g., "Driver", "Disc")
      "https://vignette.wikia.nocookie.net/beyblade/images/2/2e/DriverVariable.png/revision/latest?cb=20160714200155",  // Image URL
      { atk: 12 },  // Effects (attack boost)
      { atk: 2, def: 1, stamina: 0 }  // Stats (attack: 2, defense: 1, stamina: 0)
    );
  }
}

module.exports = Variable;
