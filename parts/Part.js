class Part {
  constructor(name, type, image, effects, stats) {
    this.name = name;  // Name of the part (e.g., "Zeta")
    this.type = type;  // Type of the part (e.g., "Driver")
    this.effects = effects;  // Effects that this part has (e.g., attack boost)
    this.stats = stats;  // Stats associated with the part (e.g., attack, defense, stamina)
    this.image = image;  // URL of the image representing the part
  }
}

module.exports = Part;
