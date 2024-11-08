const Part = require("./Part.js");

class Angle extends Part {
  constructor() {
    super(
      "Angle",  // Name of the part
      "Disc Frame",  // Type (e.g., "Disc Frame")
      "https://vignette.wikia.nocookie.net/beyblade/images/a/a8/FrameAngle.png/revision/latest?cb=20181009194417",  // Image URL
      { atk: 6 },  // Effects (attack: 6)
      { atk: 2, def: 0, stamina: 0 }  // Stats (attack: 2, defense: 0, stamina: 0)
    );
  }
}

module.exports = Angle;
