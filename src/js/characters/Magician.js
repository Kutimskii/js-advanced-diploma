import Character from '../Character';

export default class Magician extends Character {
  constructor(level, health = 100, type = 'magician') {
    super(level, health, type);
    this.type = type;
    this.attack = 10;
    this.defence = 40;
    this.radiusAttack = 4;
    this.radiusStep = 1;
    for (let i = 1; i < this.level; i += 1) {
      this.attack = Math.max(this.attack, this.attack * ((80 + health) / 100));
      this.defence = Math.max(this.defence, this.defence * ((80 + health) / 100));
    }
  }
}
