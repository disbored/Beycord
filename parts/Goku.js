const Part = require("./Part.js");

class Goku extends Part {
  constructor() {
    super(
      "Goku",  // Name of the part
      "Layer Weight",  // Type (e.g., "Layer Weight")
      "https://vignette.wikia.nocookie.net/beyblade/images/5/5f/LayerWeightGoku.png/revision/latest?cb=20190808063116",  // Image URL
      { atk: 1 },  // Effects (attack: 1)
      { atk: 0, def: 0, stamina: 0 }  // Stats (attack: 0, defense: 0, stamina: 0)
    );
  }
}

module.exports = Goku;
