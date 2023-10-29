import Character from '../Character';

export default class Bowman extends Character {
  constructor(level, health = 100, type = 'bowman') {
    super(level, health);
    this.type = type;
    this.attack = 25;
    this.defence = 25;
    this.radiusAttack = 2;
    this.radiusStep = 2;
    for (let i = 1; i < this.level; i += 1) {
      this.attack = Math.max(this.attack, this.attack * ((80 + health) / 100));
      this.defence = Math.max(this.defence, this.defence * ((80 + health) / 100));
    }
  }
}
