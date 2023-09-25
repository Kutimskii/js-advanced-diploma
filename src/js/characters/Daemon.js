import Character from '../Character';

export default class Daemon extends Character {
  constructor(level, health = 100,type='daemon') {
    super(level, health);
    this.type = type;
    this.attack = 10;
    this.level = level;
    this.defence = 10;
    for (let i = 1; i < this.level; i += 1) {
      this.attack = Math.max(this.attack, this.attack * ((80 + health) / 100));
      this.defence = Math.max(this.defence, this.defence * ((80 + health) / 100));
    }
  }
}
