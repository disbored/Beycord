const Part = require("./Part.js");

class Accel extends Part {
  constructor() {
    super(
      "Accel'",  // Name of the part
      "Driver",  // Type (e.g., "Driver")
      "https://vignette.wikia.nocookie.net/beyblade/images/a/a4/DriverAccel%27.png/revision/latest?cb=20181110115741",  // Image URL
      { atk: 20 },  // Effects (attack: 20)
      { atk: 4, def: 0, stamina: 0 }  // Stats (attack: 4, defense: 0, stamina: 0)
    );
  }
}

module.exports = Accel;
