import Character from '../Character';

export default class Swordsman extends Character {
  constructor(level, health = 100, type = 'swordsman') {
    super(level, health, type);
    this.type = type;
    this.attack = 40;
    this.defence = 10;
    this.radiusAttack = 1;
    this.radiusStep = 4;
    for (let i = 1; i < this.level; i += 1) {
      this.attack = Math.max(this.attack, this.attack * ((80 + health) / 100));
      this.defence = Math.max(this.defence, this.defence * ((80 + health) / 100));
    }
  }
}
