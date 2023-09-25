import Character from '../Character';

export default class Vampire extends Character {
  constructor(level, health = 100,type= 'vampire') {
    super(level, health, type);
    this.type = type;
    this.attack = 25;
    this.level = level;
    this.defence = 25;
    for (let i = 1; i < this.level; i += 1) {
      this.attack = Math.max(this.attack, this.attack * ((80 + health) / 100));
      this.defence = Math.max(this.defence, this.defence * ((80 + health) / 100));
    }
  }
}
