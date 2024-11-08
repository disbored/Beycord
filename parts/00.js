const Part = require("./Part.js");

class disc00 extends Part {
  constructor() {
    super(
      "00",  // Name of the part
      "Disc",  // Type (e.g., "Disc")
      "https://vignette.wikia.nocookie.net/beyblade/images/7/79/Disk00.png/revision/latest?cb=20181214204630",  // Image URL
      { atk: 22, dmgb: 32 },  // Effects (attack: 22, damage boost: 32)
      { atk: 5, def: 0, stamina: 1 }  // Stats (attack: 5, defense: 0, stamina: 1)
    );
  }
}

module.exports = disc00;
