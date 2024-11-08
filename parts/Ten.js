const Part = require("./Part.js");

class Ten extends Part {
  constructor() {
    super(
      "Ten",  // Name of the part
      "Layer Weight",  // Type (e.g., "Layer Weight")
      "https://vignette.wikia.nocookie.net/beyblade/images/3/30/LayerWeightTen.png/revision/latest?cb=20190315162715",  // Image URL
      { atk: 0, dmgb: 5 },  // Effects (attack: 0, damage boost: 5)
      { atk: 0, def: 2, stamina: 0 }  // Stats (attack: 0, defense: 2, stamina: 0)
    );
  }
}

module.exports = Ten;
