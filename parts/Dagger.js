const Part = require("./Part.js");

class Dagger extends Part {
  constructor() {
    super(
      "Dagger",  // Name of the part
      "Disc Frame",  // Type (e.g., "Disc Frame")
      "https://vignette.wikia.nocookie.net/beyblade/images/2/22/FrameDagger.png/revision/latest?cb=20180713140309",  // Image URL
      { atk: 4 },  // Effects (attack: 4)
      { atk: 1, def: 0, stamina: 0 }  // Stats (attack: 1, defense: 0, stamina: 0)
    );
  }
}

module.exports = Dagger;
