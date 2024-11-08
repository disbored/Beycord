class Item {
  constructor(name, costinvaltz, costingv) {
    this.name = name;
    this.civ = costinvaltz;
    this.cigv = costingv || null;
    if (costinvaltz === Infinity || isNaN(costinvaltz)) this.civ = null;
  }
}

module.exports = Item;
